// pull in express and set it up, assigned to app var
const express = require("express");
const connectDB = require('./Database/Connection')
const app = express();
const bcrypt = require('bcrypt');

//Connect to the remote database
connectDB();



//const seed = require('./seeds'); //TEST SEEDING THE REMOTE DATABASE

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
let levelDeep; // think this is a temp solution, but is to deal with directory depths and partials

uuid();
express.static(path.join(__dirname, "public"));

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
const anglerReportRoutes = require('./routes/anglerReports');

// JOI Validation Schemas
const { userAccountSchema } = require('./schemas');

//Import all models
// import User_Account from './views/models/User_Account.js'
const UserAccount = require(path.join(__dirname, "./views/models/User_Account"));


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
app.get('/', (req, res) => {
    res.render('home', {levelDeep: levelDeep = 0})
});

//LAKE HEALTH REPORT ROUTING
app.use('/lakeReports', lakeReportRoutes);
app.get('/lakeReports/:id/edit', (req, res) => {
});

//ANGLER REPORT ROUTING
app.use('/anglerReports', anglerReportRoutes);
app.get('/anglerReports/:id/edit', (req, res) => {
});

//USER ACCOUNT ROUTING
app.get('/register', catchAsync(async (req, res) => {
    res.render('userAccounts/register', {levelDeep: levelDeep = 1});
}));
app.post('/register', catchAsync(async (req, res) => {
    try {
        const { username, firstName, lastName, password } = req.body;
        const newUser = new UserAccount({username, firstName, lastName});
        const registeredUser = await UserAccount.register(newUser, password);

        console.log(registeredUser);
        req.flash("success", "Welcome!");
        res.redirect('/login');
    } catch (error) {
        req.flash("error", error.message);
        res.redirect('/register')
    }
}));

app.get('/login', catchAsync(async (req, res) => {
    res.render('userAccounts/login', {levelDeep: levelDeep = 1});
}));
app.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), catchAsync(async (req, res) => {
    req.flash('success', "Welcome back!");
    res.redirect('/');
}));

app.get('/logout', (req, res) => {
    req.logout();
    req.flash("success", "Goodbye");
    res.redirect('/');
});

//Forgot password
const crypto = require('crypto');
const { promisify } = require('util');
const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: 'bluelakesproject',
        pass: '3dLfWMQ1GF6m'
    }
});
app.get('/forgot', catchAsync(async (req, res) => {
    res.render('userAccounts/forgot', {levelDeep: levelDeep = 1});
}));
app.post('/forgot', catchAsync(async (req, res) => {
    const token = (await promisify(crypto.randomBytes)(10)).toString('hex');

    const username = req.body.username;

    const user = (await UserAccount.findOne({username : username},{}));

    if (!user) {
        req.flash('error', 'No account with that email address exists.');
        res.redirect('/forgot');
    } else {
        await UserAccount.updateOne({username: username},
            {$set: {
                    resetPasswordToken: token,
                    resetPasswordExpires: Date.now() + 3600000
                }});
        const resetEmail = {
            to: username,
            from: 'passwordreset@example.com',
            subject: 'Angler Diaries Password Reset',
            text: 'You are receiving this email because there was a request to reset a password for anglerdiaries.com associated with this email address.\n' +
                'Please click on the following link, or paste into your web broswer to complete this process:\n' +
                'Token: ' + token +
                '\n\nIf you did not request this, please ignore this email and your password will remain unchanged.'
        };

        await transport.sendMail(resetEmail);

        res.redirect('/recover');
    }
}));

app.get('/recover', catchAsync(async (req, res) => {
    res.render('userAccounts/recover', {levelDeep: levelDeep = 1});
}));
app.post('/recover', catchAsync(async (req, res) => {
    const { recoveryToken, password, password_verify } = req.body;

    const user = await (UserAccount.findOne({resetPasswordToken : recoveryToken},{}));

    if (!user) {
        req.flash('error', 'Password reset token is invalid or expired.')
        return res.redirect('/recover');
    }

    if (user.resetPasswordExpires < Date.now()) {
        req.flash('error', 'Password reset token is invalid or expired.')
        return res.redirect('/recover');
    }

    if (!(password === password_verify)) {
        req.flash('error', "Passwords don't match.");
        return res.redirect('/recover');
    }

    await user.updateOne({resetPasswordToken : recoveryToken},
        {$set: {
                password: password,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }});

    const resetEmail = {
        to: user.username,
        from: 'passwordreset@example.com',
        subject: 'Angler Diaries Password Changed',
        text: 'This is a confirmation that the password for your account ' + user.username + ' has been changed.'
    };

    await transport.sendMail(resetEmail);

    req.flash('success', 'Success!  Your password has been changed.')
    res.redirect('/login');
}));

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
    res.status(statusCode).render('error', { err, levelDeep: levelDeep = 0 }) // pass error object to error page
});

//Starts application on port 3000
app.listen(Port, () => console.log('Server started on localhost:3000'));