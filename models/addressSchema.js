const mongoose=require('mongoose')
const { defaultMaxListeners } = require('nodemailer/lib/xoauth2')
const { bool } = require('sharp')
const {Schema}=mongoose


const addressSchema =new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    address:[{
        
        addressType:{
            type:String,
            required:true
        },
        name:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        landMark:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        pincode:{
            type:Number,
            required:true
        },
        phone:{
            type:String,
            required:true
        },
        altPhone:{
            type:String,
            required:true
        },
        isSelected:{
            type:Boolean,
            default:false
            
        }
    }]
})

const Address =mongoose.model('Address',addressSchema)

module.exports=Address