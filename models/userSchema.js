const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        default: null,
    },
    googleId: {
        type: String,  // Ensure googleId is unique
        default: null, // Allow googleId to be null
      },
    password: {
        type: String,
        required: false,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    cart: [{
        type: Schema.Types.ObjectId,
        ref: 'Cart', // Ensure you have a Cart schema
    }],
    wishlist: [{
        type: Schema.Types.ObjectId,
        ref: 'Product', // Assuming products are added to the wishlist
    }],
    wallet: [{
        type: Schema.Types.ObjectId,
        ref: 'Wallet', // Assuming a Wallet schema exists
    }],
    orderHistory: [{
        type: Schema.Types.ObjectId,
        ref: 'Order', // Ensure you have an Order schema
    }],
    createdOn: {
        type: Date,
        default: Date.now,
    },
    referalCode: {
        type: String,
    },
    redeemed: {
        type: Boolean,
        default: false,
    },
    redeemedUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    searchHistory: [{
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category', // Ensure you have a Category schema
        },
        brand: {
            type: String,
        },
        searchOn: {
            type: Date,
            default: Date.now,
        },
    }],
});

const User = mongoose.model('User', userSchema);
module.exports = User;
