const mongoose = require('mongoose');

// create a template for the table (layed out in the db schema)
const accountSchema = new mongoose.Schema({
    username_pk: {
        type: Number,
        required: true
    },
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    date_created: {
        type: Date,
    },
    favorites: {
        type: Number,
    },
    rank: {
        type: String,
    },
    password: {
        type: String,
    }
});

// assign it to a variable to create instances of the model
const Account = mongoose.model('Account', accountSchema);

module.exports = Account;