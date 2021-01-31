const fetch = require('node-fetch')
const envConfig = require('../config/env.config.js');

const userDetails = {username: 'michaelilao', password: '12345', value: 1000}

const AMCDetails = {businessname: 'AMC Theatres', symbol: 'AMC', price: 20}
const GMEDetails = {businessname: 'Gamestop', symbol: 'GME', price: 300}
const IBMDetails = {businessname: 'IBM', symbol: 'IBM'}


const registerUser = async() => {
    const user = await fetch('http://localhost:'+envConfig.port+'/api/user/register', {
        method: 'POST',
        body: JSON.stringify(userDetails),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())
    return user
}

const loginUser = async() => {
    const user = await fetch('http://localhost:'+envConfig.port+'/api/user/login', {
        method: 'POST',
        body: JSON.stringify(userDetails),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())
    return user
}

const addBalanceToUser = async() => {
    const user = await fetch('http://localhost:'+envConfig.port+'/api/user/addbalance', {
        method: 'PUT',
        body: JSON.stringify(userDetails),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())
    return user
}


const buyStock = async(stockDetails) => {
    const user = await fetch('http://localhost:'+envConfig.port+'/api/stock/buy', {
        method: 'PATCH',
        body: JSON.stringify({username:userDetails.username, symbol: stockDetails.symbol}),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())
    return user
}


const sellStock = async(stockDetails) => {
    const user = await fetch('http://localhost:'+envConfig.port+'/api/stock/sell', {
        method: 'PATCH',
        body: JSON.stringify({username:userDetails.username, symbol: stockDetails.symbol}),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())
    return user
}

const getPortfolio = async() => {
    const portfolio = await fetch('http://localhost:'+envConfig.port+'/api/user/'+userDetails.username+'/portfolio').then(res => res.json())
    return portfolio
}

const subscribe = async(stockDetails) => {
    const user = await fetch('http://localhost:'+envConfig.port+'/api/user/subscribe', {
        method: 'PATCH',
        body: JSON.stringify({username:userDetails.username, symbol: stockDetails.symbol}),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())
    return user
}

const liverates = async() => {
    const rates = await fetch('http://localhost:'+envConfig.port+'/api/user/'+userDetails.username+'/liverates').then(res => res.json())
    return rates
}
const test = async()=>{
    var user = await registerUser()
    console.log('Register', user)

    var user = await loginUser()
    console.log('Login')

    var user = await addBalanceToUser()
    console.log('AddBalance')

    var portfolio = await getPortfolio()
    console.log('Portfolio', portfolio)

    
    var user = await buyStock(AMCDetails)
    console.log('Bought AMC')

    var user = await buyStock(GMEDetails)
    console.log('Bought GME')

    var user = await sellStock(GMEDetails)
    console.log('Sold GME')

    var portfolio = await getPortfolio()
    console.log('Portfolio', portfolio)

    var user = await subscribe(AMCDetails)
    console.log('Subscribed to AMC')

    var user = await subscribe(IBMDetails)
    console.log('Subscribed to IBM')

    var user = await subscribe(GMEDetails)
    console.log('Subscribed to GME')
    
    var rates = await liverates()
    console.log('Liverates', rates)
}

test()