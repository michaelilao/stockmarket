module.exports = (app) => {
    const user = require('../controllers/user.controller.js')

    app.post('/api/user/register', user.register)
    app.post('/api/user/login', user.login)

    app.put('/api/user/addbalance',user.addbalance)

    app.patch('/api/user/subscribe', user.subscribe)
    app.get('/api/user/:username/liverates', user.liverates)
    app.get('/api/user/:username/portfolio', user.getPortfolio)

}