// pull in express and set it up, assigned to app var
const express = require("express");
const app = express();
const path = require('path'); // initiate path to ensure proper navigation no matter where run from
const methodOverride = require('method-override');
const { v4: uuid } = require('uuid'); // initiate uuid for unique listing identifiers
const session = require('express-session'); // express session instance
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
// const passport = require('passport');
// const LocalStrategy = require('passport-local');
// const User_Account = require("./views/models/User_Account");
let levelDeep; // think this is a temp solution, but is to deal with directory depths and partials

uuid();
express.static(path.join(__dirname, "public"));

//MONGOOSE
const mongoose = require('mongoose');
// setup lake health report model + route
const lakeReportRoutes = require('./routes/lakeReports');
const anglerReportRoutes = require('./routes/anglerReports');
// setup angler report model + route

// connect to "BlueLakes" database
mongoose.connect('mongodb://localhost:27017/BlueLakes', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("connection open!")
    }).catch(err => {
        // error catch if connection to db fails
        console.log("error");
        console.log(err)
    });

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
// app.use(passport.initialize());
// app.use(passport.session()); // needs to be used after app.use(session())
//
// passport.use(new LocalStrategy(User_Account.authenticate())); // pass current users session into passport and check if still valid
//
// // define how to store + unstore user auth, which is stored in the user account (provided by passport)
// passport.serializeUser(User_Account.serializeUser());
// passport.deserializeUser(User_Account.deserializeUser());

// form submission assigned to using json
app.use(express.urlencoded({ extended: true }));
// pass in body as json on each request
app.use(express.json());

// Middleware for the connect-flash library
// will check each request for a tag from flash(), and if its present pass into the local vars of the template loaded as
// a correspoding variable.
app.use((req, res, next) => {
    res.locals.success = req.flash('success'); // a success message, pass it over
    res.locals.error = req.flash('error'); // an error message, pass it over
    next();
});

// '/' => home page -- has to be first
// render sends them a file in the views folder, dont need to include .ejs since we set view engine
app.get('/', (req, res) => {
    res.render('home', {levelDeep: levelDeep = false})
});

//LAKE HEALTH REPORT ROUTING
app.use('/lakeReports', lakeReportRoutes);
app.get('/lakeReports/:id/edit', (req, res) => {
});

//ANGLER REPORT ROUTING
app.use('/anglerReports', anglerReportRoutes);
app.get('/anglerReports/:id/edit', (req, res) => {
});

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
    res.status(statusCode).render('error', { err, levelDeep: levelDeep = false }) // pass error object to error page
});

// start the server on port 3000
app.listen(3000, () => {
    console.log("Listening on 3000");
});

