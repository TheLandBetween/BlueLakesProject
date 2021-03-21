const express = require('express');
const router = express.Router();
const path = require('path'); // duplicated in index.js, need to replace with partial that includes
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isCreator, validateLakeReport } = require('../middleware');
const bodyParser = require('body-parser'); // TODO: THINK THIS CAN GET REMOVED 6-8
router.use(bodyParser.urlencoded({ extended: true })); // TODO: same above

const LakeHealthReport = require(path.join(__dirname, "../views/models/Lake_Health_Report"));
const lakeReports = require('../controllers/lakeReports');

// server side validation for lake health reports
const { lakeReportSchema } = require('../schemas'); // JOI schema, not mongodb schema
const ExpressError = require('../utils/ExpressError');

// index route
// GET /lakeReports - list all lakeReports
router.get('/', isLoggedIn, catchAsync(lakeReports.index));

// create route
// POST /lakeReports - Create new report
router.get('/new', isLoggedIn, lakeReports.renderNewForm);
// on lakeReports/new submission it posts to /lakeReports
router.post('/', isLoggedIn, validateLakeReport, catchAsync(lakeReports.createLakeReport));

// show route
// GET /lakeReports/:id - Get one report (using ID)
// TODO: Slugify link at some point, so instead of id in the url it can be something realative to the report (name / date)
router.get('/:id', isLoggedIn, catchAsync(lakeReports.showLakeReport));

// edit route
router.get('/:id/edit', isLoggedIn, isCreator, catchAsync(lakeReports.renderEditForm));
router.put('/:id', isLoggedIn, isCreator, validateLakeReport, catchAsync(lakeReports.updateLakeReport));

// DELETE route
router.delete('/:id', isLoggedIn, catchAsync(lakeReports.updateLakeReport));

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

