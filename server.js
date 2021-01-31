const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);

const dbConfig = require('./config/db.config.js');
const envConfig = require('./config/env.config.js');

const app = express();



app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.get('/', (req, res) => {
    res.json({"message": "Welcome to the stock market application"});
});
app.listen(envConfig.port, () => {
    console.log("Server is listening on port "+ envConfig.port);
});

const userRoutes = require('./app/routes/user.routes.js')(app);
const stockRoutes = require('./app/routes/stock.routes.js')(app);


mongoose.connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

