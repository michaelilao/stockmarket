const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    password: {
        type: String,
        require: true,
    },
    username: {
        type: String,
        require: true,
    },
    balance: {
        type: Number,
        require: true,
    },
    shares: [{
        symbol: String,
        price: Number,
    }],
    liverates: [{
        symbol: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);