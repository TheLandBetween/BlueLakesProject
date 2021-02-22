const express = require('express');
const router = express.Router();
const path = require('path'); // duplicated in index.js, need to replace with partial that includes

const LakeHealthReport = require(path.join(__dirname, "../views/models/Lake_Health_Report"));

// index route
// GET /lakeReports - list all lakeReports
router.get('/', async (req, res) => {
    // async callback to wait for health lakeReports to be received, then respond with webpage
    const healthReports = await LakeHealthReport.find({});
    // render index.ejs file with the lakeReports 'database'
    res.render('lakeReports/index', { healthReports, levelDeep: levelDeep = true});
});

// create route
// POST /lakeReports - Create new report
router.get('/new', (req, res) => {
    res.render('lakeReports/new', {levelDeep: levelDeep = true});
});
// on lakeReports/new submission it posts to /lakeReports
router.post('/', async (req, res) => {
    // TODO: Error handle this acception of the req.body. not checking if extra is passed in (sanatize etc)
    // assigns passed in form to a lake health report object, saving to a variable
    const newReport = new LakeHealthReport(req.body);
    await newReport.save();
    // save success trigger
    req.flash('success', "Successfully submitted a new Lake Health Report");
    // redirect back to view all lakeReports page
    res.redirect(`/lakeReports/${newReport._id}`); // redirect to avoid form resubmission on refresh
});

// show route
// GET /lakeReports/:id - Get one report (using ID)
// TODO: Slugify link at some point, so instead of id in the url it can be something realative to the report (name / date)
router.get('/:id', async (req, res) => {
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
    res.redirect('/lakeReports');
});

// EDIT ROUTE
// lakeReports/:id/edit
// !! dont think we need, never made edit file
// router.get('/:id/edit', (req, res) => {
//     const { id } = req.params;
//     const foundReport = reports.find(report => report.id === id);
//     res.render('lakeReports/edit', { foundReport, levelDeep: levelDeep = true })
// })

module.exports = router;
