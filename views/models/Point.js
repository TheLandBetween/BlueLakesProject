const mongoose = require('mongoose');
const { Schema } = mongoose;

// create a template for the table (layed out in the db schema)
const point = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
});

// assign it to a variable to create instances of the model
const Point = mongoose.model('Point', point);

module.exports = Point;