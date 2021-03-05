module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', "You must be signed in first!");
        return res.redirect('/login')
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