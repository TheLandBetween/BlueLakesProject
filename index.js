// pull in express and set it up, assigned to app var
const express = require("express");
const connectDB = require('./Database/Connection')
const app = express();

connectDB();

const seed = require('./seeds') //TEST SEEDING THE REMOTE DATABASE

app.use(express.json({ extended: false }));
const Port = process.env.Port || 3000;

const path = require('path'); // initiate path to ensure proper navigation no matter where run from
const methodOverride = require('method-override');
const { v4: uuid } = require('uuid'); // initiate uuid for unique listing identifiers
uuid();
let levelDeep; // think this is a temp solution, but is to deal with directory depths and partials

express.static(path.join(__dirname, "public"));

//MONGOOSE
const mongoose = require('mongoose');
// setup lake health report model + route
const LakeHealthReport = require(path.join(__dirname, "views/models/Lake_Health_Report")); // TODO: may not need this here
const lakeReportRoutes = require('./routes/lakeReports');
const anglerReportRoutes = require('./routes/anglerReports');
// setup angler report model + route



//initiate the calling of methodoverride with ?_method=METHOD
app.use(methodOverride('_method'));

// assign ejs as the templating language
app.set('view engine', 'ejs');
//serve public directory for css & js files
app.use(express.static(path.join(__dirname, "public")));
// take current dir name, join it with /views to navigate to views folder
app.set('views', path.join(__dirname, "/views"));

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


app.listen(Port, () => console.log('Server started'));
// // start the server on port 3000
// app.listen(3000, () => {
//     console.log("Listening on 3000");
// });

