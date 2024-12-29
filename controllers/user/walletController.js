const Wallet = require('../../models/walletSchema');

const addMoney = async (req, res) => {
    try {
        let { amount } = req.body;  // Extract the amount from the request body
        let userId = req.session.user; // Get the user ID from the session
        console.log("Received amount:", amount);  // Log to verify the received data
        amount = parseInt(amount)
        // Find the user's wallet by user ID
        let userWallet = await Wallet.findOne({ userId: userId });

        if (!userWallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }

        // Update the balance by adding the new amount
        userWallet.balance += amount; // Add the amount to the user's balance

        // Create a new transaction record
        let transaction = {
            transactionType: 'credit',
            amount: amount,
            date: new Date(), // Use a Date object (current date and time)
            description: "Recharged"
        };

        // Push the transaction to the transactions array
        userWallet.transactions.push(transaction);

        // Save the updated wallet information
        await userWallet.save();

        // Respond with success
        res.status(200).json({ message: "Amount successfully added", amount: amount });
        
    } catch (error) {
        console.error("Error adding money:", error);
        res.status(500).json({ message: "Error adding money" });
    }
};

module.exports = {
    addMoney,
};
