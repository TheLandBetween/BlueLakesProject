const mongoose = require('mongoose');

// create a template for the table (layed out in the db schema)
const GNE_TBL_1sqKmSchema = new mongoose.Schema({
    Lake_Town_pk: {
        type: String,
        required: true
    },
    Lake_Town_fk: {
        type: Number,
        required: true
    },
    geo_name: {
        type: String
    },
    geog_twp: {
        type: String
    },
    concise_c: {
        type: String
    },
    shape_starea: {
        type: Number
    },
    descr: {
        type: String
    },
    status_cd: {
        type: String
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    shape: {
        type: String
    },
    watershed: {
        type: Number
    },
    eff_date: {
        type: Date
    }
});

// assign it to a variable to create instances of the model
const GNE_TBL_1sqKm = mongoose.model('GNE_TBL_1sqKm', GNE_TBL_1sqKmSchema);

module.exports = GNE_TBL_1sqKm;