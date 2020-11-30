const mongoose = require('mongoose');
const { Schema } = mongoose;

// create a template for the table (layed out in the db schema)
const lakeHealthReportSchema = new Schema({
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
    // believe this is how we should implement links from the lake reports to the lake themselves
    // want to keep these reports as seperate objects since we need to view all at once
    // lake: {
    //     type: Schema.Types.ObjectID,
    //     ref: 'Lake'
    // }
    // ON LAKE SIDE PUT THIS: (DONT HAVE FILE YET)
    // healthReports: {
    //      type: Schema.Types.ObjectId,
    //      ref: 'Lake_Health_Report'
    //   }
    // this creates a two way relationship
});

// assign it to a variable to create instances of the model
const Lake_Health_Report = mongoose.model('LakeHealthReport', lakeHealthReportSchema);

module.exports = Lake_Health_Report;
