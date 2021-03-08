// anytime we need data in the database, can use this file to do so

//mongoose
const mongoose = require('mongoose');
const path = require('path'); // initiate path to ensure proper navigation no matter where run from
const LakeHealthReport = require(path.join(__dirname, "views/models/Lake_Health_Report.js"));

const connectDB = require('./Database/Connection');
connectDB();


const report = new LakeHealthReport({
    WBY_LID: 2,
    date_generated: "2020-11-26",
    status: "Great",
    summary: "Been fantastic",
    level_of_concern: 33,
    perc_shore_devd: 2.02,
    avg_temp: 20.1,
    avg_do_conc: 1.22,
    avg_secchi_depth: 200.22,
    avg_phosph: 2020
});
console.log('here');
report.save().then(report => {
    console.log(report)
}) .catch(err => {
    console.log(err)
});


const seedReports = [
    {
        WBY_LID: 1,
        creator: '6045959b91aa79d4c6db5ff0',
        date_generated: "2010-11-26",
        status: "bas",
        summary: "Been dsa",
        level_of_concern: 13,
        perc_shore_devd: 2.22,
        avg_temp: 2.1,
        avg_do_conc: 11.22,
        avg_secchi_depth: 20.22,
        avg_phosph: 202
    },
    {
        WBY_LID: 2,
        creator: '6045959b91aa79d4c6db5ff0',
        date_generated: "220-11-26",
        status: "yell",
        summary: "Bedsddsdsen fantastic",
        level_of_concern: 332,
        perc_shore_devd: 2.032,
        avg_temp: 20,
        avg_do_conc: 22,
        avg_secchi_depth: 200.222,
        avg_phosph: 2000
    },
    {
        WBY_LID: 3,
        creator: '6045959b91aa79d4c6db5ff0',
        date_generated: "1020-11-26",
        status: "bad",
        summary: "yep fantastic",
        level_of_concern: 3,
        perc_shore_devd: 22.02,
        avg_temp: 220.1,
        avg_do_conc: 12.22,
        avg_secchi_depth: 2200.22,
        avg_phosph: 22020
    },
    {
        WBY_LID: 4,
        creator: '6045959b91aa79d4c6db5ff0',
        date_generated: "2020-222-26",
        status: "so good",
        summary: " fantastic",
        level_of_concern: 323,
        perc_shore_devd: 2,
        avg_temp: 2021,
        avg_do_conc: 1.222,
        avg_secchi_depth: 2020.22,
        avg_phosph: 222020
    },
    {
        WBY_LID: 5,
        creator: '6045959b91aa79d4c6db5ff0',
        date_generated: "2220-11-26",
        status: "dasuhduusada",
        summary: "Been dasdsa",
        level_of_concern: 23,
        perc_shore_devd: 2.2,
        avg_temp: 2123210.1,
        avg_do_conc: 1.2332,
        avg_secchi_depth: 200.3322,
        avg_phosph: 2033320
    }
];

LakeHealthReport.insertMany(seedReports)
    .then(res => {
        console.log("seeded");
        console.log(res)
    }).catch (err => {
        console.log(e)
});
