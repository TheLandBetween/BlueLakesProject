const mongoose = require('mongoose');
const { Schema } = mongoose;

// create a template for the table (layed out in the db schema)
const point = new mongoose.Schema({
    type: { //GeoJSON point
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: { //Number array, will contain a x at coordinates[0] and a y at coordinates[1]
        type: [Number],
        required: true
    }
});

// assign it to a variable to create instances of the model
const Point = mongoose.model('Point', point);

module.exports = Point;