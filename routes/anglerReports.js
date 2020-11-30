const express = require('express');
const router = express.Router();
const path = require('path'); // duplicated in index.js, need to replace with partial that includes

const AnglerReport = require(path.join(__dirname, "../views/models/Angler_Report"));

// index route
// GET /anglerReports - list all anglerReports
router.get('/', async (req, res) => {
    // async callback to wait for health lakeReports to be received, then respond with webpage
    const anglerReports = await AnglerReport.find({});
    // render index.ejs file with the lakeReports 'database'
    res.render('anglerReports/index', { anglerReports, levelDeep: levelDeep = true});
});

// create route
// POST /anglerReports - Create new report
router.get('/new', (req, res) => {
    res.render('anglerReports/new', {levelDeep: levelDeep = true});
});
// on anglerReports/new submission it posts to /anglerReports
router.post('/', async (req, res) => {
    // TODO: Error handle this acception of the req.body. not checking if extra is passed in (sanatize etc)
    // assigns passed in form to a lake health report object, saving to a variable
    const newReport = new AnglerReport(req.body);
    await newReport.save();
    // redirect back to view all lakeReports page
    // redirect to avoid form resubmission on refresh
    res.redirect(`/anglerReports/${newReport._id}`);
});

// show route
// GET /anglerReports/:id - Get one report (using ID)
// TODO: Slugify link at some point, so instead of id in the url it can be something realative to the report (name / date)
router.get('/:id', async (req, res) => {
    // pull id from url
    const { id } = req.params;
    // look up the health report corresponding to the id passed in to the url
    const foundReport = await AnglerReport.findById(id);
    // send them to the page about the single report
    res.render('anglerReports/details', { foundReport, levelDeep: levelDeep = true });
});

// update route -- not sure if really required for our app. do we need to update a report once submitted?
// PATCH /anglerReports/:id - Update one report
// using patch as its used to partially modify something, rather than put a whole new report
router.patch('/:id', (req, res) => {
    // take id based on url
    const { id } = req.params;
    // save updated date sent in request
    const newReportDate = req.body.date;
    // match report in 'database' based on id in url
    const foundReport = reports.find(report => report.id === id);
    // update report date
    foundReport.date = newReportDate;
    // send back to all comments
    res.redirect('/anglerReports');
});

// EDIT ROUTE
// anglerReports/:id/edit
// !! dont think we need, never made edit file
// router.get('/:id/edit', (req, res) => {
//     const { id } = req.params;
//     const foundReport = reports.find(report => report.id === id);
//     res.render('anglerReports/edit', { foundReport, levelDeep: levelDeep = true })
// })

module.exports = router;
