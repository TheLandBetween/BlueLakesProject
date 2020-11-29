const mongoose = require('mongoose');

// create a template for the table (layed out in the db schema)
const anglerDiariesSchema = new mongoose.Schema({
    diary_id_pk: {
        type: Number,
        required: true
    },
    lake_town_fk: { //Should it be the town name, or the lake itself?
        type: String,
        required: true
    },
    angler_name_fk: {
        type: String,
        required: true
    },
    approved: {
        type: String
    },
    date: {
        type: Date
    },
    t_start: {
        type: Date
    },
    t_end: {
        type: Date
    },
    species: {
        type: String
    },
    length: {
        type: Number
    },
    weight: {
        type: Number
    }
});

// assign it to a variable to create instances of the model
const Angler_Diaries = mongoose.model('AnglerDiaries', anglerDiariesSchema);

module.exports = Angler_Diaries;