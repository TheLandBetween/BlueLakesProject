// anytime we need data in the database, can use this file to do so

//mongoose
const mongoose = require('mongoose');
const path = require('path'); // initiate path to ensure proper navigation no matter where run from
const LakeHealthReport = require(path.join(__dirname, "views/models/lakehealthreport.js"));

// connect to "test" database
mongoose.connect('mongodb://localhost:27017/lakeHealthReports', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("connection open!")
    }).catch(err => {
    // error catch if connection to db fails
    console.log(err);
});

const report = new LakeHealthReport({
    WBY_LID: 2,
    Date_Generated: "2020-11-26",
    Status: "Great",
    Summary: "Been fantastic",
    Level_of_Concern: 33,
    Perc_Shore_Devd: 2.02,
    Avg_Temp: 20.1,
    Avg_DO_Conc: 1.22,
    Avg_Secchi_Depth: 200.22,
    Avg_Phosph: 2020
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
        Date_Generated: "2010-11-26",
        Status: "bas",
        Summary: "Been dsa",
        Level_of_Concern: 13,
        Perc_Shore_Devd: 2.22,
        Avg_Temp: 2.1,
        Avg_DO_Conc: 11.22,
        Avg_Secchi_Depth: 20.22,
        Avg_Phosph: 202
    },
    {
        WBY_LID: 2,
        Date_Generated: "220-11-26",
        Status: "yell",
        Summary: "Bedsddsdsen fantastic",
        Level_of_Concern: 332,
        Perc_Shore_Devd: 2.032,
        Avg_Temp: 20,
        Avg_DO_Conc: 22,
        Avg_Secchi_Depth: 200.222,
        Avg_Phosph: 2000
    },
    {
        WBY_LID: 3,
        Date_Generated: "1020-11-26",
        Status: "bad",
        Summary: "yep fantastic",
        Level_of_Concern: 3,
        Perc_Shore_Devd: 22.02,
        Avg_Temp: 220.1,
        Avg_DO_Conc: 12.22,
        Avg_Secchi_Depth: 2200.22,
        Avg_Phosph: 22020
    },
    {
        WBY_LID: 4,
        Date_Generated: "2020-222-26",
        Status: "so good",
        Summary: " fantastic",
        Level_of_Concern: 323,
        Perc_Shore_Devd: 2,
        Avg_Temp: 2021,
        Avg_DO_Conc: 1.222,
        Avg_Secchi_Depth: 2020.22,
        Avg_Phosph: 222020
    },
    {
        WBY_LID: 5,
        Date_Generated: "2220-11-26",
        Status: "dasuhduusada",
        Summary: "Been dasdsa",
        Level_of_Concern: 23,
        Perc_Shore_Devd: 2.2,
        Avg_Temp: 2123210.1,
        Avg_DO_Conc: 1.2332,
        Avg_Secchi_Depth: 200.3322,
        Avg_Phosph: 2033320
    }
];

LakeHealthReport.insertMany(seedReports)
    .then(res => {
        console.log("seeded");
        console.log(res)
    }).catch (err => {
        console.log(e)
});
