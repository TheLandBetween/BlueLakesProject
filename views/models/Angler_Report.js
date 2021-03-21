const mongoose = require('mongoose');
const { Schema } = mongoose;

// create a template for the table (layed out in the db schema)
const anglerDiariesSchema = new mongoose.Schema({
    creator: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User_Account'
    },
    lake: {
        type: String,
        required: true
    },
    municipality: {
        type: String,
        required: true
    },
    angler_name: {
        type: String,
        required: true
    },
    date: {
        type: Date
    },
    t_start: {
        type: String
    },
    t_end: {
        type: String
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
const Angler_Report = mongoose.model('AnglerDiaries', anglerDiariesSchema);

module.exports = Angler_Report;