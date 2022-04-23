// CONTROLLER file - userAccounts
// Purpose is to hold all routing methods corresponding to user accounts

// import necessary models & functions
const UserAccount = require("../views/models/User_Account");
const AnglerReport = require('../views/models/Angler_Report');
const Fish = require('../views/models/Fish');
const { cloudinary } = require('../cloudinary');

const jwt = require('jsonwebtoken');

// import libraries for our forgot password methodology
const crypto = require('crypto');
const { promisify } = require('util');
const nodemailer = require('nodemailer');
const passport = require("passport");
// setup transporter object for communication with GMAIL : app --> client
const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com', //Use gmail as SMTP transport client
    port: 465,
    auth: {
        user: 'bluelakesproject', //Credentials
        pass: process.env.GMAIL_PASS //Password included in .env file
    }
});

// NEW ROUTE - "/register"
// Provides user with page displaying account registration, assuming they're already not logged in
// authorization is handled routing side
module.exports.renderRegisterForm = async (req, res) => {
    res.render('userAccounts/register');
};

// CREATE ROUTE - "/register"
// Receives user's account submission details, runs through JOI validation, appends to DB, and signs in session
module.exports.registerUser = async (req, res, next) => {
    // Validation is done through JOI before getting to this function, but incase error ocurs in process of saving = try
    try {
        // set default rank for user which is 1, only access angler reports
        let rank = 1;
        // pull account credentials from body of form submitted
        const { username, firstName, lastName, organization, password, distPref, weightPref } = req.body;
        // save details to a newly created UserAccount mongo object (can also throw validation errors if not matching)
        const newUser = new UserAccount({username, firstName, lastName, organization, rank, distPref, weightPref});
        // register user through Passport to sign them in to the current session
        const registeredUser = await UserAccount.register(newUser, password); //Registers the user using their email(username) and password

        // never really a case where this should raise an error as we are awaiting the user account
        // to be registered and have an error catcher on thr async function, but passport requires it
        req.login(registeredUser, error => { //Logs the user in after registration and directs them to the home page
            if (error) return next(error);
            // create user folder in cloudinary
            req.flash("success", "Welcome!");
            res.redirect('/');
        });
    } catch (error) {
        //If there is an error, redirects to the register page to try and submit information again
        req.flash("error", error.message);
        res.redirect('/register')
    }
};
// mobile version of registerUser, still uses passport but sends JWT token to device for later requests instead of redirect
module.exports.mobileRegister = async (req, res, next) => {
    try {
        console.log("Registering mobile user")
        // set default rank for user which is 1, only access angler reports
        let rank = 1;
        // pull account credentials from body of form submitted
        const { username, firstName, lastName, organization, password, distPref, weightPref } = req.body;
        // save details to a newly created UserAccount mongo object (can also throw validation errors if not matching)
        const newUser = new UserAccount({username, firstName, lastName, organization, rank, distPref, weightPref});
        // register user through Passport to sign them in to the current session
        const registeredUser = await UserAccount.register(newUser, password); //Registers the user using their email(username) and password

        req.login(registeredUser, error => {
            if (error) return res.status(422).send(error.message);
            const token = jwt.sign({ userId: newUser._id }, process.env.MOBILE_KEY)
            res.send( { token });
        })
    } catch (error) {
        return res.status(422).send(error.message)
    }
}


// NEW ROUTE - "/register"
// Provides user with profile page displaying their information
module.exports.renderProfile = async (req, res) => {
    res.render('userAccounts/profile');
};
// UPDATE ROUTE - "/updateRank"
// Receives updated rank from a user submitted form and updates submitted user account's rank
module.exports.updateRank = async (req, res) => {
    // ensure administrator is doing this action
    if (req.user.rank < 3) {
        // if not, redirect back to profile page with flash warning of error
        req.flash('error', "Your account doesn't have permission.");
        return res.redirect('/profile');
    }
    // if they are administrator, pull email and rank submitted for update
    const {update_username, update_rank} = req.body; //Updates a existing users rank

    // Attempt to find user in DB with that email address
    const updateUser = (await UserAccount.findOne({username: update_username}, {})); //Can use username as key since username (email) must be unique for each account

    // If email doesn't exist, inform the user with flash and redirect them back to profile page
    if (!updateUser) {
        req.flash('error', 'User does not exist');
        res.redirect('/profile');
    } else { //User exists, update their rank
        // If the user does exist, update the rank of the corresponding user account to what was submitted
        await UserAccount.updateOne({username: update_username}, {$set: {rank: update_rank}});
        // send back to profile with success flash message
        req.flash('success', 'User has been updated.  Rank = ' + update_rank);
        res.redirect('/profile');
    }
};

// ** USER PASSWORD METHODS **

// EDIT ROUTE - "/changePassword"
// Providers user with ChangePassword form, authorization handled routing side (ensuring user isn't logged in currently)
module.exports.renderChangePassword = async (req, res) => {
    res.render('userAccounts/changePassword');
};
// UPDATE ROUTE - "/changePassword"
// Purpose: Receives user submitted information from form including the password they want to set as new
module.exports.changePassword = async (req, res) => {
    // find user account in DB based on currently logged in user's ID
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

// GET ROUTE - "/login"
// Purpose: Provide user with Login form, authorization handled routing side
module.exports.renderLoginForm = async (req, res) => {
    res.render('userAccounts/login');
};
// CREATE ROUTE - "/login"
// Purpose: Called after a user successfully login's through passports functionality
module.exports.loginUser = async (req, res) => {
    // set success flash message accordingly
    req.flash('success', "Welcome back!");
    // if they were redirected due to not originally being logged in bring that up here, if not send to home
    const redirectURL = req.session.returnTo || '/';
    // clear original page from session to reduce overhead
    delete req.session.returnTo;
    // redirect to previous page / home
    res.redirect(redirectURL);
};
module.exports.mobileLogin = async (req, res) => {
    console.log("Logging in from mobile");
    const loggedInUser = req.user;
    const token = jwt.sign({ userId: loggedInUser._id }, process.env.MOBILE_KEY)
    res.send({ token, loggedInUser });
}

// CREATE ROUTE - "/logout"
// Purpose: Called after a user successfully log's out through passports functionality
module.exports.logoutUser = (req, res) => {
    // log out of current session, set flash message, and redirect to login
    req.logout();
    if (req.headers.authorization) {
        console.log('mobile logout');
        res.send({ loggedOut: true })
    } else {
        req.flash("success", "Goodbye");
        res.redirect('/login');
    }
};
module.exports.mLogoutUser = (req, res) => {
    req.logout();
    res.send({ loggedOut: true })
}

// ** FORGOT PASSWORD METHODS **

// GET ROUTE - "/forgot"
// Purpose: Provide user with forgot password form
module.exports.renderForgotForm = async (req, res) => {
    res.render('userAccounts/forgot');
};
// CREATE ROUTE - "/forgot"
// Purpose: Receive email address from form submission and send account recovery token over email to user
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
        // TODO: Change with live site link
        let tokenLink = 'http://localhost:3000/recover?token=' + token
        //Generate a email to send to the client
        const resetEmail = {
            to: username, //Sends to the email address that is within the database
            from: 'passwordreset@example.com',
            subject: 'Angler Diaries Password Reset',
            text: 'You are receiving this email because there was a request to reset a password for anglerdiaries.com associated with this email address.\n' +
                'Please click on the following link, or paste into your web browser to complete this process:\n' +
                'Token: ' + token + '\n' +
                "Link: " + tokenLink +
                '\n\nIf you did not request this, please ignore this email and your password will remain unchanged.'
        };

        //Sends the email over SMTP through gmail
        await transport.sendMail(resetEmail);

        //Redirects the user to the recovery page to continue with account recovery
        res.redirect('/recover');
    }
};
module.exports.mForgotUserPassword = async (req, res) => {
    //Creates a random string of characters to serve as a recovery key
    const token = (await promisify(crypto.randomBytes)(10)).toString('hex');
    //Acquires user email from form input
    const username = req.body.username;

    //Checks if the email is associated with a user in the database
    const user = (await UserAccount.findOne({username : username},{}));

    if (!user) {
        res.send({ 'error': 1, 'message': 'No user found with email' })
    } else {
        //Update the users DB entry with the randomized token, which is good for 1 hour
        await UserAccount.updateOne({username: username},
            {$set: {
                    resetPasswordToken: token,
                    resetPasswordExpires: Date.now() + 3600000
                }});
        // TODO: Change with live site link
        let tokenLink = 'http://localhost:3000/recover?token=' + token
        //Generate a email to send to the client
        const resetEmail = {
            to: username, //Sends to the email address that is within the database
            from: 'passwordreset@example.com',
            subject: 'Angler Diaries Password Reset',
            text: 'You are receiving this email because there was a request to reset a password for anglerdiaries.com associated with this email address.\n' +
                'Please click on the following link, or paste into your web browser to complete this process:\n' +
                'Token: ' + token + '\n' +
                "Link: " + tokenLink +
                '\n\nIf you did not request this, please ignore this email and your password will remain unchanged.'
        };

        //Sends the email over SMTP through gmail
        await transport.sendMail(resetEmail);

        res.send({ error: 0 })
    }
}

// GET ROUTE - "/recover"
// Purpose: Provide user with recover password form, should be here after submitted a forgotPassword request
module.exports.renderRecoverForm = async (req, res) => {
    const token = req.query.token;
    res.render('userAccounts/recover', {token});
};
// CREATE ROUTE - "/recover"
// Purpose: Receive personalized token from user form sent over email, and allow them to enter newly created password
module.exports.recoverUserAccount = async (req, res) => {
    //Grabs their entered token, the new password, and the verified new password from the form
    const { recoveryToken, password, password_verify } = req.body;

    // Should be handled client side with JS validation, but just in case check if recovery token is empty
    if (recoveryToken === "") {
        req.flash('error', 'Recovery code cannot be empty');
        return res.redirect('/recover');
    }

    //Checks if there is an account associated with the recovery token
    const foundUser = await (UserAccount.findOne({resetPasswordToken : recoveryToken},{}));

    //If there is no account with the recovery token entered, refresh the page and display error
    if (!foundUser) {
        req.flash('error', 'Password reset token is invalid or expired.')
        return res.redirect('/recover');
    }

    //If recovery token exists, check that it hasn't expired
    if (foundUser.resetPasswordExpires < Date.now()) {
        req.flash('error', 'Password reset token is invalid or expired.')
        return res.redirect('/recover');
    }

    //Ensure the new entered passwords match, otherwise redirect
    if (!(password === password_verify)) {
        req.flash('error', "Passwords don't match.");
        return res.redirect('/recover');
    }

    //Sets the users password to the updated password
    foundUser.setPassword(password, async function (err) {
        if (err) {
            // if an error happens to occur while updating the password send them back to recover page with error
            req.flash('error', err.name)
            return res.redirect('/recover')
        } else {
            // if success, save the user's new info to the DB
            await foundUser.save(); //Must save after .setPassword, but not after .changePassword
            //Generate email to inform a user of their changes
            const resetEmail = {
                to: foundUser.username,
                from: 'passwordreset@example.com',
                subject: 'Angler Diaries Password Changed',
                text: 'This is a confirmation that the password for your account ' + foundUser.username + ' has been changed.'
            };

            //Update the users DB entry with the randomized token, which is good for 1 hour
            await UserAccount.updateOne({username: foundUser.username},
                {$unset: { //Unset completely removes the keys from the database, so once a user changes their password the tokens cannot be used again
                        resetPasswordToken: "",
                        resetPasswordExpires: ""
                    }});

            //Send the email through gmail SMTP
            await transport.sendMail(resetEmail);

            //Redirects the user to the login page where they can use their new password
            req.flash('success', 'Success!  Your password has been changed.');
            return res.redirect('/login');
        }
    });
};

// GET ROUTE - "/updateProfile"
// Purpose: Provide user with update profile details form, assuming they are already logged in
module.exports.renderUpdateProfile = async(req, res) => {
    res.render('userAccounts/edit.ejs');
};
// UPDATE ROUTE - "/updateProfile"
// Purpose: Receive updated user account information from form and update the associated user accounts data in DB
module.exports.updateProfile = async(req, res) => {
    // Extract & Save all fields from form passed in
    const { currentUsername, username, firstName, lastName, organization, distPref, weightPref } = req.body;

    // incase they decide to change email, need to lookup and ensure its not already used in an account
    if (username !== currentUsername) {
        // check if for different account w/email
        const matchingAccount = await UserAccount.findOne({username: username});
        // if the email is already in use, alert the user accordingly
        if (matchingAccount) {
            req.flash('error', "Email is associated with an account already");
            return res.redirect('/profile')
        }
        // if no different account can proceed with username swap, need to update session as well so it doesn't log them out
        req.session.passport.user = username;
    }

    // Pull existing profile picture
    let profilePhoto = req.user.profilePhoto;
    // Profile Photo Swap Check
    if (req.file) {
        // first can delete previous pfp from DB as new one is uploaded
        await cloudinary.uploader.destroy(profilePhoto.filename);

        // pull url and filename from multer
        const url = req.file.path;
        const filename = req.file.filename;

        // setup as new picture object for mongo schema
        let newProfilePicture = {
            url,
            filename
        }

        // update profilePhoto variable to be updated in mongo call
        profilePhoto = newProfilePicture;
    }

    // Update profile based on id with the saved fields
    await UserAccount.updateOne(
        {username: currentUsername},
        {$set: {username: username, firstName: firstName, lastName: lastName, organization: organization, distPref: distPref, weightPref: weightPref, profilePhoto: profilePhoto}}
    );

    // redirect to profile page after all successfully updated
    res.redirect('/profile');
}
module.exports.mUpdateProfile = async (req, res) => {
    const { currentUsername, username, firstName, lastName, organization, distPref, weightPref } = req.body;

    // updated username (email) check
    if (username !== currentUsername) {
        const matchingAccount = await UserAccount.findOne({username: username});
        // if the email is already in use, alert the user accordingly
        if (matchingAccount) {
            res.send('error')
        }
        // if no different account can proceed with username swap, need to update session as well so it doesn't log them out
        req.session.passport.user = username;
    }

    // pull current profile photo incase swap needed
    let profilePhoto = req.user.profilePhoto;
    if (req.file) {
        // first can delete previous pfp from DB as new one is uploaded
        await cloudinary.uploader.destroy(profilePhoto.filename);

        // pull url and filename from multer
        const url = req.file.path;
        const filename = req.file.filename;

        // setup as new picture object for mongo schema
        let newProfilePicture = {
            url,
            filename
        }

        // update profilePhoto variable to be updated in mongo call
        profilePhoto = newProfilePicture;
    }

    // Update profile based on id with the saved fields
    await UserAccount.updateOne(
        {username: currentUsername},
        {$set: {username: username, firstName: firstName, lastName: lastName, organization: organization, distPref: distPref, weightPref: weightPref, profilePhoto: profilePhoto}}
    );

    // const updatedUser = req.user;
    let updatedUser = await UserAccount.findOne({username: currentUsername})
    res.send({'error': 0, user: updatedUser})
}

// DESTORY ROUTE - "/deleteAccount"
// Purpose: Receive request from user to delete their account, remove from DB as well as corresponding reports &
// images associated to cloudinary under this account as well.
let deleteAccountMethod = async(req) => {
    // get current user from session
    const userEmail  = req.session.passport.user;
    // lookup the user in the DB
    const currentUser = await UserAccount.findOne({username: userEmail})

    // setup list for photoID's that will be associated with this user
    let photoIdList = [];
    // Delete users cloudinary folder with all images inside
    // find all fish linked to creator
    let allFish = await Fish.find({creator: currentUser.id})
    // iterate over each fish and append the photo filename to photoIdList
    allFish.forEach(fish => {
        fish.photo.forEach(photo => {photoIdList.push(photo.filename)});
    })

    // filter out any default fish photos used from array to ensure we're only looking at user uploaded photos
    photoIdList = photoIdList.filter(id => {
        if (id !== 'defaultFishPhoto'){
            return id
        }
    })

    // if photos found, pass that list into delete_resources to delete from cloudinary
    if (photoIdList.length > 0){
        console.log('deleting photos')
        await cloudinary.api.delete_resources(photoIdList, function (error, result) {console.log(result, error)})
        // delete now empty cloudinary folder with delete_folder
        await cloudinary.api.delete_folder('BlueLakes/' + currentUser.id, function(error, result) {console.log(result, error)});
    }

    // Find in Database and delete
    await UserAccount.findOneAndDelete({username: userEmail});

    // Delete Profile Picture from Cloudinary
    let profilePhoto = req.user.profilePhoto;
    // Filename's are unique in cloudinary and this is the default PFP, don't want this to get deleted
    if (profilePhoto.filename !== "defaultProfilePhoto_sltfqt") {
        // if user has changed their pfp, delete it
        await cloudinary.uploader.destroy(profilePhoto.filename);
    }
    return {'error': 0}
}
module.exports.deleteProfile = async(req, res) => {
   let response = await deleteAccountMethod(req);

   if (response.error === 0) {
       // Redirect to login page
       req.flash('success', "Successfully deleted Account"); //Redirect user
       res.redirect('/login');
   } else {
       console.log('error deleting account')
   }

}
module.exports.mDeleteProfile = async (req, res) => {
    let response = await deleteAccountMethod(req);

    if (response.error === 0) {
        res.send({'error': 0})
    } else {
        res.send({'error': 1})
    }
}
