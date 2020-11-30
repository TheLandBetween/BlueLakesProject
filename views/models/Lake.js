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
    }
}]
