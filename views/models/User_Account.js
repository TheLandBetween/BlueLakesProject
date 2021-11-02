// MongoDB Schema - User Account
//   username (email) - String
//   firstName - String
//   lastName - String
//   organization - String
//   distPref - String
//   weightPref - String
//   resetPasswordToken - String
//   resetPasswordExpires - Number
//   rank - Number
//   profilePhoto - { url: String, filename: String }

// instantiate mongoose w/schema, and passport authentication method
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

// define UserSchema
const UserSchema = new Schema({
    //HTML input verifies that the type is 'email', but no further validation is done.
    //User could input a email that doesn't exist and use the account, but if they needed to reset password if they forgot, it wouldn't be possible
    //Must be unique so a email is not used twice
    username: {
        type: String,
        required: true,
        unique: true
    },
    // firstName required upon account signup
    firstName: {
        type: String,
        required: true
    },
    // lastName required upon account signup
    lastName: {
        type: String,
        required: true
    },
    // organization NOT required
    organization: {
        type: String
    },
    // distPref : cm / inches, required on signup
    distPref: {
        type: String,
        required: true
    },
    // weightPref: lbs/kg, required on signup
    weightPref: {
        type: String,
        required: true
    },
    //Initialized upon a password reset request, and deleted after password is reset
    resetPasswordToken: {
        type: String
    },
    //Tracks how long a code is good for.  Duration can be changed in 'User_Accounts', currently set for 1h
    resetPasswordExpires: {
        type: Number
    },
    // rank - Angler(rank=1), Researcher(rank=2), Administrator(rank=3)
    rank: {
        type: Number,
        required: true,
        default: 1
    },
    // profilePhoto, not required on signup and will be filled with default image if not provided.
    profilePhoto: {
        url: {
            type: String,
            default: 'https://res.cloudinary.com/the-land-between/image/upload/v1624667448/BlueLakes/defaultProfilePhoto_sltfqt.png'
        },
        filename: {
            type: String,
            default: "defaultProfilePhoto_sltfqt"
        }
    }
});

// run userSchema through passport validation and export.
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User_Account', UserSchema);
