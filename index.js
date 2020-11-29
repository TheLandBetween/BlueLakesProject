// pull in express and set it up, assigned to app var
const express = require("express");
const app = express();
const path = require('path'); // initiate path to ensure proper navigation no matter where run from
const methodOverride = require('method-override');
const { v4: uuid } = require('uuid'); // initiate uuid for unique listing identifiers
uuid();
let levelDeep; // think this is a temp solution, but is to deal with directory depths and partials

express.static(path.join(__dirname, "public"));

//mongoose
const mongoose = require('mongoose');
const LakeHealthReport = require(path.join(__dirname, "views/models/Lake_Health_Report"));
// connect to "test" database
mongoose.connect('mongodb://localhost:27017/lakeHealthReports', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("connection open!")
    }).catch(err => {
        // error catch if connection to db fails
        console.log("error")
        console.log(err)
    });

//initiate the calling of methodoverride with ?_method=METHOD
app.use(methodOverride('_method'));

const reports = [
    {
        id: uuid(),
        date: "12-01-1999",
        health: "great"
    },
    {
        id: uuid(),
        date: "10-01-1999",
        health: "ok"
    },
    {
        id: uuid(),
        date: "8-01-1999",
        health: "terrible"
    },
    {
        id: uuid(),
        date: "6-01-1999",
        health: "not good"
    }
];

// assign ejs as the templating language
app.set('view engine', 'ejs');
//serve public directory for css & js files
app.use(express.static(path.join(__dirname, "public")));
// take current dir name, join it with /views to navigate to views folder
app.set('views', path.join(__dirname, "/views"));

// form submission assigned to using json
app.use(express.urlencoded({ extended: true }));
// pass in body as json on each request
app.use(express.json());

//Custom Middleware Example
// every request that comes in gets logged to console and then next() proceeds to where the url should go normally
// app.use((req, res, next) => {
//     console.log("middleware");
//     next();
// });

// '/' => home page -- has to be first
// render sends them a file in the views folder, dont need to include .ejs since we set view engine
app.get('/', (req, res) => {
    res.render('home', {levelDeep: levelDeep = false})
});


// we want to CRUD a lake health report report
// BASIC CRUD

// index route
// GET /lakeReports - list all lakeReports
app.get('/lakeReports', async (req, res) => {
    // async callback to wait for health lakeReports to be received, then respond with webpage
    const healthReports = await LakeHealthReport.find({});
    // render index.ejs file with the lakeReports 'database'
    res.render('lakeReports/index', { healthReports, levelDeep: levelDeep = true});
});

// create route
// POST /lakeReports - Create new report
app.get('/lakeReports/new', (req, res) => {
    // render new report page
   res.render('lakeReports/new', {levelDeep: levelDeep = true});
});
// on lakeReports/new submission it posts to /lakeReports
app.post('/lakeReports', async (req, res) => {
    // TODO: Error handle this acception of the req.body. not checking if extra is passed in (sanatize etc)
    // assigns passed in form to a lake health report object, saving to a variable
    const newReport = new LakeHealthReport(req.body);
    await newReport.save();
    // redirect back to view all lakeReports page
    // redirect to avoid form resubmission on refresh
    res.redirect(`/lakeReports/${newReport._id}`);
});

// show route
// GET /lakeReports/:id - Get one report (using ID)
// TODO: Slugify link at some point, so instead of id in the url it can be something realative to the report (name / date)
app.get('/lakeReports/:id', async (req, res) => {
    // pull id from url
    const { id } = req.params;
    // look up the health report corresponding to the id passed in to the url
    const foundReport = await LakeHealthReport.findById(id);
    // send them to the page about the single report
    res.render('lakeReports/details', { foundReport, levelDeep: levelDeep = true });
});

// update route -- not sure if really required for our app. do we need to update a report once submitted?
// PATCH /lakeReports/:id - Update one report
// using patch as its used to partially modify something, rather than put a whole new report
app.patch('/lakeReports/:id', (req, res) => {
    // take id based on url
    const { id } = req.params;
    // save updated date sent in request
    const newReportDate = req.body.date;
    // match report in 'database' based on id in url
    const foundReport = reports.find(report => report.id === id);
    // update report date
    foundReport.date = newReportDate;
    // send back to all comments
    res.redirect('/lakeReports');
});

// EDIT ROUTE
// lakeReports/:id/edit
app.get('/lakeReports/:id/edit', (req, res) => {
    const { id } = req.params;
    const foundReport = reports.find(report => report.id === id);
    res.render('lakeReports/edit', { foundReport, levelDeep: levelDeep = true })
});

// delete route
// DELETE /lakeReports/:id - Delete one report


// catch all for /path that is not defined -- 404 page
app.get("*", (req, res) => {
    res.send("Path not found")
});

// start the server on port 3000
app.listen(3000, () => {
    console.log("Listening on 3000");
});

