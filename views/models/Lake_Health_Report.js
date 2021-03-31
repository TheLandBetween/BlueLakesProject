const mongoose = require('mongoose');
const { Schema } = mongoose;

const DissolvedOxygenTemperature = require("./DO_Temp");
const Secchi = require("./Secchi");
const Phosphorous = require("./Phosphorous");
const Calcium = require("./Calcium");

const doTempSchema = mongoose.model("doTemp").schema;
const secchiSchema = mongoose.model("Secchi").schema;
const phosphorousSchema = mongoose.model("Phosphorous").schema;
const calciumSchema = mongoose.model("Calcium").schema;

// create a template for the table (layed out in the db schema)
const lakeHealthReportSchema = new Schema({
    creator: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User_Account'
    },
    date_generated: {
        type: Date
    },
    notes: {
        type: String
    },
    level_of_concern: {
        type: Number,
        min: 0
    },
    perc_shore_devd: {
        type: Number
    },
    doTemp: [doTempSchema],
    secchi_depth: [secchiSchema],
    phosphorus: [phosphorousSchema],
    calcium: [calciumSchema]
});

// assign it to a variable to create instances of the model
const Lake_Health_Report = mongoose.model('LakeHealthReport', lakeHealthReportSchema);

module.exports = Lake_Health_Report;
