const mongoose = require('mongoose');
const { Schema } = mongoose;

const Point = require("./Point");
const pointSchema = mongoose.model("Point").schema;

// create a template for the table (layed out in the db schema)
const doTempSchema = new mongoose.Schema({
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
    dissolvedOxygen: {
        type: Number
    },
    temperature: {
        type: Number
    },
    location: {
        type: pointSchema,
        coordinates: []
    },
    depth: {
        type: Number,
    }
});

// assign it to a variable to create instances of the model
const doTemp = mongoose.model('doTemp', doTempSchema);

module.exports = doTemp;