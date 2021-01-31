const Stock = require('../models/stock.model.js')
const User = require('../models/user.model.js')
const API = require('../../config/api.keys')

const fetch = require('node-fetch')

exports.getPrice = (req, res) => {
    
    if(!req.params) {
        return res.status(400).send({
            message: "Stock content can not be empty"
        });
    }
    if(req.params.symbol == null) return res.status(400).send({ message: "Stock content can not be empty"});
    const stockSymbol = req.params.symbol
    Stock.findOne({symbol: stockSymbol}).then(stock => {
        if(!stock) return res.status(404).json("Stock with that name or symbol does not exist")
        else return res.status(200).json({stock})
    })
}

exports.createStock = async(req, res) => {
    if(!req.body) {
        return res.status(400).send({
            message: "Stock content can not be empty"
        });
    }
    const stockSymbol = req.body.symbol
    let price
    try {
        const priceReq = await fetch(`${API.alpha.url}GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${API.alpha.key}`).then(res => res.json())
        price = priceReq['Global Quote']['05. price']
    } catch (err){
        console.log("Could not live fetch price")
        price = req.body.price
    }
    Stock.findOne({symbol: stockSymbol}).then(stock => {
        if(stock) return res.status(403).json("Stock with that name already exists")
        else {
            const stock = new Stock({
                symbol: stockSymbol,
                price,
            });
            
            if(stock.price <= 0) res.status(403).json({error: "Stock price cannot be less than 0"})
            else {
                stock.save().then(data => {
                    res.send(data);
                }).catch(err => {
                    return res.status(500).send({
                        message: err.message || "Some error occurred while creating the Stock."
                    });
                });
            }
        }
    });
}


exports.buyShare = async (req, res) => {
    if(!req.body) {
        return res.status(400).send({
            message: "Share content can not be empty"
        });
    }
    const username = req.body.username
    const stockSymbol = req.body.symbol
    const stock = await Stock.findOne({symbol: stockSymbol})
    const user = await User.findOne({username})
    if(!user) return res.status(404).send({error: "User with that username does not exist"})
    else if(!stock) return res.status(404).send({error: "Stock with that symbol does not exist"})
    else if(stock.price > user.balance) return res.status(403).send({error: "User has insufficient funds to purchase this stock"})
    else {
        user.balance -= stock.price
        const newShare = {
            symbol: stock.symbol,
            price: stock.price
        }
        User.findOneAndUpdate(user.username, {balance: user.balance,$push: { shares: newShare}, }, {
            new: true
        }).then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the User."
            });
        });
    }
}




exports.sellShare = async (req, res) => {
    if(!req.body) {
        return res.status(400).send({
            message: "Share content can not be empty"
        });
    }
    const username = req.body.username
    const stockSymbol = req.body.symbol
    const stock = await Stock.findOne({symbol: stockSymbol})
    const user = await User.findOne({username})
    if(!user) res.status(404).send({error:"User with that username does not exist"})
    else if(!stock) res.status(404).send({error:"Stock with that symbol does not exist"})
    else {
        const firstShare = user.shares.find(stock => stock.symbol == stockSymbol)
        if(firstShare == null) res.status(403).send({error: "User does not own this stock"})
        else {
            User.findOneAndUpdate(user.username, {$inc:{balance:firstShare.price},$pull: { shares: { _id: firstShare._id} } }, {
                new: true
            }).then(data => {
                res.send(data);
            }).catch(err => {
                return res.status(500).send({
                    message: err.message || "Some error occurred while creating the User."
                });
            });
        }
    }
}

