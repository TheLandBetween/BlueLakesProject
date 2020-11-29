const mongoose = require('mongoose');

// create a template for the table (layed out in the db schema)
const phosphorousSchema = new mongoose.Schema({
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
    average_p: {
        type: Number
    },
    stn: {
        type: Number
    }
});

// assign it to a variable to create instances of the model
const phosphorous = mongoose.model('phosphorous', phosphorousSchema);

module.exports = phosphorous;