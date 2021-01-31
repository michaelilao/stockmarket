const Stock = require('../models/stock.model.js')
const User = require('../models/user.model.js')

exports.getPrice = (req, res) => {
    if(!req.body) {
        return res.status(400).send({
            message: "Stock content can not be empty"
        });
    }
    Stock.findOne(({$or:[{businessname: req.body.businessname},{symbol:req.body.symbol}]})).then(stock => {
        if(!stock) return res.status(404).json("Stock with that name or symbol does not exist")
        else return res.status(200).json({stock})
    })
}

exports.createStock = (req, res) => {
    if(!req.body) {
        return res.status(400).send({
            message: "Stock content can not be empty"
        });
    }
  
    Stock.findOne({businessname: req.body.businessname}).then(stock => {
        if(stock) return res.status(403).json("Stock with that name already exists")
        else {
            const stock = new Stock({
                businessname: req.body.businessname,
                symbol: req.body.symbol,
                price: req.body.price,
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
    const email = req.body.email
    const stockSymbol = req.body.symbol
    const stock = await Stock.findOne({symbol: stockSymbol})
    const user = await User.findOne({email})
    if(!user) return res.status(404).send({error: "User with that email does not exist"})
    else if(!stock) return res.status(404).send({error: "Stock with that symbol does not exist"})
    else if(stock.price > user.balance) return res.status(403).send({error: "User has insufficient funds to purchase this stock"})
    else {
        user.balance -= stock.price
        const newShare = {
            symbol: stock.symbol,
            price: stock.price
        }
        User.findOneAndUpdate(user.email, {balance: user.balance,$push: { shares: newShare}, }, {
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
    const email = req.body.email
    const stockSymbol = req.body.symbol
    const stock = await Stock.findOne({symbol: stockSymbol})
    const user = await User.findOne({email})
    if(!user) res.status(404).send({error:"User with that email does not exist"})
    else if(!stock) res.status(404).send({error:"Stock with that symbol does not exist"})
    else {
        const firstShare = user.shares.find(stock => stock.symbol == stockSymbol)
        if(firstShare == null) res.status(403).send({error: "User does not own this stock"})
        else {
            User.findOneAndUpdate(user.email, {$inc:{balance:firstShare.price},$pull: { shares: { _id: firstShare._id} } }, {
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

