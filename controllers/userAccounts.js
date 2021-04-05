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
        pass: process.env.GMAIL_PASS
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

//PROFILE PAGE
module.exports.renderProfile = async (req, res) => {
    res.render('userAccounts/profile');
};
module.exports.updateRank = async (req, res) => {
    const {update_username, update_rank} = req.body;

    const updateUser = (await UserAccount.findOne({username: update_username}, {}));

    if (!updateUser) { //If no email exists, inform the user and redirect to the forgot page
        req.flash('error', 'User does not exist');
        res.redirect('/profile');
    } else {
        await UserAccount.updateOne({username: update_username}, {$set: {rank: update_rank}});
        req.flash('success', 'User has been updated.  Rank = ' + update_rank);
        res.redirect('/profile');
    }
};

// CHANGE PASSWORD
// Purpose: Render functionality, display the change password page
module.exports.renderChangePassword = async (req, res) => {
    res.render('userAccounts/changePassword');
};
// Purpose: Retrieve the user account associated with the currently logged in user and update their password
// when provided their current password and a new password.
module.exports.changePassword = async (req, res) => {
    // find user account based on currently logged in user's ID
    const foundUser = await UserAccount.findOne({ _id: req.user._id })
    
    // If no user found flash appropriate error
    // THIS SHOULD NEVER HAPPEN, since user must be logged in to get to the form submission page.
    if(!foundUser) {
        req.flash('error', "User does not exist")
        res.redirect('userAccounts/changePassword')
    } else {
        // pull old password and new password from form submission
        const { password, password_new } = req.body;

        // use passport's changePassword method to update the found account's password
        await foundUser.changePassword(password, password_new, function(err) {
            if (err) {
                // if an error comes up (such as incorrect old password, flash the error
                req.flash('error', err.name)
                res.redirect('userAccounts/changePassword')
            } else {
                // if no error password has been succesfully changed, send them back to profile.
                req.flash('success', "Your password has been updated")
                res.redirect('/profile')
            }
        })
    }
};

module.exports.renderUpdateName = async (req, res) => {res.render('userAccounts/updateName');};
module.exports.updateName = async (req, res) => {
    const { username, firstName, lastName } = req.body;

    await UserAccount.updateOne({username: username}, {$set: {firstName: firstName, lastName: lastName}});

    req.flash('success', "Display name updated.")
    res.redirect('/profile')
};

module.exports.renderUpdateOrganization = async (req, res) => {res.render('userAccounts/updateOrganization.ejs');};
module.exports.updateOrganization = async (req, res) => {
    const { username, organization } = req.body;

    await UserAccount.updateOne({username: username}, {$set: {organization: organization}});

    req.flash('success', "Organization updated.")
    res.redirect('/profile')
};


//LOGIN
module.exports.renderLoginForm = async (req, res) => {
    res.render('userAccounts/login');
};

module.exports.loginUser = async (req, res) => {
    req.flash('success', "Welcome back!");
    // set to url if navigated from page, or send to home page if not
    const redirectURL = req.session.returnTo || '/';
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
    //Creates a random string of characters to serve as a recovery key
    const token = (await promisify(crypto.randomBytes)(10)).toString('hex');
    //Acquires user email from form input
    const username = req.body.username;

    //Checks if the email is associated with a user in the database
    const user = (await UserAccount.findOne({username : username},{}));

    //If no email exists, inform the user and redirect to the forgot page
    if (!user) {
        req.flash('error', 'No account with that email address exists.');
        res.redirect('/forgot');
    } else { //Otherwise, continue in reset password process
        //Update the users DB entry with the randomized token, which is good for 1 hour
        await UserAccount.updateOne({username: username},
            {$set: {
                    resetPasswordToken: token,
                    resetPasswordExpires: Date.now() + 3600000
                }});
        //Generate a email to send to the client
        const resetEmail = {
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

    if (recoveryToken === "") { //Recovery token cannot be empty
        req.flash('error', 'Recovery code cannot be empty');
        return res.redirect('/recover');
    }

    const foundUser = await (UserAccount.findOne({resetPasswordToken : recoveryToken},{})); //Checks if there is an account associated with the recovery token

    if (!foundUser) { //If there is no account with the recovery token entered, refresh the page and display error
        req.flash('error', 'Password reset token is invalid or expired.')
        return res.redirect('/recover');
    }

    if (foundUser.resetPasswordExpires < Date.now()) { //If recovery token exists, check that it hasn't expired
        req.flash('error', 'Password reset token is invalid or expired.')
        return res.redirect('/recover');
    }

    //Ensure the new entered passwords match, otherwise redirect
    if (!(password === password_verify)) {
        req.flash('error', "Passwords don't match.");
        return res.redirect('/recover');
    }

    foundUser.setPassword(password, async function (err) {
        if (err) {
            req.flash('error', err.name)
            return res.redirect('/recover')
        } else {
            await foundUser.save();
            const resetEmail = { //Generate email to inform a user of their changes
                to: foundUser.username,
                from: 'passwordreset@example.com',
                subject: 'Angler Diaries Password Changed',
                text: 'This is a confirmation that the password for your account ' + foundUser.username + ' has been changed.'
            };

            await UserAccount.updateOne({username: foundUser.username}, //Update the users DB entry with the randomized token, which is good for 1 hour
                {$unset: {
                        resetPasswordToken: "",
                        resetPasswordExpires: ""
                    }});

            await transport.sendMail(resetEmail); //Send the email through gmail SMTP

            req.flash('success', 'Success!  Your password has been changed.');
            return res.redirect('/login');
        }
    });

};