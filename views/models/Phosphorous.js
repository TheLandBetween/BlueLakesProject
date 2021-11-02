// MongoDB Schema - Single Phosphorous Reading
//    report_fk - ObjectId - required
//    creator - ObjectId - required
//    phosphorous - Number - Required
//    location - PointSchema

// Necessary imports, Mongoose / Point Schema
const mongoose = require('mongoose');
const { Schema } = mongoose;

const Point = require("./Point");
const pointSchema = mongoose.model("Point").schema;

// define phosphorous entry schema
const phosphorousSchema = new mongoose.Schema({
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
    phosphorus: {
        type: Number,
        required: true
    },
    location: {
        type: pointSchema,
        coordinates: []
    }
});

// assign it to a variable to create instances of the model & export for use elsewhere
const phosphorous = mongoose.model('Phosphorous', phosphorousSchema);
module.exports = phosphorous;
