// pull in express and set it up, assigned to app var
const express = require("express");
const app = express();
const path = require('path'); // initiate path to ensure proper navigation no matter where run from
const methodOverride = require('method-override');
const { v4: uuid } = require('uuid'); // initiate uuid for unique listing identifiers
const session = require('express-session'); // express session instance
const flash = require('connect-flash');
uuid();
let levelDeep; // think this is a temp solution, but is to deal with directory depths and partials

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

// catch all for /path that is not defined -- 404 page
app.get("*", (req, res) => {
    res.send("Path not found")
});

// error handling, called after catchAsync throws an error for the async function call
app.use((err, req, res, next) => {
    res.send("Something went wrong!")
});

// start the server on port 3000
app.listen(3000, () => {
    console.log("Listening on 3000");
});

