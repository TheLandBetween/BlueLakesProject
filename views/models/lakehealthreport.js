const mongoose = require('mongoose');

// create a template for the table (layed out in the db schema)
const lakeHealthReportSchema = new mongoose.Schema({
    WBY_LID: {
        type: Number,
        required: true
    },
    Date_Generated: {
        type: String,
        required: String
    },
    Status: {
        type: String,
        required: true
    },
    Summary: {
        type: String,
        required: true
    },
    Level_of_Concern: {
        type: Number,
        required: true,
        min: 0,
        // if we wanted to do only between 0 and 10, would setup this way
        // enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    },
    Perc_Shore_Devd: {
        type: Number,
        required: true
    },
    Avg_Temp: {
        type: Number,
        required: true
    },
    Avg_DO_Conc: {
        type: Number,
        required: true
    },
    Avg_Secchi_Depth: {
        type: Number,
        required: true
    },
    Avg_Phosph: {
        type: Number,
        required: true
    }
});

// assign it to a variable to create instances of the model
const LakeHealthReport = mongoose.model('LakeHealthReport', lakeHealthReportSchema);

module.exports = LakeHealthReport;
