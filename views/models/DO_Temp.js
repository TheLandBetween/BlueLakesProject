// MongoDB Schema - Dissolved Oxygen Temperature Entry
//    report_fk - ObjectId - required
//    creator - ObjectId - required
//    dissolvedOxygen - Number - required
//    temperature - Number - required
//    location - pointSchema
//    depth - Number - required

// Necessary imports, Mongoose / Point Schema
const mongoose = require('mongoose');
const { Schema } = mongoose;
const Point = require("./Point");
const pointSchema = mongoose.model("Point").schema;

// define Dissolved Oxygen Temperature Entry Schema
const doTempSchema = new mongoose.Schema({
    //Foreign key associated with the parent report
    report_fk: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Lake_Health_Report'
    },
    // creator key associated to the account who submitted report
    creator: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User_Account'
    },
    dissolvedOxygen: {
        type: Number,
        required: true
    },
    temperature: {
        type: Number,
        required: true
    },
    // use coordinate point schema defined as separate mongo schema
    location: {
        type: pointSchema,
        coordinates: []
    },
    depth: {
        type: Number,
        required: true
    }
});

// assign it to a variable to create instances of the model & export
const doTemp = mongoose.model('doTemp', doTempSchema);
module.exports = doTemp;
