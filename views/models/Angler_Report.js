// MongoDB Schema - Angler Report
//    creator - ObjectID linked to User Account - required
//    lake - String - required
//    municipality - String - required
//    angler_name - String - required
//    date - Date
//    t_start - String
//    t_end - String
//    elapsedTime - String
//    fish - [fishSchema]
//    fishCount - Number - Required

// Necessary imports, Mongoose / FishSchema
const mongoose = require('mongoose');
const { Schema } = mongoose;
const Fish = require("./Fish");
const fishSchema = mongoose.model("Fish").schema;

// define Angler Diary Schema
const anglerDiariesSchema = new mongoose.Schema({
    creator: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User_Account' //Allows you to reference fields found in the 'UserAccount' schema
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
        type: Date //Stored in UTC format
    },
    // Time inputs for fishing, stored as a string "0:00" / "00:00"
    t_start: {
        type: String
    },
    t_end: {
        type: String
    },
    // elapsedTime calculated on report submission
    elapsedTime: {
        type: String
    },
    //This is required to allow fish data to be submitted alongside an angler report, utilizes our MongoDB Fish Schema
    fish: [fishSchema],
    // fishCount is calculated upon report submission, hence why it's required but not an input
    fishCount: {
        type: Number,
        required: true
    }
});

// assign it to a variable to create instances of the model and export for use
const Angler_Report = mongoose.model('AnglerDiaries', anglerDiariesSchema);
module.exports = Angler_Report;
