const express = require('express');
const router = express.Router();
const path = require('path'); // duplicated in index.js, need to replace with partial that includes
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isCreator, validateAnglerReport } = require('../middleware');
const bodyParser = require('body-parser'); // TODO: trying to figure out reports
// const { app } = require('../index');
router.use(bodyParser.urlencoded({ extended: true })); // TODO: same above

const AnglerReport = require(path.join(__dirname, "../views/models/Angler_Report"));
const anglerReports = require('../controllers/anglerReports');


// server side validation for lake health reports
const { anglerReportSchema } = require('../schemas'); // JOI schema, not mongodb schema
const ExpressError = require('../utils/ExpressError');

// index route
// GET /anlgerReports - list all lakeReports
router.get('/', isLoggedIn, catchAsync(anglerReports.index));

// create route
// POST /anglerReports - Create new report
router.get('/new', isLoggedIn, anglerReports.renderNewForm);
// on lakeReports/new submission it posts to /lakeReports
router.post('/', isLoggedIn, validateAnglerReport, catchAsync(anglerReports.createAnglerReport));

// show route
// GET /lakeReports/:id - Get one report (using ID)
// TODO: Slugify link at some point, so instead of id in the url it can be something realative to the report (name / date)
router.get('/:id', isLoggedIn, catchAsync(anglerReports.showAnglerReport));

// edit route
router.get('/:id/edit', isLoggedIn, isCreator, catchAsync(anglerReports.renderEditForm));
router.put('/:id', isLoggedIn, isCreator, validateAnglerReport, catchAsync(anglerReports.updateAnglerReport));

// DELETE route
router.delete('/:id', isLoggedIn, catchAsync(anglerReports.deleteAnglerReport));

// update route -- not sure if really required for our app. do we need to update a report once submitted?
// PATCH /lakeReports/:id - Update one report
// using patch as its used to partially modify something, rather than put a whole new report
// router.patch('/:id', (req, res) => {
//     // take id based on url
//     const { id } = req.params;
//     // save updated date sent in request
//     const newReportDate = req.body.date;
//     // match report in 'database' based on id in url
//     const foundReport = reports.find(report => report.id === id);
//     // update report date
//     foundReport.date = newReportDate;
//     // send back to all comments
//     res.redirect('/lakeReports');
// });

// EDIT ROUTE
// lakeReports/:id/edit
// !! dont think we need, never made edit file
// router.get('/:id/edit', (req, res) => {
//     const { id } = req.params;
//     const foundReport = reports.find(report => report.id === id);
//     res.render('lakeReports/edit', { foundReport, levelDeep: levelDeep = true })
// })

module.exports = router;
