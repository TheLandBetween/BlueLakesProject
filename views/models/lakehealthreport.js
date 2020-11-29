const mongoose = require('mongoose');

// create a template for the table (layed out in the db schema)
const lakeHealthReportSchema = new mongoose.Schema({
    Date_Generated: {
        type: String
    },
    Status: {
        type: String
    },
    Summary: {
        type: String
    },
    Level_of_Concern: {
        type: Number,
        min: 0
        // if we wanted to do only between 0 and 10, would setup this way
        // enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    },
    Perc_Shore_Devd: {
        type: Number
    },
    Avg_Temp: {
        type: Number
    },
    Avg_DO_Conc: {
        type: Number
    },
    Avg_Secchi_Depth: {
        type: Number
    },
    Avg_Phosph: {
        type: Number
    }
});

// assign it to a variable to create instances of the model
const LakeHealthReport = mongoose.model('LakeHealthReport', lakeHealthReportSchema);

module.exports = LakeHealthReport;
