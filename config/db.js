const mongoose =require('mongoose')
const  env =require('dotenv').config()

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('database is connected')
    }
    catch(error){
        console.log('error in db connection')
        process.exit(1)
    }
}

module.exports = connectDB