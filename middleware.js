const { lakeReportSchema } = require('./schemas'); // JOI schema, not mongodb schema
const ExpressError = require('./utils/ExpressError');
const LakeHealthReport = require('./views/models/Lake_Health_Report');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // append link navigated from so we can send them back to that page once logged in
        req.flash('error', "You must be signed in first!");
        return res.redirect('/login')
    }
    next();
};

module.exports.validateLakeReport = (req, res, next) => {
    const { error } = lakeReportSchema.validate(req.body);

    if (error) {
        const errorMessage = error.details.map(el => el.message).join(',');
        throw new ExpressError(errorMessage, 400)
    } else {
        next();
    }
};

module.exports.isCreator = async (req, res, next) => {
    const { id } = req.params;
    const lakeReport = await LakeHealthReport.findById(id);
    // if user is not authorized to update (same as creator), redirect and flash error
    if (!lakeReport.creator.equals(req.user._id)) {
        req.flash('error', "You do not have permission to do that");
        return res.redirect(`/lakeReports/${id}`);
    }
    next();
};

// server side catch for incorrect submissions to the form
// if empty, throw new ExpressError object with corresponding message to be caught by catchAsync func
// const path = require('path'); // duplicated in index.js, need to replace with partial that includes
// const LakeHealthReport = require(path.join(__dirname, "./views/models/Lake_Health_Report"));
// module.exports.validateLakeReport = (req, res, next) => {
//     // run that schema through joi's validate function, which will return an object
//     const reportToBeValidated = new LakeHealthReport(req.body);
//     const { error } = lakeReportSchema.validate(reportToBeValidated);
//     // if that object contains error details, throw an ExpressError
//     if(error){
//         // strip the details array inside the error field in object, and append them to the message being sent to the error
//         const message = error.details.map(elem => elem.message).join(',');
//         throw new ExpressError(message, 400)
//     } else {
//         next();
//     }
// };