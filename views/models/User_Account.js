
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { //HTML input verifies that the type is 'email', but no further validation is done.
        type: String, //User could input a email that doesn't exist and use the account, but if they needed to reset password if they forgot, it wouldn't be possible
        required: true,
        unique: true //Must be unique so a email is not used twice
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    organization: {
        type: String
    },
    distPref: {
        type: String
    },
    weightPref: {
        type: String
    },
    resetPasswordToken: { //Initialized upon a password reset request, and deleted after password is reset
        type: String
    },
    resetPasswordExpires: { //Tracks how long a code is good for.  Duration can be changed in 'User_Accounts', currently set for 1h
        type: Number
    },
    rank: { //Angler(rank=1), Researcher(rank=2), Administrator(rank=3)
        type: Number,
        required: true
    }
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User_Account', UserSchema);
