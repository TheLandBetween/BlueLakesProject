const mongoose = require('mongoose');

// create a template for the table (layed out in the db schema)
const ltLakesSchema = new mongoose.Schema({
    WBY_LID_pk: {
        type: Number,
        required: true
    },
    lake_town_fk: {
        type: String,
        required: true
    },
    geographic_township_fk: {
        type: String,
        required: true
    },
    official_lake_name: {
        type: String
    },
    lat_dd: {
        type: Number
    },
    long_dd: {
        type: Number
    },
    unofficial_lake_name: {
        type: String
    },
    unofficial_township: {
        type: String
    },
    omnr_district: {
        type: String
    },
    longitude: {
        type: Number
    },
    latitude: {
        type: Number
    },
    Status: {
        type: String
    }
});

// assign it to a variable to create instances of the model
const ltLakes = mongoose.model('ltLakes', ltLakesSchema);

module.exports = ltLakes;