const Order = require('../../models/orderSchema');
const User = require('../../models/userSchema')
const Product = require('../../models/productSchema');
const Address = require('../../models/addressSchema');
const Wallet = require('../../models/walletSchema')



const getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        console.log(`Fetching orders with page=${page}, limit=${limit}, skip=${skip}`);

        // Fetch orders with sorting and pagination
        const orders = await Order.find({})
            .sort({ createdOn: -1 })
            .skip(skip)
            .limit(limit);
        console.log('Orders fetched:', orders);

        // Get total number of orders
        const totalOrders = await Order.countDocuments({});
        const totalPages = Math.ceil(totalOrders / limit);
        const adminId = await User.findOne({ _id: req.session.user })
        // Fetch all users and products
        const user = await User.find({});
        const product = await Product.find({});
        console.log('Users fetched:', user);
        console.log('Products fetched:', product);
        console.log("nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn", req.session)
        const result = [];

        for (const order of orders) {
            const datas = {
                orderId: order.orderId,
                userId: order.userId,
            };

            // Map user data
            const user1 = user.find(u => u._id?.toString() === order.userId?.toString());
            if (user1) {
                datas.userName = user1.name;
            } else {
                console.log(`No user found for userId: ${order.userId}`);
            }

            // Map ordered items
            datas.orderedItems = order.orderedItems.map(item => {
                const product1 = product.find(p => p._id?.toString() === item.product?.toString());
                return {
                    itemProduct: item.product,
                    itemQuantity: item.quantity,
                    itemPrice: item.price,
                    itemName: product1 ? product1.productName : 'Unknown Product',
                };
            });

            datas.totalPrice = order.totalPrice;
            datas.status = order.status;
            datas.paymentMethod = order.paymentMethod;
            datas.couponApplied = order.couponApplied;
            datas.createdOn = order.createdOn;

            result.push(datas);
        }

        console.log('Formatted Result:', JSON.stringify(result, null, 2));

        // Check if orders were found
        if (!orders || orders.length === 0) {
            return res.redirect('/admin/pageNotFound');
        }

        // Render the orders page and pass the orders data and pagination info
        res.render('orders', {
            result: result,
            page: page, // Current page
            totalPages: totalPages // Total pages
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};





const changeStatus = async (req, res) => {
    try {
        const { sta, orderId } = req.body;

        // Validate input
        if (!sta || !orderId) {
            return res.status(400).json({ success: false, message: 'Invalid input: Missing status or orderId.' });
        }

        // Update the order status in the database
        const updateResult = await Order.updateOne(
            { orderId: orderId },
            { $set: { status: sta } }
        );

        const adminId = await Order.findOne({ _id: req.session.admin._id })
        console.log("nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn", adminId)




        // Check if any document was modified
        if (updateResult.modifiedCount === 0) {
            return res.status(404).json({ success: false, message: 'Order not found or status already set.' });
        }

        res.status(200).json({ success: true, message: 'Status changed successfully.' });
    } catch (error) {
        console.error('Error changing status:', error);
        res.status(500).json({ success: false, message: 'Failed to change status due to server error.' });
    }
};


const removeFromHistory = async (req, res) => {
    try {
        const { orderId } = req.body;

        // Ensure that orderId exists in the request body
        if (!orderId) {
            return res.status(400).json({ success: false, message: 'orderId is required.' });
        }

        console.log('Deleting Order with orderId:', orderId);

        // Try to delete the order
        const result = await Order.deleteOne({ orderId: orderId });

        // Check if an order was actually deleted
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Order not found with the given orderId.' });
        }

        // Send success response
        return res.status(200).json({ success: true, message: 'Order removed from database.' });

    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ success: false, message: 'Failed to remove order from the database due to server error.' });
    }
};



const updateOrders = async (req, res) => {
    const { orderId, status } = req.body;

    console.log("Processing order update...");

    // Validate request body
    if (!orderId || !status) {
        return res.status(400).json({ message: "Order ID and status are required" });
    }

    // Validate session and admin ID
    const adminId = req.session.admin?._id;
    if (!adminId) {
        return res.status(401).json({ message: "Admin not authenticated" });
    }

    try {
        // Find and update the order status
        const updatedOrder = await Order.findOneAndUpdate(
            { orderId },
            { $set: { status } },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Fetch admin wallet details
        const adminWallet = await Wallet.findOne({ userId: adminId });
        if (!adminWallet) {
            return res.status(404).json({ message: "Admin wallet not found" });
        }

        // Ensure returnPrice is valid
        const returnPrice = updatedOrder.finalAmount;
        if (typeof returnPrice !== "number" || returnPrice <= 0) {
            return res.status(400).json({ message: "Invalid order amount" });
        }

        // Fetch user wallet details
        const userWallet = await Wallet.findOne({ userId: updatedOrder.userId });
        if (!userWallet) {
            return res.status(404).json({ message: "User wallet not found" });
        }

        // Check if admin has sufficient balance
        if (adminWallet.balance < returnPrice) {
            return res.status(400).json({ message: "Insufficient admin wallet balance" });
        }

        // Prepare the transactions for both admin and user
        const userTransaction = {
            transactionType: "credit",  // The user is credited
            amount: returnPrice,
            date: new Date().toISOString(), // Use ISO 8601 format for consistency
            description:"DiyElectro"
        };

        const adminTransaction = {
            transactionType: "debit",  // Admin wallet is debited
            amount: returnPrice,
            date: new Date().toISOString(), // Use ISO 8601 format for consistency
            description:updatedOrder.userId
        };

        // Update wallet balances and transaction histories
        adminWallet.balance -= returnPrice;
        userWallet.balance += returnPrice;

        adminWallet.transactions.push(adminTransaction);
        userWallet.transactions.push(userTransaction);

        // Save the updated wallet details
        await adminWallet.save();
        await userWallet.save();

        // Log the admin wallet details after update (for debugging purposes)
        console.log("Admin wallet after update:", adminWallet);

        // Send response indicating success
        res.json({
            message: "Order status updated and transaction completed successfully",
            order: updatedOrder,
        });

    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Failed to update order status" });
    }
};

    // const mongoose = require('mongoose'); // Import mongoose to use ObjectId
    const orderDetails = async (req, res) => {
        try {
            const orderId = req.query.id;
            console.log('Order ID:', orderId);

            // Fetch all products from the database
            const products = await Product.find({});

            // Fetch the order by its ID
            const orders = await Order.findOne({ orderId: orderId }).exec();
            if (!orders) {
                return res.status(404).render('error', { message: 'Order not found' });
            }

            // Fetch the user associated with the order
            const user = await User.findOne({ _id: orders.userId }).exec();
            if (!user) {
                return res.status(404).render('error', { message: 'User not found' });
            }

            // Fetch the address of the user
            const address = await Address.findOne({ userId: orders.userId }).exec();
            if (!address) {
                return res.status(404).render('error', { message: 'Address not found' });
            }

            // Get the selected address
            const selectedAddress = address.address.find(addr => addr.isSelected);
            if (!selectedAddress) {
                return res.status(404).render('error', { message: 'Selected address not found' });
            }

            // Get the product IDs from the ordered items
            const productIds = orders.orderedItems.map(item => item.product);

            console.log("Product IDs:", productIds);

            // Convert productIds to ObjectId objects for accurate comparison
            const orderedProducts = products.filter(product =>
                productIds.some(productId => productId.equals(product._id))
            );

            console.log('Ordered Products:', orderedProducts);

            console.log('Selected Address:', selectedAddress);

            // Render the orderDetails view with the fetched data
            res.render('orders-details', { orders, user, selectedAddress, orderedProducts });
        } catch (error) {
            console.error('Error fetching order details:', error);

            // Fallback if 'error' view doesn't exist
            res.status(500).render('error', { message: 'Failed to fetch order details' });
        }
    };



    module.exports = {
        getOrders,
        changeStatus,
        removeFromHistory,
        updateOrders,
        orderDetails
    }
