const UserAccount = require("../views/models/User_Account");

// Forgot password items
const crypto = require('crypto');
const { promisify } = require('util');
const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com', //Use gmail as SMTP transport client
    port: 465,
    auth: {
        user: 'bluelakesproject', //GMail username and password currently hardcoded, need to encrypt after development
        pass: '3dLfWMQ1GF6m'
    }
});

module.exports.renderRegisterForm = async (req, res) => {
    res.render('userAccounts/register');
};

module.exports.registerUser = async (req, res, next) => {
    try {
        let rank = 1;
        const { username, firstName, lastName, organization, password } = req.body;
        const newUser = new UserAccount({username, firstName, lastName, organization, rank});
        const registeredUser = await UserAccount.register(newUser, password);
        // never really a case where this should raise an error as we are awaiting the user account
        // to be registered and have an error catcher on thr async function, but passport requires it
        req.login(registeredUser, error => {
            if (error) return next(error);
            req.flash("success", "Welcome!");
            res.redirect('/');
        });
    } catch (error) {
        req.flash("error", error.message);
        res.redirect('/register')
    }
};

module.exports.renderLoginForm = async (req, res) => {
    res.render('userAccounts/login');
};

module.exports.loginUser = async (req, res) => {
    req.flash('success', "Welcome back!");
    const redirectURL = req.session.returnTo || '/'; // set to url if navigated from page, or send to home page if not
    delete req.session.returnTo; // clear from session
    res.redirect(redirectURL);
};

module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash("success", "Goodbye");
    res.redirect('/login');
};

module.exports.renderForgotForm = async (req, res) => {
    res.render('userAccounts/forgot');
};

module.exports.forgotUserPassword = async (req, res) => {
    const token = (await promisify(crypto.randomBytes)(10)).toString('hex'); //Creates a random string of characters to serve as a recovery key

    const username = req.body.username; //Acquires user email from form input

    const user = (await UserAccount.findOne({username : username},{})); //Checks if the email is associated with a user in the database

    if (!user) { //If no email exists, inform the user and redirect to the forgot page
        req.flash('error', 'No account with that email address exists.');
        res.redirect('/forgot');
    } else { //Otherwise, continue in reset password process
        await UserAccount.updateOne({username: username}, //Update the users DB entry with the randomized token, which is good for 1 hour
            {$set: {
                    resetPasswordToken: token,
                    resetPasswordExpires: Date.now() + 3600000
                }});
        const resetEmail = { //Generate a email to send to the client
            to: username, //Sends to the email address that is within the database
            from: 'passwordreset@example.com',
            subject: 'Angler Diaries Password Reset',
            text: 'You are receiving this email because there was a request to reset a password for anglerdiaries.com associated with this email address.\n' +
                'Please click on the following link, or paste into your web broswer to complete this process:\n' +
                'Token: ' + token +
                '\n\nIf you did not request this, please ignore this email and your password will remain unchanged.'
        };

        await transport.sendMail(resetEmail); //Sends the email over SMTP through gmail

        res.redirect('/recover'); //Redirects the user to the recovery page to continue with account recovery
    }
};

module.exports.renderRecoverForm = async (req, res) => {
    res.render('userAccounts/recover');
};

module.exports.recoverUserAccount = async (req, res) => {
    const { recoveryToken, password, password_verify } = req.body; //Grabs their entered token, and new password from the form

    if (recoveryToken == "") { //Recovery token cannot be empty
        req.flash('error', 'Recovery code cannot be empty');
        return res.redirect('/recover');
    }

    const user = await (UserAccount.findOne({resetPasswordToken : recoveryToken},{})); //Checks if there is an account associated with the recovery token

    if (!user) { //If there is no account with the recovery token entered, refresh the page and display error
        req.flash('error', 'Password reset token is invalid or expired.')
        return res.redirect('/recover');
    }

    if (user.resetPasswordExpires < Date.now()) { //If recovery token exists, check that it hasn't expired
        req.flash('error', 'Password reset token is invalid or expired.')
        return res.redirect('/recover');
    }

    if (!(password === password_verify)) { //Ensure the new entered passwords match, otherwise redirect
        req.flash('error', "Passwords don't match.");
        return res.redirect('/recover');
    }

    await user.updateOne({resetPasswordToken : recoveryToken}, //Update their entries in the database.
        {$set: {
                password: password, //Password set as new password
                resetPasswordToken: null, //Password token and expiration are reset, to prevent further changes
                resetPasswordExpires: null
            }});

    const resetEmail = { //Generate email to inform a user of their changes
        to: user.username,
        from: 'passwordreset@example.com',
        subject: 'Angler Diaries Password Changed',
        text: 'This is a confirmation that the password for your account ' + user.username + ' has been changed.'
    };

    await transport.sendMail(resetEmail); //Send the email through gmail SMTP

    req.flash('success', 'Success!  Your password has been changed.');
    res.redirect('/login');
};