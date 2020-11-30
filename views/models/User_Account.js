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
        required:true
    },
    display_name: {
        type: String,
        required: true
    },
    date_created: {
        type: Date,
    },
    favorites: {
        type: Number,
    },
    // equivalent to rank i think
    permissions: {
        type: Number,
        default: 0,
        enum: [0,1,2,3] //Permission levels: 0(guest), 1(angler), 2(lake health), 3(administrator)
    },
    upgrade_code: {
        type: Number
    }
});

// assign it to a variable to create instances of the model
const User_Account = mongoose.model('Account', accountSchema);

module.exports = User_Account;
