const mongoose = require('mongoose');

//URI defined by credentials:
//  user: bluelakes
//  pass: pbTk3KiYV2yg6LQ4
const URI = 'mongodb+srv://bluelakes:pbTk3KiYV2yg6LQ4@cluster0.xk0y2.mongodb.net/BlueLakes?retryWrites=true&w=majority'

//Connect to the Mongo Atlas database
const connectDB = async () => {
    await mongoose.connect(URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
    console.log('Database Connected...');
};

module.exports = connectDB;