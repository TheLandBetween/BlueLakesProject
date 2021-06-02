const mongoose = require('mongoose');
const {MongoClient} = require('mongodb');

//MongoDB URI connection with credentials in the .ENV file
const URI = 'mongodb+srv://' + process.env.MONGODB_USER + ':' + process.env.MONGODB_PASS + '@bluelakes.y8ojb.mongodb.net/bluelakes?retryWrites=true&w=majority'

//Connect to the Mongo Atlas database
connectDB = async () => {
    const connection =  await mongoose.connect(URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
    console.log('Database Connected...');
};

module.exports = connectDB;