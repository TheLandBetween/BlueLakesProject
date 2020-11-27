const mongoose = require('mongoose');

// create a template for the table (layed out in the db schema)
const lakesDBSchema = new mongoose.Schema({
    WBY_LID: {
        type: Number,
        required: true
    },
    lake_town_fk: {
        type: String,
        required: true
    },
    official_lake_name: {
        type: String
    },
    stocked: {
        type: Boolean
    },
    unofficial_name: {
        type: String
    }
});

// assign it to a variable to create instances of the model
const LakesDB = mongoose.model('LakesDB', lakesDBSchema);

module.exports = LakesDB;