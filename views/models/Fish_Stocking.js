const mongoose = require('mongoose');

// create a template for the table (layed out in the db schema)
const fishStockingSchema = new mongoose.Schema({
    id_pk: {
        type: Number,
        required: true
    },
    lake_town_fk: {
        type: String,
        required: true
    },
    WBY_LID_fk: {
        type: Number,
        required: true
    },
    official_name: {
        type: String
    },
    stocking_year: {
        type: Number
    },
    species: {
        type: String
    },
    mnrf_district: {
        type: String
    },
    unofficial_name: {
        type: String
    },
    developmental_stage: {
        type: String
    },
    number_of_fish: {
        type: Number
    }
});

// assign it to a variable to create instances of the model
const fishStocking = mongoose.model('fishStocking', fishStockingSchema);

module.exports = fishStocking;