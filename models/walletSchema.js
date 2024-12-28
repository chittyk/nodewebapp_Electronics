const mongoose = require('mongoose');

// Define Wallet Schema
const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0.0, // Default balance
        min: 0 // Ensure balance cannot be negative
    },
    transactions: [
        {
            transactionType: {
                type: String,
                enum: ['credit', 'debit'], // Allow only credit or debit
                required: true
            },
            amount: {
                type: Number,
                required: true,
                min: 0.01 // Minimum transaction amount
            },
            date: {
                type: Date,
                default: Date.now // Automatically set the transaction date
            },
            description: {
                type: String,
                default: 'Recharged'
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update `updatedAt` field on save
walletSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Create Wallet Model
const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
