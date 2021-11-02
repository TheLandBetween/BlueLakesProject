// MongoDB Schema - Single Point Schema, used to represent coordinates in other models (GeoJSON)
//    type - String (as GeoJSON) - required
//    coordinates - [Number] - required

// Necessary imports, Mongoose / Point Schema
const mongoose = require('mongoose');
const { Schema } = mongoose;

// define single point entry schema
const point = new mongoose.Schema({
    //GeoJSON point
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    //Number array, will contain a x at coordinates[0] and a y at coordinates[1]
    coordinates: {
        type: [Number],
        required: true
    }
});

// assign it to a variable to create instances of the model & export for use elsewhere
const Point = mongoose.model('Point', point);
module.exports = Point;
