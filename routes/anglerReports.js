// ROUTING file - Angler Reports
// Contains all the routing paths corresponding to Angler Reports

// import necessary features & middleware for routes
const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isNotLoggedIn, isCreator, validateAnglerReport } = require('../middleware');
// import necessary packages for image uploading and processing
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// import routing methods from Angler Report controller file
const anglerReports = require('../controllers/anglerReports');

// "/anglerReports"
router.route('/')
    .get(isNotLoggedIn, catchAsync(anglerReports.index)) // INDEX route
    .post(isNotLoggedIn, upload.array('photo'), validateAnglerReport, catchAsync(anglerReports.createAnglerReport)) // CREATE route


// "/anglerReports/new"
router.get('/new', isNotLoggedIn, anglerReports.renderNewForm); // CREATE route

// "/anglerReports/:id"
router.route('/:id')
    .get(isNotLoggedIn, isCreator, catchAsync(anglerReports.showAnglerReport)) // SHOW route
    .put( isNotLoggedIn, isCreator, upload.array('photo'), validateAnglerReport, catchAsync(anglerReports.updateAnglerReport)) // EDIT route
    .delete(isNotLoggedIn, isCreator, catchAsync(anglerReports.deleteAnglerReport)); // DELETE route

// "/anglerReports/:id/edit"
router.get('/:id/edit', isNotLoggedIn, isCreator, catchAsync(anglerReports.renderEditForm)); // EDIT route

// export router for use in main index file
module.exports = router;
