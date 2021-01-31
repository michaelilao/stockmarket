const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);

const dbConfig = require('./config/db.config.js');


const PORT = 8080;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }))

app.use(bodyParser.json())
const userRoutes = require('./app/routes/user.routes.js')(app);
const stockRoutes = require('./app/routes/stock.routes.js')(app);

app.get('/', (req, res) => {
    res.json({"message": "Welcome to the stock market application"});
});
app.listen(PORT, () => {
    console.log("Server is listening on port "+PORT);
});


mongoose.connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});