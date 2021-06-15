const mongoose = require('mongoose');
const { Schema } = mongoose;
const Fish = require("./Fish");
const fishSchema = mongoose.model("Fish").schema;

// create a template for the table (layed out in the db schema)
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
    t_start: {
        type: String //Time is stored as a string
    },
    t_end: {
        type: String
    },
    elapsedTime: {
        type: String
    },
    fish: [fishSchema], //This is required to allow fish data to be submitted alongside an angler report
    fishCount: {
        type: Number,
        required: true
    }
});

// assign it to a variable to create instances of the model
const Angler_Report = mongoose.model('AnglerDiaries', anglerDiariesSchema);

module.exports = Angler_Report;
