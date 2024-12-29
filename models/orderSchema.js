    const mongoose = require('mongoose');
    const Razorpay = require('razorpay');
    const {Schema} =mongoose
    const {v4:uuidv4, stringify}=require('uuid');

    const orderSchema = new Schema({
        orderId:{
            type:String,
            default:()=>uuidv4(),
            unique:true

        },
        userId:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true,   
        },
        orderedItems:[{
            product:{
                type:Schema.Types.ObjectId,
                ref:'Product',
                required:true
            },
            quantity:{
                type:Number,
                required:true
            },
            price:{
                type:Number,
                default:0
            }
        }],
        totalPrice:{
            type:Number,
            required:true
        },
        discount:{
            type:Number,
            default:0
        },
        finalAmount:{
            type:Number,
            required:true    
        },
        address:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        invoiceDate:{
            type:Date
        },
        status:{
            type:String,
            required:true,
            enum:['pending','Processing','Shipped','Delivered','Cancelled','Return Request','Returned'],
            default:'pending'
        },
        createdOn:{
            type:Date,
            default:Date.now,
            required:true
        },
        couponApplied:{
            type:Boolean,
            default:false,
        },
        paymentMethod:{
            type:String,
            enum:['card','net-banking','upi','emi','cod','razorpay',"DE Wallet"],
            default:'cod'
        },
        RazorpayOrderId:{
            type:String,
            default:"none"
        }
    })


    const Order= mongoose.model('Order',orderSchema)
    module.exports = Order;