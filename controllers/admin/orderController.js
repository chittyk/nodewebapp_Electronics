const Order = require('../../models/orderSchema');
const User = require('../../models/userSchema')
const Product = require('../../models/productSchema');
const Address = require('../../models/addressSchema');

const getOrders = async (req, res) => {
    try {
        // Get page and limit from query params (default to 1 and 20)
        const page = parseInt(req.query.page) || 1; // Pagination page
        const limit = 20; // Items per page
        const skip = (page - 1) * limit; // Calculate how many items to skip

        // Fetch the orders with pagination
        const orders = await Order.find({})
            .skip(skip)
            .limit(limit);

        // Get total number of orders for calculating total pages
        const totalOrders = await Order.countDocuments({}); // Total orders in DB
        const totalPages = Math.ceil(totalOrders / limit); // Total pages for pagination

        // Fetch user and product data as before
        const user = await User.find({});
        const product = await Product.find({});

        const result = [];

        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];

            let datas = {};
            datas.orderId = order.orderId;
            datas.userId = order.userId;

            for (let j = 0; j < user.length; j++) {
                const user1 = user[j];
                if (user1._id.toString() === order.userId.toString()) {
                    datas.userName = user1.name;
                }
            }

            datas.orderedItems = order.orderedItems.map(item => {
                return {
                    itemProduct: item.product,
                    itemQuantity: item.quantity,
                    itemPrice: item.price,
                    itemName: (() => {
                        for (let i = 0; i < product.length; i++) {
                            const product1 = product[i];
                            if (product1._id.toString() === item.product.toString()) {
                                return product1.productName;
                            }
                        }
                    })()
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

    if (!orderId || !status) {
        return res.status(400).json({ message: "Order ID and status are required" });
    }

    try {
        // Update the order status in the database
        const updatedOrder = await Order.findOneAndUpdate(
            { orderId }, // Find the order by orderId
            { $set: { status } }, // Update the status field
            { new: true } // Return the updated document
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ message: "Order status updated successfully", order: updatedOrder });
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
};
