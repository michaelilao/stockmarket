module.exports = (app) => {
    const stock = require('../controllers/stock.controller.js');

    app.get('/api/stock/getPrice', stock.getPrice);
    app.post('/api/stock/create', stock.createStock);


    app.patch('/api/stock/buy', stock.buyShare);
    app.patch('/api/stock/sell', stock.sellShare);
}