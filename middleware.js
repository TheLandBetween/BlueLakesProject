module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', "You must be signed in first!");
        return res.redirect('/login')
    }
    next();
};

// server side catch for incorrect submissions to the form
// if empty, throw new ExpressError object with corresponding message to be caught by catchAsync func
const { lakeReportSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');
module.exports.validateLakeReport = (req, res, next) => {
    // run that schema through joi's validate function, which will return an object
    const { error } = lakeReportSchema.validate(req.body);
    // if that object contains error details, throw an ExpressError
    if(error){
        // strip the details array inside the error field in object, and append them to the message being sent to the error
        const message = error.details.map(elem => elem.message).join(',');
        throw new ExpressError(message, 400)
    } else {
        next();
    }
};