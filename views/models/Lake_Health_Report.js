// MongoDB Schema - Dissolved Oxygen Temperature Entry
//    creator - ObjectId - required
//    date_generated - Date
//    notes - String
//    level_of_concern - Number - Not implemented yet
//    perc_shore_devd - Number - I dont know what this is
//    doTemp - Dissolved Oxygen Temperature Schema
//    secchi_depth - Secchi Depth entry schema
//    phosphorous - Phosphorous entry schema
//    calcium - Calcium entry schema

// Necessary imports, Mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Import other mongo models to be used inside of this lake health report, and assign them to var's
// Dissolved Oxygen
const DissolvedOxygenTemperature = require("./DO_Temp");
const doTempSchema = mongoose.model("doTemp").schema;
// Secchi Depth
const Secchi = require("./Secchi");
const secchiSchema = mongoose.model("Secchi").schema;
// Phosphorous
const Phosphorous = require("./Phosphorous");
const phosphorousSchema = mongoose.model("Phosphorous").schema;
// Calcium
const Calcium = require("./Calcium");
const calciumSchema = mongoose.model("Calcium").schema;


// define Lake Health Report Entry Schema
const lakeHealthReportSchema = new Schema({
    //Foreign key associated with the parent report
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

// assign it to a variable to create instances of the model & export for future use
const Lake_Health_Report = mongoose.model('LakeHealthReport', lakeHealthReportSchema);
module.exports = Lake_Health_Report;
