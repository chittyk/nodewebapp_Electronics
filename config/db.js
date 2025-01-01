const mongoose =require('mongoose')
const  env =require('dotenv').config()
/*
const connectDB = async()=>{
    try{
	console.log("mongos uri",process.env.MONGODB_URI)
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('database is connected')
    }
    catch(error){
        console.log('error in db connection')
        process.exit(1)
    }
}

module.exports = connectDB
*/



//const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Log the connection URI for debugging
        console.log("MongoDB URI:", process.env.MONGODB_URI);

        // Connect to the database with recommended options
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true, // Avoids deprecation warnings
            useUnifiedTopology: true, // Uses the new Server Discover and Monitoring engine
        });

        console.log('Database is connected');
    } catch (error) {
        console.error('Error in database connection:', error.message);
        // Exit the process with a failure code
        process.exit(1);
    }
};

module.exports = connectDB;

