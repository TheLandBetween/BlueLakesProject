// MIDDLEWARE Functions
// Used throughout the application, primarily to aid in express routing.

// import necessary JOI Schema's and Mongo Models
const { lakeReportSchema, anglerReportSchema, userAccountSchema } = require('./schemas'); // JOI schema, not mongodb schema
const ExpressError = require('./utils/ExpressError');
const LakeHealthReport = require('./views/models/Lake_Health_Report');
const AnglerReport = require('./views/models/Angler_Report');

// middleware function to check to see if user is currently not logged in.
// intended use is for pages that user MUST be logged in to view (home, angler reports, lake reports, account, etc..)
module.exports.isNotLoggedIn = (req, res, next) => { //Checks if the user is not logged in.  Used on pages the user must be logged in to view
    // check to see if user is currently not Authenticated with passports function
    if (!req.isAuthenticated()) {
        // if user is not logged in, save where they came from (to redirect to after login) and send them to the login page
        req.session.returnTo = req.originalUrl;
        req.flash('error', "You must be signed in first!");
        return res.redirect('/login')
    }
    // if they are authenticated, send them to the next page
    next();
};

// middleware function to check if the user is currently logged into the session.
// intended use is for pages that user must NOT be logged in to view (register, login, forgotPassword)
module.exports.isLoggedIn = (req, res, next) => {
    // check to see if user is currently Authenticated with passports function
    if (req.isAuthenticated()) {
        // if success, pass through error with message declaring logged in status and send back to home page
        req.flash('error', "You are already logged in!");
        return res.redirect('/')
    }
    // if they're not authenticated, let them through to the page
    next();
};

// middleware function to validate a submitted angler report from POST to "/anglerReports"
module.exports.validateLakeReport = (req, res, next) => {
    // run body of form submission through JOI validation
    const { error } = lakeReportSchema.validate(req.body);

    // if error occurred, send them back to original page with flash warning of what went wrong
    if (error) {
        const errorMessage = error.details.map(el => el.message).join(',');
        throw new ExpressError(errorMessage, 400)
    } else {
        // if not, pass through body to angler report function
        next();
    }
};

// middleware function to validate a submitted angler report from POST to "/anglerReports"
module.exports.validateAnglerReport = (req, res, next) => {
    // run body of form submission through JOI validation
    const { error } = anglerReportSchema.validate(req.body);

    // if error occurred, send them back to original page with flash warning of what went wrong
    if (error) {
        const errorMessage = error.details.map(el => el.message).join(',');
        throw new ExpressError(errorMessage, 400)
    } else {
        // if not, pass through body to angler report function
        next();
    }
};

// middleware function to validate a submitted user account from POST to "/register"
module.exports.validateUserAccount = (req, res, next) => {
    // run body of form submission through JOI validation
    const { error } = userAccountSchema.validate(req.body);

    // if an error occurred, send them back to original page with flash warning of what went wrong
    if (error) {
        const errorMessage = error.details.map(el => el.message).join(',');
        throw new ExpressError(errorMessage, 400)
    } else {
        // if no error, send them through to the function of saving user account
        next();
    }
}

// Middleware to ensure user who is viewing report is the creator, as users should not be able to see any other users posts
// only exception being administrators
module.exports.isCreator = async (req, res, next) => {
    // Administrator exception, pass them through the route immediately
    if (req.user.rank === 3) {
        next();
    } else {
        // if not administrator, ensure they are the creator of the current report
        //Pulls the ID of the report from the URL
        const { id } = req.params;

        //Attempts to find an associated LakeHealthReport / AnglerReport
        const lakeReport = await LakeHealthReport.findById(id);
        const anglerReport = await AnglerReport.findById(id);

        // if a lake report was found, check if creator and if not redirect back to all with a warning
        if (lakeReport)
            //Checks the requesting user id against the lake reports creator ID
            if (!(lakeReport.creator).equals(req.user._id)) {
                // if fail redirect with flash warning
                req.flash('error', "You do not have permission to do that");
                return res.redirect(`/lakeReports`);
            }
        // if an angler report was found, check if creator and if not redirect back to all with a warning
        if (anglerReport)
            //Checks the requesting user id against the angler reports creator ID
            if (!(anglerReport.creator).equals(req.user._id)) {
                // if fail redirect with flash warning
                req.flash('error', "You do not have permission to do that");
                return res.redirect(`/anglerReports`);
            }
        next();
    }
};
