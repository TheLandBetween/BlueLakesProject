const express = require('express');
const router = express.Router();
const path = require('path'); // duplicated in index.js, need to replace with partial that includes
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn } = require('../middleware');
const bodyParser = require('body-parser'); // TODO: trying to figure out reports
// const { app } = require('../index');
router.use(bodyParser.urlencoded({ extended: true })); // TODO: same above

const LakeHealthReport = require(path.join(__dirname, "../views/models/Lake_Health_Report"));

// server side validation for lake health reports
const { lakeReportSchema } = require('../schemas'); // JOI schema, not mongodb schema
const ExpressError = require('../utils/ExpressError');
const validateLakeReport = (req, res, next) => {
    const { error } = lakeReportSchema.validate(req.body);

    if (error) {
        const errorMessage = error.details.map(el => el.message).join(',');
        throw new ExpressError(errorMessage, 400)
    } else {
        next();
    }
};

// index route
// GET /lakeReports - list all lakeReports
router.get('/', isLoggedIn, catchAsync(async (req, res) => {
    // async callback to wait for health lakeReports to be received, then respond with webpage
    const healthReports = await LakeHealthReport.find({});
    // render index.ejs file with the lakeReports 'database'
    res.render('lakeReports/index', { healthReports, levelDeep: levelDeep = 1});
}));

// create route
// POST /lakeReports - Create new report
router.get('/new', isLoggedIn, (req, res) => {
    res.render('lakeReports/new', {levelDeep: levelDeep = 1});
});
// on lakeReports/new submission it posts to /lakeReports
router.post('/', isLoggedIn, validateLakeReport, catchAsync(async (req, res) => {
    // assigns passed in form to a lake health report object, saving to a variable
    const newReport = new LakeHealthReport(req.body);
    newReport.creator = req.user._id;
    await newReport.save();
    // save success trigger
    req.flash('success', 'Successfully Created Report');
    // redirect back to view all lakeReports page
    res.redirect(`/lakeReports/${newReport._id}`); // redirect to avoid form resubmission on refresh
}));

// show route
// GET /lakeReports/:id - Get one report (using ID)
// TODO: Slugify link at some point, so instead of id in the url it can be something realative to the report (name / date)
router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    // pull id from url
    const { id } = req.params;
    // look up the health report corresponding to the id passed in to the url
    const foundReport = await LakeHealthReport.findById(id).populate('creator'); // passing in creator field from
    // send them to the page about the single report
    console.log(foundReport);
    res.render('lakeReports/details', { foundReport, levelDeep: levelDeep = 1 });
}));

// edit route
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const lakeReport = await LakeHealthReport.findById(req.params.id);
    if(!lakeReport) {
        req.flash('error', "Could not find that lake report.");
        return res.redirect('/lakeReports');
    }
    res.render("lakeReports/edit", { lakeReport, levelDeep: levelDeep = 2 });
}));
router.put('/:id', isLoggedIn, validateLakeReport, catchAsync(async (req, res) => {
    const { id } = req.params;
    const lakeReport = await LakeHealthReport.findByIdAndUpdate(id, { ...req.body });
    req.flash('success', "Successfully updated Lake Report");
    res.redirect(`/lakeReports/${lakeReport._id}`);
}));

// DELETE route
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await LakeHealthReport.findByIdAndDelete(id);
    req.flash('success', "Successfully deleted Lake Report");
    res.redirect('/lakeReports');
}));

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
