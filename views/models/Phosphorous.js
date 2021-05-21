const mongoose = require('mongoose');
const { Schema } = mongoose;

const Point = require("./Point");
const pointSchema = mongoose.model("Point").schema;

// create a template for the table (layed out in the db schema)
const phosphorousSchema = new mongoose.Schema({
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
    phosphorus: {
        type: Number,
        required: true
    },
    location: {
        type: pointSchema,
        coordinates: []
    }
});

// assign it to a variable to create instances of the model
const phosphorous = mongoose.model('Phosphorous', phosphorousSchema);

module.exports = phosphorous;