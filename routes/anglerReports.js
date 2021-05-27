const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isCreator, validateAnglerReport } = require('../middleware');
const multer = require('multer') // for reading multipart html form data
const { storage } = require('../cloudinary');
const upload = multer({ storage })

const anglerReports = require('../controllers/anglerReports'); //Allows you use methods defined within /controllers/anglerReports

router.route('/')
    .get(isLoggedIn, catchAsync(anglerReports.index)) // INDEX route
    .post(isLoggedIn, upload.array('photo'), validateAnglerReport, catchAsync(anglerReports.createAnglerReport)) // CREATE route, validate after upload

router.get('/new', isLoggedIn, anglerReports.renderNewForm); // CREATE route, display page

router.route('/:id')
    .get(isLoggedIn, catchAsync(anglerReports.showAnglerReport)) // SHOW route
    .put( isLoggedIn, isCreator, upload.array('photo'), validateAnglerReport, catchAsync(anglerReports.updateAnglerReport)) // EDIT route
    .delete(isLoggedIn, catchAsync(anglerReports.deleteAnglerReport)); // DELETE route

router.get('/:id/edit', isLoggedIn, isCreator, catchAsync(anglerReports.renderEditForm)); // EDIT route

module.exports = router;
