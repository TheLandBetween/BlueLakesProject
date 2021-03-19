const mongoose = require('mongoose');
const { Schema } = mongoose;

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
    },
    // want to keep these reports as seperate objects since we need to view all at once
    lake: {
        type: Schema.Types.ObjectID,
        ref: 'Lake'
    }
});

// assign it to a variable to create instances of the model
const Lake_Health_Report = mongoose.model('LakeHealthReport', lakeHealthReportSchema);

module.exports = Lake_Health_Report;
