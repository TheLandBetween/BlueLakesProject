// if we run in development mode add variables in env file into process
// production will be done differently
// access through process.env.VarName
if(process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// pull in express and set it up, assigned to app var
const express = require("express");
const connectDB = require('./Database/Connection')
const app = express();
const fs = require('fs')
const bcrypt = require('bcrypt');
const {isLoggedIn, isCurrentlyAuthenticated} = require("./middleware");

//Connect to the remote database
connectDB();

app.use(express.json({ extended: false }));
app.use(express.urlencoded({extended: false }));
const Port = process.env.Port || 3000;
const catchAsync = require('./utils/catchAsync');
const path = require('path'); // initiate path to ensure proper navigation no matter where run from
const methodOverride = require('method-override');
const { v4: uuid } = require('uuid'); // initiate uuid for unique listing identifiers
const session = require('express-session'); // express session instance
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User_Account = require("./views/models/User_Account");

app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/scss', express.static(__dirname + '/node_modules/bootstrap/scss'));

uuid();
express.static(path.join(__dirname, "/public"));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

//MONGOOSE
const mongoose = require('mongoose');

//MONGO
const mongo = require('mongodb');
const assert = require('assert');
const URI = 'mongodb+srv://bluelakes:pbTk3KiYV2yg6LQ4@cluster0.xk0y2.mongodb.net/BlueLakes?retryWrites=true&w=majority'

// setup Routes
const lakeReportRoutes = require('./routes/lakeReports');
const LakeHealthReport = require(path.join(__dirname, "./views/models/Lake_Health_Report"));

const anglerReportRoutes = require('./routes/anglerReports');
const AnglerReport = require(path.join(__dirname, "./views/models/Angler_Report"))

const userAccounts = require('./controllers/userAccounts');


// JOI Validation Schemas
const { userAccountSchema } = require('./schemas');
// server side catch for incorrect submissions to a user account
// if empty, throw new ExpressError object with corresponding message to be caught by catchAsync func
const validateUserAccount = (req, res, next) => {
    // run that schema through joi's validate function, which will return an object
    const { error } = userAccountSchema.validate(req.body);
    // if that object contains error details, throw an ExpressError
    if(error){
        console.log("erroring in user account");
        // strip the details array inside the error field in object, and append them to the message being sent to the error
        const message = error.details.map(elem => elem.message).join(',');
        throw new ExpressError(message, 400)
    } else {
        next();
    }
};




//initiate the calling of methodoverride with ?_method=METHOD
app.use(methodOverride('_method'));

// assign ejs as the templating language
app.set('view engine', 'ejs');
//serve public directory for css & js files
app.use(express.static(path.join(__dirname, "public")));
// take current dir name, join it with /views to navigate to views folder
app.set('views', path.join(__dirname, "/views"));



// Session, and sending to user
const sessionConfig = {
    secret: 'thisshouldbebetter',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,// Date.now provides in ms, this is to expire in a week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));

// used for flashing messages to users, ie succesfully created
app.use(flash());

// start passport user authentication
app.use(passport.initialize());
app.use(passport.session()); // needs to be used after app.use(session())
passport.use(new LocalStrategy(User_Account.authenticate())); // pass current users session into passport and check if still valid

// define how to store + unstore user auth, which is stored in the user account (provided by passport)
passport.serializeUser(User_Account.serializeUser());
passport.deserializeUser(User_Account.deserializeUser());

// form submission assigned to using json
app.use(express.urlencoded({ extended: true }));
// pass in body as json on each request
app.use(express.json());

// Middleware for the connect-flash library
// will check each request for a tag from flash(), and if its present pass into the local vars of the template loaded as
// a correspoding variable.
app.use((req, res, next) => {
    res.locals.currentUser = req.user; // pass over the user data to each page so we can access it for styling
    res.locals.success = req.flash('success'); // a success message, pass it over
    res.locals.error = req.flash('error'); // an error message, pass it over
    next();
});

// '/' => home page -- has to be first
// render sends them a file in the views folder, dont need to include .ejs since we set view engine
app.get('/', isLoggedIn, async (req, res) => {
    const healthReports = await LakeHealthReport.find({creator : req.user._id},{}).sort({"date_generated": -1});
    const anglerReports = await AnglerReport.find({creator : req.user._id},{}).sort({"date": -1});
    res.render('home', {healthReports, anglerReports})
});

//LAKE HEALTH REPORT ROUTING
app.use('/lakeReports', lakeReportRoutes);
app.get('/lakeReports/:id/edit',isLoggedIn , (req, res) => {
});

//ANGLER REPORT ROUTING
app.use('/anglerReports', anglerReportRoutes);
app.get('/anglerReports/:id/edit', isLoggedIn, (req, res) => {
});

app.get('/identifyFish', function (req, res) { //Delivers a PDF of all fish accepted by the application, with visuals
    let filePath = "/resources/Identify_Fish.pdf";

    fs.readFile(__dirname + filePath , function (err,data){
        res.contentType("application/pdf");
        res.send(data);
    });
});

//USER ACCOUNT ROUTING
app.get('/register', isCurrentlyAuthenticated,catchAsync(userAccounts.renderRegisterForm));
app.post('/register', catchAsync(userAccounts.registerUser));

//PROFILE PAGE ROUTING
app.get('/profile', isLoggedIn, catchAsync(userAccounts.renderProfile));

app.post('/updateRank', isLoggedIn, catchAsync(userAccounts.updateRank));

app.get('/changePassword', isLoggedIn, catchAsync(userAccounts.renderChangePassword));
app.post('/changePassword', isLoggedIn, catchAsync(userAccounts.changePassword));

app.get('/updateName', isLoggedIn, catchAsync(userAccounts.renderUpdateName));
app.post('/updateName', isLoggedIn, catchAsync(userAccounts.updateName));

app.get('/updateOrganization', isLoggedIn, catchAsync(userAccounts.renderUpdateOrganization));
app.post('/updateOrganization', isLoggedIn, catchAsync(userAccounts.updateOrganization));

app.get('/updatePreferences', isLoggedIn, catchAsync(userAccounts.renderUpdatePreferences));
app.post('/updatePreferences', isLoggedIn, catchAsync(userAccounts.updatePreferences));


// LOGIN ROUTE
app.get('/login', isCurrentlyAuthenticated, catchAsync(userAccounts.renderLoginForm));
app.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), catchAsync(userAccounts.loginUser));


// LOGOUT ROUTE
app.get('/logout', userAccounts.logoutUser);

app.get('/forgot', isCurrentlyAuthenticated, catchAsync(userAccounts.renderForgotForm));
app.post('/forgot', catchAsync(userAccounts.forgotUserPassword));

//USER ACCOUNT RECOVERY ROUTING
app.get('/recover', isCurrentlyAuthenticated, catchAsync(userAccounts.renderRecoverForm));
app.post('/recover', catchAsync(userAccounts.recoverUserAccount));

// 404 error page, request a link that doesnt exist
// will send new error object to our app.use error handler and allow it to display accordingly.
app.all('*', (req, res, next) => {
    // send new ExpressError object with page not found message + code
    next(new ExpressError('Page Not Found', 404))
});

// error handling, called after catchAsync throws an error for the async function call
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err; // pull statusCode from ExpressError object, set to 500 default
    if (!err.message) err.message = "Something went wrong!";
    // pull statusCode and message from ExpressError class passed in
    res.status(statusCode).render('error', { err }) // pass error object to error page
});

//Starts application on port 3000
app.listen(Port, () => console.log('Server started on localhost:3000'));
