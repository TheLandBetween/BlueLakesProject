// MongoDB Schema - Single Fish Entry
//    report_fk - ObjectId - required
//    creator - ObjectId - required
//    species - String - required
//    length - Number
//    weight - Number
//    photo - {url: String, filename: String}

// Necessary imports, Mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;

// define Single Fish Entry Schema
const fishSchema = new mongoose.Schema({
    //Foreign key associated with the parent report
    report_fk: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Angler_Report'
    },
    // creator key associated to the account who submitted report
    creator: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User_Account'
    },
    species: {
        type: String,
        required: true
    },
    length: {
        type: Number
    },
    weight: {
        type: Number
    },
    photo: [
        {
            url: String,
            filename: String
        }
    ]
});

// assign it to a variable to create instances of the model & export for use elsewhere
const Fish = mongoose.model('Fish', fishSchema);
module.exports = Fish;
