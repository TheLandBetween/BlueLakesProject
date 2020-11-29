const mongoose = require('mongoose');

// create a template for the table (layed out in the db schema)
const lakeHealthReportSchema = new mongoose.Schema({
    date_generated: {
        type: String
    },
    status: {
        type: String
    },
    summary: {
        type: String
    },
    level_of_concern: {
        type: Number,
        min: 0
        // if we wanted to do only between 0 and 10, would setup this way
        // enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    },
    perc_shore_devd: {
        type: Number
    },
    avg_temp: {
        type: Number
    },
    avg_do_conc: {
        type: Number
    },
    avg_secchi_depth: {
        type: Number
    },
    avg_phosph: {
        type: Number
    }
});

// assign it to a variable to create instances of the model
const Lake_Health_Report = mongoose.model('LakeHealthReport', lakeHealthReportSchema);

module.exports = Lake_Health_Report;
