const mongoose =require('mongoose')
const {Schema}= mongoose

const couponSchema = new Schema({
     name:{
        type:String,
        required:true,
        unique:true
     },
     
    createdOn:{
        type:Date,
        default:Date.now,
        required:true
    },
    expireOn:{
        type:Number,
        required:true
    },
    offerPrice:{
        type:Number,
        required:true
    },
    minimumPrice:{
        type:Number,
        require:true
    },
    isList:{
        type:Boolean,
        default:true
    },
    status:{
        type:Boolean,
        default:false
    },
    UserId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }]
     

})

const Coupon = mongoose.model('Coupon',couponSchema)
module.exports=Coupon