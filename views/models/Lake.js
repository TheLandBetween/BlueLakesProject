const mongoose = require('mongoose');
const { Schema } = mongoose;

const lakeSchema = new Schema ({
    // think this should be our main variable rather than Lake_Town to include exact coordinates
    Location: {
        Lake_Town: { type: String },
        coordinates: {
            x: {type: String},
            y: {type: String}
        }
    },
    Official_Lake_Name: { type: String },
    Unofficial_Lake_Name: { type: String },
    Stocked: { type: Number },
    healthReports: [
        {
            type: Schema.Types.ObjectID,
            ref: 'Lake_Health_Report'
        }
    ]
});

const Lake = mongoose.model('Lake', lakeSchema);
module.exports = Lake;
