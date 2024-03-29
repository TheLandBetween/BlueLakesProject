// ROUTING file - Lake Health Reports
// Contains all the routing paths corresponding to Lake Health Reports

// import necessary features & middleware
const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isNotLoggedIn, isCreator, validateLakeReport } = require('../middleware');

// import routing methods from Lake Health Report controller file
const lakeReports = require('../controllers/lakeReports');

// "/lakeReports"
router.route('/')
    .get(isNotLoggedIn, catchAsync(lakeReports.index)) // INDEX route
    .post(isNotLoggedIn, validateLakeReport, catchAsync(lakeReports.createLakeReport)); // CREATE route
// "/anglerReports/mobile" for mobile reports delivery
router.get('/m', catchAsync(lakeReports.mIndex));
router.post('/m', catchAsync(lakeReports.mCreateLakeReport));
router.delete('/mDelete', catchAsync(lakeReports.mDeleteLakeReport));

// "/lakeReports/new"
router.get('/new', isNotLoggedIn, lakeReports.renderNewForm); // CREATE route

// "/lakeReports/:id"
router.route('/:id')
    .get(isNotLoggedIn, isCreator, catchAsync(lakeReports.showLakeReport)) // SHOW route
    .put(isNotLoggedIn, isCreator, validateLakeReport, catchAsync(lakeReports.updateLakeReport)) // EDIT route
    .delete(isNotLoggedIn, isCreator, catchAsync(lakeReports.deleteLakeReport)); // DELETE route
router.put('/m/:id',isNotLoggedIn, isCreator, catchAsync(lakeReports.mUpdateLakeReport));

// "/lakeReports/:id/edit"
router.get('/:id/edit', isNotLoggedIn, isCreator, catchAsync(lakeReports.renderEditForm)); // EDIT route

// export router for use in main index file ||
module.exports = router;

