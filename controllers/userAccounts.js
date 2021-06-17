const UserAccount = require("../views/models/User_Account");

// Forgot password items
const crypto = require('crypto');
const { promisify } = require('util');
const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({ //Transporter service to communicate with G-Mail for app->client emails
    host: 'smtp.gmail.com', //Use gmail as SMTP transport client
    port: 465,
    auth: {
        user: 'bluelakesproject', //Credentials
        pass: process.env.GMAIL_PASS //Password included in .env file
    }
});

module.exports.renderRegisterForm = async (req, res) => {
    res.render('userAccounts/register');
};

//Executes upon register form submission
module.exports.registerUser = async (req, res, next) => {
    try {
        let rank = 1; //Default rank for a user is 1, unless upgraded by an administrator after account creation
        const { username, firstName, lastName, organization, password, distPref, weightPref } = req.body; //Gets all associated credentials from request
        const newUser = new UserAccount({username, firstName, lastName, organization, rank, distPref, weightPref}); //Creates a new user object
        const registeredUser = await UserAccount.register(newUser, password); //Registers the user using their email(username) and password
        // never really a case where this should raise an error as we are awaiting the user account
        // to be registered and have an error catcher on thr async function, but passport requires it
        req.login(registeredUser, error => { //Logs the user in after registration and directs them to the home page
            if (error) return next(error);
            req.flash("success", "Welcome!");
            res.redirect('/');
        });
    } catch (error) { //If there is an error, redirects to the register page
        req.flash("error", error.message);
        res.redirect('/register')
    }
};

//PROFILE PAGE METHODS
module.exports.renderProfile = async (req, res) => {
    res.render('userAccounts/profile');
};
module.exports.updateRank = async (req, res) => {
    if (req.user.rank < 3) { //Must be an administrator (rank 3) to execute
        req.flash('error', "Your account doesn't have permission."); //If user doesn't have correct rank, reject and redirect to profile page
        return res.redirect('/profile');
    }
    const {update_username, update_rank} = req.body; //Updates a existing users rank

    //Tries to see if the user exists
    const updateUser = (await UserAccount.findOne({username: update_username}, {})); //Can use username as key since username (email) must be unique for each account

    if (!updateUser) { //If no email exists, inform the user and redirect to the forgot page
        req.flash('error', 'User does not exist');
        res.redirect('/profile');
    } else { //User exists, update their rank
        await UserAccount.updateOne({username: update_username}, {$set: {rank: update_rank}});
        req.flash('success', 'User has been updated.  Rank = ' + update_rank); //User now has permissions associated with their rank
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
    req.logout(); //Logs the user out of the current session
    req.flash("success", "Goodbye");
    res.redirect('/login');
};

//FORGOT PASSWORD METHODS
module.exports.renderForgotForm = async (req, res) => {res.render('userAccounts/forgot');};
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

module.exports.renderRecoverForm = async (req, res) => {res.render('userAccounts/recover');};
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

    foundUser.setPassword(password, async function (err) { //Sets the users password to the updated password
        if (err) {
            req.flash('error', err.name)
            return res.redirect('/recover')
        } else {
            await foundUser.save(); //Must save after .setPassword, but not after .changePassword
            const resetEmail = { //Generate email to inform a user of their changes
                to: foundUser.username,
                from: 'passwordreset@example.com',
                subject: 'Angler Diaries Password Changed',
                text: 'This is a confirmation that the password for your account ' + foundUser.username + ' has been changed.'
            };

            await UserAccount.updateOne({username: foundUser.username}, //Update the users DB entry with the randomized token, which is good for 1 hour
                {$unset: { //Unset completely removes the keys from the database, so once a user changes their password the tokens cannot be used again
                        resetPasswordToken: "",
                        resetPasswordExpires: ""
                    }});

            await transport.sendMail(resetEmail); //Send the email through gmail SMTP

            req.flash('success', 'Success!  Your password has been changed.');
            return res.redirect('/login'); //Redirects the user to the login page where they can use their new password
        }
    });
};


// UPDATE PROFILE ROUTE
module.exports.renderUpdateProfile = async(req, res) => { res.render('userAccounts/edit.ejs'); };
module.exports.updateProfile = async(req, res) => {
    // Save all fields from form passed in
    const { currentUsername, username, firstName, lastName, organization, distPref, weightPref } = req.body;

    // incase they decide to change email, need to lookup and ensure its not already used in an account
    if (username !== currentUsername) {
        console.log("changing username")
        // check if for different account w/email
        const matchingAccount = await UserAccount.findOne({username: username});
        if (matchingAccount) {
            req.flash('error', "Email is associated with an account already");
            return res.redirect('/profile')
        }
        // if no different account can proceed with username swap, need to update session accordingly
        req.session.passport.user = username;
    }

    // Update profile based on id with the saved fields
    await UserAccount.updateOne({username: currentUsername}, {$set: {username: username, firstName: firstName, lastName: lastName, organization: organization, distPref: distPref, weightPref: weightPref}});

    // redirect to profile page
    res.redirect('/profile');
}
