const Wallet = require("../../models/walletSchema");

const getWallet = async (req, res) => {
    try {
        // Get the admin user ID
        const adminId = req.session.admin._id;

        // Define the page and limit for pagination
        const page = parseInt(req.query.page) || 1; // Default page is 1
        const limit = 5; // Number of transactions per page
        const skip = (page - 1) * limit; // Calculate how many transactions to skip

        // Fetch the wallet data for the admin user
        const wallet = await Wallet.findOne({ userId: adminId });

        if (!wallet) {
            return res.redirect('/admin/pageNotFound');
        }

        // Sort transactions by date in descending order (newest first)
        const sortedTransactions = wallet.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Get the transactions for the current page
        const transactions = sortedTransactions.slice(skip, skip + limit);

        const totalTransactions = wallet.transactions.length; // Total number of transactions
        const totalPages = Math.ceil(totalTransactions / limit); // Total number of pages

        // Render the wallet page with wallet data and transactions
        res.render('wallet', {
            walletData: wallet,
            transactions: transactions, // Pass the sliced and sorted transactions
            currentPage: page,
            totalPages: totalPages
        });

    } catch (error) {
        console.error("Error fetching wallet data:", error);
        res.redirect('/admin/pageNotFound');
    }
};



const addMoney = async (req, res) => {
    try {
        // Get the admin user ID
        const adminId = req.session.admin._id;

        // Get the amount to add from the request body
        const amount = parseInt(req.body.amount)

        // Fetch the wallet data for the admin user
        const wallet = await Wallet.findOne({ userId: adminId });

        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        // Add the amount to the wallet balance
        wallet.balance += amount;

        // Create a new transaction
        const newTransaction = {
            transactionType: 'credit', // Type of transaction (credit for adding money)
            amount: amount,
            date: new Date(),
            description: 'Added money to wallet',
            status: 'Completed' // You can set the status accordingly
        };

        // Add the transaction to the transactions array
        wallet.transactions.push(newTransaction);

        // Save the updated wallet data
        await wallet.save();

        // Respond with a success message and the updated balance
        res.status(200).json({
            message: 'Money added successfully!',
            updatedBalance: wallet.balance,
            newTransaction: newTransaction
        });

    } catch (error) {
        console.error("Error adding money to wallet:", error);
        res.status(500).json({ message: 'Error adding money to wallet' });
    }
};






module.exports = {
    getWallet,
    addMoney
};
