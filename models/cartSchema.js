const { CancellationToken } = require('mongodb')
const mongoose=require('mongoose')
const {Schema}= mongoose

const CartSchema = new Schema({

    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true

    },
    items:[{
        productId:{
            type:Schema.Types.ObjectId,
            ref:'Product',
            required:true
        },
        quantity:{
            type:Number,
            default:1
        },
        price:{
            type:Number,
            required:true
        },
        totalPrice:{
            type:Number,
            required:true
        },
        status:{
            type:String,
            default:'Placed'
        },
        CancellationReason:{
            type:String,
            default:"none"
        }

    }]
})

const Cart = new mongoose.model('Cart',CartSchema)
module.exports=Cart;
