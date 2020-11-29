const mongoose = require('mongoose');

// create a template for the table (layed out in the db schema)
const accountSchema = new mongoose.Schema({
    email_pk: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    name: {
        type: String,
    },
    date_created: {
        type: Date,
    },
    favorites: {
        type: Number,
    }
});

// assign it to a variable to create instances of the model
const User_Account = mongoose.model('Account', accountSchema);

module.exports = User_Account;