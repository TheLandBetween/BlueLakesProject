const mongoose = require('mongoose');

// create a template for the table (layed out in the db schema)
const secchiSchema = new mongoose.Schema({
    id_pk: {
        type: Number,
        required: true
    },
    lake_town_fk: {
        type: String,
        required: true
    },
    approved: {
        type: String
    },
    average_s: {
        type: Number
    },
    stn: {
        type: Number
    }
});

// assign it to a variable to create instances of the model
const secchi = mongoose.model('secchi', secchiSchema);

module.exports = secchi;