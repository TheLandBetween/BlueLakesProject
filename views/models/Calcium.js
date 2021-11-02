// MongoDB Schema - Calcium Entry
//    report_fk - ObjectId - required
//    creator - ObjectId - required
//    calcium - Number - required
//    location - pointSchema

// Necessary imports, Mongoose / Point Schema
const mongoose = require('mongoose');
const { Schema } = mongoose;
const Point = require("./Point");
const pointSchema = mongoose.model("Point").schema;

// define Calcium Entry Schema
const calciumSchema = new mongoose.Schema({
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
    calcium: {
        type: Number,
        required: true
    },
    // use coordinate point schema defined as separate mongo schema
    location: {
        type: pointSchema,
        coordinates: []
    }
});

// assign it to a variable to create instances of the model & export for use elsewhere
const Calcium = mongoose.model('Calcium', calciumSchema);
module.exports = Calcium;
