const bcrypt = require('bcrypt');
const fetch = require('node-fetch')
const User = require('../models/user.model.js')
const API = require('../../config/api.keys')
const rounds = 10

exports.register = (req, res) => {
    if (!req.body) return res.status(400).send({
        message: "Missing data"
    });
    User.findOne({email: req.body.email}).then(user => {
        if(user) return res.status(404).json("User with that email already exists ")
        else {
            bcrypt.hash(req.body.password, rounds, (error,hash) => {
                if(error) return res.status(500).json(error)
                else {
                    const user = new User({
                        password: hash,
                        email: req.body.email,
                        balance: 0,
                    });
                    user.save().then(data => {
                        return res.send(data);
                    }).catch(err => {
                        return res.status(500).send({
                            message: err.message || "Some error occurred while creating the User."
                        });
                    });
                }
            })        
        }
    })
};
    

exports.login = (req, res) => {
    if (!req.body) return res.status(400).send({
        message: "Missing data"
    });

    User.findOne({email: req.body.email}).then(user => {
        if(!user) return res.status(404).json("User with that email does not exist")
        else {
            bcrypt.compare(req.body.password, user.password, (error, match) => {
                if (error) return res.status(500).json(error)
                else if (match) return res.status(200).json({user})
                else return res.status(403).json({error: "Incorrect password"})
            })
        }
    })
};


exports.addbalance = async (req, res) => {
    if (!req.body) return res.status(400).send({
        message: "Missing data"
    });
    const balanceToAdd = req.body.value
    const email = req.body.email
    if (balanceToAdd <= 0) return res.status(403).json({error: "Invalid Balacne"})
    else {
        const user = await User.findOneAndUpdate(email, {$inc: {balance: balanceToAdd}}, {
            new: true
        });
        if(!user) return res.status(403).json({error: "Could not find User"})
        else return res.status(200).json({user})
    }
};

exports.subscribe = async (req,res) => {
    if (!req.body) return res.status(400).send({
        message: "Missing data"
    });
    const email = req.body.email
    const stockSymbol = req.body.symbol
    
    if(email == null || stockSymbol == null) return res.status(403).json({error: "Enter Valid User/Stock Symbol"})
    const user = await User.findOne({email})
    if(!user) return res.status(403).json({error: "User does not exist"})
    else {
        const updatedUser = await User.findOneAndUpdate({email},{$push: { liverates: {symbol: stockSymbol}}}, {new:true})
        return res.status(200).json({updatedUser})
    }
}

exports.liverates = async(req,res) => {
    if (!req.body) return res.status(400).send({
        message: "Missing data"
    });
    const email = req.body.email
    if(email == null) return res.status(403).json({error: "Not a valid user"})
    try {
        const user = await User.findOne({email})
        const subscribedRates = user.liverates
        if(subscribedRates.length < 1) return res.status(200).json({message: "User is not subscribed to any stocks"})
        const promises = subscribedRates.map(stock => (`${API.alpha.url}GLOBAL_QUOTE&symbol=${stock.symbol}&apikey=${API.alpha.key}`));
        Promise.all(
            promises.map(url => 
                fetch(url)
                .then(response => response.json())
                .catch(err => console.error(err))
            )
        ).then(rates => {
            const liverates = rates.map(rate => {
                const symbol = rate["Global Quote"]['01. symbol']
                const price = rate["Global Quote"]['05. price']
                return {symbol,price}
            });
            return res.status(200).json({liverates})
        });    
    } catch(err){
        return res.status(403).send({message: "User does not exist"});
    }
}

exports.getPortfolio = async (req,res) => {
    if (!req.params) return res.status(400).send({
        message: "Missing data"
    });
    const email = req.body.email
    if(email == null) return res.status(400).send({message: "Missing data"});
    try {
        const user = await User.findOne({email})
        var shareBalance = 0
        var shareListings = {}
        if(!user) return res.status(403).send({error: "This user does not exist"})
        if(user.shares && user.shares.length > 0) {
            user.shares.forEach(share => {
                shareBalance += share.price
                if(!shareListings[share.symbol]) shareListings[share.symbol] = 1
                else shareListings[share.symbol] += 1
            })
        }
        return res.status(200).json({
            balance: user.balance,
            shares : shareListings,
            totalValue: shareBalance + user.balance
        })
    } catch(err) {
        return res.status(403).send({error: "This user does not exist"})
    }
}