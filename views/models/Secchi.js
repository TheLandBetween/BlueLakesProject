const mongoose = require('mongoose');
const { Schema } = mongoose;

const Point = require("./Point");
const pointSchema = mongoose.model("Point").schema;

// create a template for the table (layed out in the db schema)
const secchiSchema = new mongoose.Schema({
    report_fk: { //Foreign key associated with the parent report
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
    location: { //Point schema which contains a x and y
        type: pointSchema,
        coordinates: []
    },
    depth: { //Couldn't implement z as part of a GeoJSON point, so it is a separate Number field
        type: Number,
        required: true
    }
});

// assign it to a variable to create instances of the model
const secchi = mongoose.model('Secchi', secchiSchema);

module.exports = secchi;