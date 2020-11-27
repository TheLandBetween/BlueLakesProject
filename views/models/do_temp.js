const mongoose = require('mongoose');

// create a template for the table (layed out in the db schema)
const doTempSchema = new mongoose.Schema({
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
    date: {
        type: Date
    },
    max_depth: {
        type: Number
    },
    temp_depth: {
        type: Number
    },
    do_conc: {
        type: Number
    },
    do_depth: {
        type: Number
    },

});

// assign it to a variable to create instances of the model
const doTemp = mongoose.model('doTemp', doTempSchema);

module.exports = doTemp;