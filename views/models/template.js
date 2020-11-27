const mongoose = require('mongoose');

// create a template for the table (layed out in the db schema)
const lakeHealthReportSchema = new mongoose.Schema({
    WBY_LID: {
        type: Number,
        required: true
    },
});

// assign it to a variable to create instances of the model
const LakeHealthReport = mongoose.model('LakeHealthReport', lakeHealthReportSchema);

module.exports = LakeHealthReport;