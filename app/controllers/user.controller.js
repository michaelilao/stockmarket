const bcrypt = require('bcrypt');
const fetch = require('node-fetch')
const User = require('../models/user.model.js')
const API = require('../../config/api.keys')
const rounds = 10

exports.register = (req, res) => {
    if (!req.body) return res.status(400).send({
        message: "Missing data"
    });
    User.findOne({username: req.body.username}).then(user => {
        if(user) return res.status(404).json("User with that username already exists ")
        else {
            bcrypt.hash(req.body.password, rounds, (error,hash) => {
                if(error) return res.status(500).json(error)
                else {
                    const user = new User({
                        password: hash,
                        username: req.body.username,
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

    User.findOne({username: req.body.username}).then(user => {
        if(!user) return res.status(404).json("User with that username does not exist")
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
    const username = req.body.username
    if (balanceToAdd <= 0) return res.status(403).json({error: "Invalid Balacne"})
    else {
        const user = await User.findOneAndUpdate(username, {$inc: {balance: balanceToAdd}}, {
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
    const username = req.body.username
    const stockSymbol = req.body.symbol
    
    if(username == null || stockSymbol == null) return res.status(403).json({error: "Enter Valid User/Stock Symbol"})
    const user = await User.findOne({username})
    if(!user) return res.status(403).json({error: "User does not exist"})
    if(user.liverates && checkSubscribed(user, stockSymbol)) return res.status(200).json({user})
    else {
        const updatedUser = await User.findOneAndUpdate({username},{$push: { liverates: {symbol: stockSymbol}}}, {new:true})
        return res.status(200).json({updatedUser})
    }
}

const checkSubscribed = (user, symbol) => {
    if (user.liverates.some(stock => stock.symbol == symbol)) return true
    return false
}
exports.liverates = async(req,res) => {
    if (!req.params) return res.status(400).send({
        message: "Missing data"
    });
    const username = req.params.username
    if(username == null) return res.status(403).json({error: "Not a valid user"})
    try {
        const user = await User.findOne({username})
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
                if(rate["Global Quote"]) {
                    const symbol = rate['Global Quote']['01. symbol'] ? rate['Global Quote']['01. symbol']: 'Cannot get at this time'
                    const price = rate['Global Quote']['05. price'] ? rate['Global Quote']['05. price'] : 'Cannot get at this time'
                    return {symbol,price}
                }
                else return {symbol: 'Cannot get at this time', price: 'Cannot get at this time'}
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
    const username = req.params.username
    if(username == null) return res.status(400).send({message: "Missing data"});
    try {
        const user = await User.findOne({username})
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