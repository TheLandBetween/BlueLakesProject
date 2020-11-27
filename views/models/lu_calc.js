const mongoose = require('mongoose');

// create a template for the table (layed out in the db schema)
const luCalcSchema = new mongoose.Schema({
    WBY_LID_pk: {
        type: Number,
        required: true
    },
    shape: {
        type: String
    },
    eff_nat_perc: {
        type: Number
    },
    check: {
        type: String
    },
    perc_nat: {
        type: Number
    },
    perc_wat: {
        type: Number
    },
    perc_unat: {
        type: Number
    },
    perc_unkn: {
        type: Number
    },
    shape_starea: {
        type: Number
    },
    shape_stlength: {
        type: Number
    },
});

// assign it to a variable to create instances of the model
const luCalc = mongoose.model('luCalc', luCalcSchema);

module.exports = luCalc;