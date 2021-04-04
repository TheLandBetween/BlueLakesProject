const mongoose = require('mongoose');
const { Schema } = mongoose;

const Point = require("./Point");
const pointSchema = mongoose.model("Point").schema;

// create a template for the table (layed out in the db schema)
const secchiSchema = new mongoose.Schema({
    report_fk: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Lake_Health_Report'
    },
    creator: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User_Account'
    },
    secchi: {
        type: Number,
        required: true
    },
    location: {
        type: pointSchema,
        coordinates: []
    },
    depth: {
        type: Number,
        required: true
    }
});

// assign it to a variable to create instances of the model
const secchi = mongoose.model('Secchi', secchiSchema);

module.exports = secchi;