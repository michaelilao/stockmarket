const fetch = require('node-fetch')
const envConfig = require('../config/env.config.js');

const AMCDetails = {businessname: 'AMC Theatres', symbol: 'AMC', price: 20}
const GMEDetails = {businessname: 'Gamestop', symbol: 'GME', price: 300}


const createStock = async(stockDetails) => {
    const stock = await fetch('http://localhost:'+envConfig.port+'/api/stock/create', {
        method: 'POST',
        body: JSON.stringify(stockDetails),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())
    return stock
}

const getStock = async(stockDetails) => {
    const stock = await fetch('http://localhost:'+envConfig.port+'/api/stock/price/'+stockDetails.symbol).then(res => res.json())
    return stock
}


const test = async()=>{
    try {
        var AMC = await createStock(AMCDetails)
        console.log('AMC', AMC)

        var GME = await createStock(GMEDetails)
        console.log('GME', GME)

        var AMCPrice = await getStock(AMCDetails)
        console.log('AMC Price', AMCPrice)

        var GMEPrice = await getStock(GMEDetails)
        console.log('GME Price', GMEPrice)

    } catch (err){
        console.log(err)
    }
    
}

test()