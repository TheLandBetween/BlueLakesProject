const mongoose = require('mongoose');
const {MongoClient} = require('mongodb');


//URI defined by credentials:
//  user: bluelakes
//  pass: pbTk3KiYV2yg6LQ4
const URI = 'mongodb+srv://bluelakes:pbTk3KiYV2yg6LQ4@cluster0.xk0y2.mongodb.net/BlueLakes?retryWrites=true&w=majority'

//Connect to the Mongo Atlas database
connectDB = async () => {
    const connection =  await mongoose.connect(URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
    console.log('Database Connected...');
};

module.exports = connectDB;