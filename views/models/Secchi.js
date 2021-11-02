// MongoDB Schema - Single Secchi Depth Reading
//    report_fk - ObjectId - required
//    creator - ObjectId - required
//    secchi - Number - Required
//    location - PointSchema
//    depth - Number - required

// Necessary imports, Mongoose / Point Schema
const mongoose = require('mongoose');
const { Schema } = mongoose;
const Point = require("./Point");
const pointSchema = mongoose.model("Point").schema;

// define single Secchi reading schema
const secchiSchema = new mongoose.Schema({
    //Foreign key associated with the parent report
    report_fk: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Lake_Health_Report'
    },
    // key to link to submitters user account
    creator: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User_Account'
    },
    secchi: {
        type: Number,
        required: true
    },
    //Point schema which contains a x and y
    location: {
        type: pointSchema,
        coordinates: []
    },
    //Couldn't implement z as part of a GeoJSON point, so it is a separate Number field
    depth: {
        type: Number,
        required: true
    }
});

// assign it to a variable to create instances of the model & export for use elsewhere
const secchi = mongoose.model('Secchi', secchiSchema);
module.exports = secchi;
