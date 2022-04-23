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
const {isNotLoggedIn, isLoggedIn} = require("./middleware");

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
const AuthTokenStrategy = require('passport-auth-token');
const BearerStrategy = require('passport-http-bearer');
const User_Account = require("./views/models/User_Account");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const multer = require('multer') // for reading multipart html form data
const { storage } = require('./cloudinary');
const upload = multer({ storage, limits: { fieldSize: 25 * 1024 * 1024 } })

app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/scss', express.static(__dirname + '/node_modules/bootstrap/scss'));

uuid();
express.static(path.join(__dirname, "/public"));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }));
app.use(bodyParser.json({ limit: '30mb' }))

//MONGOOSE
const mongoose = require('mongoose');

//MONGO
const mongo = require('mongodb');
const assert = require('assert');

// setup Routes
const lakeReportRoutes = require('./routes/lakeReports');
const LakeHealthReport = require(path.join(__dirname, "./views/models/Lake_Health_Report"));

const anglerReportRoutes = require('./routes/anglerReports');
const AnglerReport = require(path.join(__dirname, "./views/models/Angler_Report"))

const userAccounts = require('./controllers/userAccounts');


// JOI Validation Schemas
const { userAccountSchema } = require('./schemas');
const jwt = require("jsonwebtoken");
const UserAccount = require("./views/models/User_Account");
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

// Mongo Injection
app.use(mongoSanitize());
app.use(helmet());

// Accepted script sources
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.datatables.net"
];
// Accepted style sources
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.datatables.net"
];
// Accepted connect sources
const connectSrcUrls = [
];
// Accepted font sources
const fontSrcUrls = [];
// helmet custom configuration for content security policy.
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/the-land-between/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Session, and sending to user
const sessionConfig = {
    name: 'session',
    secret: 'thisshouldbebetter',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // dont allow cookies to be viewable in JS
        // secure: true, Cookies only over HTTPS, for deployment
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

// For mobile authentication, check for JWT passed in
var JwtStrategy = require('passport-jwt').Strategy;
let opts = {
    // Custom method to retrieve JWT from mobile request, being sent in req.body
    jwtFromRequest: function(req) {
        let token = null;
        if (req && req.body.token) {
            token = req.body.token
        }
        return token;
    },
    // Use JWT secret stored in env file
    secretOrKey: process.env.MOBILE_KEY
}
// Enable JWT strategy for passport
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    // Search through DB for user account based on ID decoded from JWT, if found login user
    UserAccount.findById( jwt_payload.userId, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    })
}));

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
app.get('/', isNotLoggedIn, async (req, res) => {
    const healthReports = await LakeHealthReport.find({creator : req.user._id},{}).sort({"date_generated": -1});
    const anglerReports = await AnglerReport.find({creator : req.user._id},{}).sort({"date": -1});
    res.render('home', {healthReports, anglerReports})
});

//LAKE HEALTH REPORT ROUTING
app.use('/lakeReports', lakeReportRoutes);
app.get('/lakeReports/:id/edit',isNotLoggedIn , (req, res) => {
});

//ANGLER REPORT ROUTING
app.use('/anglerReports', anglerReportRoutes);
app.get('/anglerReports/:id/edit', isNotLoggedIn, (req, res) => {
});

app.get('/identifyFish', function (req, res) { //Delivers a PDF of all fish accepted by the application, with visuals
    let filePath = "/resources/Identify_Fish.pdf";

    fs.readFile(__dirname + filePath , function (err,data){
        res.contentType("application/pdf");
        res.send(data);
    });
});

//USER ACCOUNT ROUTING
app.get('/register', isLoggedIn, catchAsync(userAccounts.renderRegisterForm));
app.post('/register', validateUserAccount, catchAsync(userAccounts.registerUser));
app.post('/mRegister',

    catchAsync(userAccounts.mobileRegister)
)

//PROFILE PAGE ROUTING
app.get('/profile', isNotLoggedIn, catchAsync(userAccounts.renderProfile));

app.post('/updateRank', isNotLoggedIn, catchAsync(userAccounts.updateRank));

app.get('/changePassword', isNotLoggedIn, catchAsync(userAccounts.renderChangePassword));
app.post('/changePassword', isNotLoggedIn, catchAsync(userAccounts.changePassword));

app.get('/updateProfile', isNotLoggedIn, catchAsync(userAccounts.renderUpdateProfile));
app.put('/updateProfile', isNotLoggedIn, upload.single('photo'), catchAsync(userAccounts.updateProfile));
app.put('/mUpdateProfile', upload.single('photo'), catchAsync(userAccounts.mUpdateProfile));

app.delete('/deleteAccount', isNotLoggedIn, catchAsync(userAccounts.deleteProfile));
app.delete('/mDeleteAccount', catchAsync(userAccounts.mDeleteProfile));


// LOGIN ROUTE
app.get('/login', isLoggedIn, catchAsync(userAccounts.renderLoginForm));
app.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), catchAsync(userAccounts.loginUser));
app.post('/mLogin', passport.authenticate('local'), catchAsync(userAccounts.mobileLogin));
app.post('/mLocalLogin', passport.authenticate('jwt'), catchAsync(userAccounts.mobileLogin))

// LOGOUT ROUTE
app.get('/logout', userAccounts.logoutUser);
app.get('/mLogout', userAccounts.mLogoutUser);

app.get('/forgot', isLoggedIn, catchAsync(userAccounts.renderForgotForm));
app.post('/forgot', catchAsync(userAccounts.forgotUserPassword));
app.post('/mForgot', catchAsync(userAccounts.mForgotUserPassword));

//USER ACCOUNT RECOVERY ROUTING
app.get('/recover', isLoggedIn, catchAsync(userAccounts.renderRecoverForm));
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
