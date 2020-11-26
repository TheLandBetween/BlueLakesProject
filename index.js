// pull in express and set it up, assigned to app var
const express = require("express");
const app = express();
const path = require('path'); // initiate path to ensure proper navigation no matter where run from
const methodOverride = require('method-override');
const { v4: uuid } = require('uuid'); // initiate uuid for unique listing identifiers
let levelDeep; // think this is a temp solution, but is to deal with directory depths and partials
uuid();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

// '/' => home page -- has to be first
// render sends them a file in the views folder, dont need to include .ejs since we set view engine
app.get('/', (req, res) => {
    res.render('home', {levelDeep: levelDeep = false})
});


// we want to CRUD a lake health report report
// BASIC CRUD

// index route
// GET /reports - list all reports
app.get('/reports', (req, res) => {
    // render index.ejs file with the reports 'database'
    res.render('reports/index', { reports, levelDeep: levelDeep = true})
});

// create route
// POST /reports - Create new report
app.get('/reports/new', (req, res) => {
    // render new report page
   res.render('reports/new', {levelDeep: levelDeep = true});
});
// on reports/new submission it posts to /reports
app.post('/reports', (req, res) => {
    // strip date and health from submitted form
    console.log("posted");
    const { date, health } = req.body;
    // TEMPORARY -- add to list, and add a uuid  to the listing
    reports.push({date, health, id: uuid()});
    // redirect back to view all reports page
    // redirect to avoid form resubmission on refresh
    res.redirect('/reports', {levelDeep: levelDeep = true});
});

// show route
// GET /reports/:id - Get one report (using ID)
app.get('/reports/:id', (req, res) => {
    const { id } = req.params;
    // search the list and match an id that is passed in
    const foundReport = reports.find(report => report.id === id);

    // send them to the page about the single report
    res.render('reports/details', { foundReport, levelDeep: levelDeep = true });
});

// update route -- not sure if really required for our app. do we need to update a report once submitted?
// PATCH /reports/:id - Update one report
// using patch as its used to partially modify something, rather than put a whole new report
app.patch('/reports/:id', (req, res) => {
    // take id based on url
    const { id } = req.params;
    // save updated date sent in request
    const newReportDate = req.body.date;
    // match report in 'database' based on id in url
    const foundReport = reports.find(report => report.id === id);
    // update report date
    foundReport.date = newReportDate;
    // send back to all comments
    res.redirect('/reports');
});

// EDIT ROUTE
// reports/:id/edit
app.get('/reports/:id/edit', (req, res) => {
    const { id } = req.params;
    const foundReport = reports.find(report => report.id === id);
    res.render('reports/edit', { foundReport, levelDeep: levelDeep = true })
});

// delete route
// DELETE /reports/:id - Delete one report


// catch all for /path that is not defined -- 404 page
app.get("*", (req, res) => {
    res.send("Path not found")
});

// start the server on port 3000
app.listen(3000, () => {
    console.log("Listening on 3000");
});

