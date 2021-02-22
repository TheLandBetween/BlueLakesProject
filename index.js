// pull in express and set it up, assigned to app var
const express = require("express");
const app = express();
const path = require('path'); // initiate path to ensure proper navigation no matter where run from
const methodOverride = require('method-override');
const { v4: uuid } = require('uuid'); // initiate uuid for unique listing identifiers
const session = require('express-session'); // express session instance
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


const sessionConfig = {
    secret: 'thisshouldbebetter',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,// Date.now provides in ms, this is to expire in a week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

// form submission assigned to using json
app.use(express.urlencoded({ extended: true }));
// pass in body as json on each request
app.use(express.json());

//Custom Middleware Example
// every request that comes in to / gets logged to console and then next() proceeds to where the url should go normally
// app.use('/', (req, res, next) => {
//     console.log("middleware");
//     next();
// });

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

// start the server on port 3000
app.listen(3000, () => {
    console.log("Listening on 3000");
});

