const mongoose = require('mongoose');
const { Schema } = mongoose;

// create a template for the table (layed out in the db schema)
const fishSchema = new mongoose.Schema({
    report_fk: { //Foreign key associated with the parent report
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Angler_Report'
    },
    creator: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User_Account'
    },
    species: {
        type: String,
        required: true
    },
    length: {
        type: Number
    },
    weight: {
        type: Number
    },
    photo: [
        {
            url: {
                type: String,
                default: 'https://res.cloudinary.com/the-land-between/image/upload/v1624334081/BlueLakes/defaultFishPhoto.png'
            },
            filename: String
        }
    ]
});

// assign it to a variable to create instances of the model
const Fish = mongoose.model('Fish', fishSchema);

module.exports = Fish;
