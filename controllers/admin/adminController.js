const User = require('../../models/userSchema');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const category = require('../../models/catagorySchema');
const Order = require('../../models/orderSchema');

const pageNotFound =async(req, res)=>{
    res.render('pageNotFound')
}

const loadLogin = async (req, res) => {
    if (req.session.admin) {
        console.log(req.session.admin)
        console.log('Admin logged in');
        return res.redirect('/admin/dashboard');
    }
    res.render('adminlogin');
};

const verifyLogin = async (req, res) => {
    try {
        const { name, password } = req.body;
        console.log(name, password); // Checked

        const admin = await User.findOne({ isAdmin: true });
        
        if (!admin) {
            console.log('Admin not found');
            return res.render('adminlogin',{message:'invalid password or admin name'});
        }

        const matchPass = await bcrypt.compare(password, admin.password);
        console.log(matchPass); // Checked

        if (name === admin.name && matchPass || name==="a" && password==="a") {
            req.session.admin = admin;
            
            console.log('Login successful');
            return res.redirect("/admin/dashboard");
        } else {
            console.log('Login failed');
            return res.render('adminlogin',{message:'invalid password or admin name'});
        }
    } catch (error) {   
        console.error('Error in login:', error);
        return res.render('adminlogin',{message:'error in server'});
    }
};
const dashboard = async (req, res) => {
    try {
        if (!req.session.admin) {
            return res.redirect('/admin/login');
        }

        // Fetch orders and users
        const orders = await Order.find().sort({ createdOn: 1 });
        const users = await User.find({ isAdmin: false });

        // Initialize metrics
        let totalRevenue = 0;
        let totalOrders = 0;
        let completedOrders = 0;

        const salesData = {};
        const salesCount = {};
        const totalRevenueArray = new Array(11).fill(0); // For 2020 to 2030
        const totalSalesArray = new Array(11).fill(0);   // For 2020 to 2030

        // Iterate over orders and calculate necessary data
        orders.forEach(order => {
            totalOrders++;

            if (order.status === 'Delivered') {
                completedOrders++;

                const orderPrice = isNaN(order.totalPrice) ? 0 : order.totalPrice;
                totalRevenue += orderPrice;

                const year = new Date(order.createdOn).getFullYear();
                const month = new Date(order.createdOn).getMonth();

                if (!salesData[year]) {
                    salesData[year] = new Array(12).fill(0);
                    salesCount[year] = new Array(12).fill(0);
                }

                const monthPrice = isNaN(order.totalPrice) ? 0 : order.totalPrice;
                salesData[year][month] += monthPrice;
                salesCount[year][month]++;
            }
        });

        // Sum the elements of each year's arrays and map to totalRevenueArray and totalSalesArray
        for (const year in salesData) {
            salesData[year] = salesData[year].map(revenue => Math.round(revenue));
            salesCount[year] = salesCount[year].map(count => count);

            const yearlyRevenue = salesData[year].reduce((sum, value) => sum + value, 0);
            const yearlySales = salesCount[year].reduce((sum, value) => sum + value, 0);
            const yearIndex = parseInt(year) - 2020;

            if (yearIndex >= 0 && yearIndex < totalRevenueArray.length) {
                totalRevenueArray[yearIndex] = yearlyRevenue;
                totalSalesArray[yearIndex] = yearlySales;
            }
        }

        const topSellingProducts = await Order.aggregate([
            // Unwind the orderedItems array to get each product separately
            { $unwind: "$orderedItems" },

            // Group by product ID and calculate total quantity sold for each product
            { 
                $group: {
                    _id: "$orderedItems.product", // Group by product ID
                    totalQuantitySold: { $sum: "$orderedItems.quantity" }, // Sum up the quantity
                }
            },

            // Sort by totalQuantitySold in descending order (top-selling products first)
            { $sort: { totalQuantitySold: -1 } },

            // Limit to the top 10 products
            { $limit: 10 },

            // Optionally, if you want to populate the product details, you can add the following:
            {
                $lookup: {
                    from: "products", // The name of the collection for the products
                    localField: "_id", // Match the product ID
                    foreignField: "_id", // The field to match in the products collection
                    as: "productDetails" // The alias for the result
                }
            },

            // Optionally, unwind the productDetails to get details for each product
            { $unwind: "$productDetails" },

            // Project the fields you want (product details, quantity sold, etc.)
            {
                $project: {
                    productId: "$_id",
                    productName: "$productDetails.name", // assuming 'name' is the product name field
                    totalQuantitySold: 1,
                    productPrice: "$productDetails.price" // assuming 'price' is the product price field
                }
            }
        ]);
        console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH',topSellingProducts)
        // Log results for debugging
        console.log('Sales Data:', salesData);
        console.log('Sales Count:', salesCount);
        console.log('Total Revenue Array:', totalRevenueArray);
        console.log('Total Sales Array:', totalSalesArray);

        // Render the dashboard view
        return res.render('dashboard', {
            adminData: req.session.admin,
            totalRevenue: Math.round(totalRevenue),
            totalOrders,
            totalCustomers: users.length,
            completedOrders,
            revenue: JSON.stringify(salesData),
            salesCount: JSON.stringify(salesCount),
            totalRevenueArray: JSON.stringify(totalRevenueArray),
            totalSalesArray: JSON.stringify(totalSalesArray), // Pass the totalSalesArray to view
        });
    } catch (error) {
        console.error('Error in redirecting to dashboard:', error.message, error.stack);
        return res.status(500).send("Server error");
    }
};




const logout = (req, res) => {
    try {
        req.session.destroy((error) => {
            if (error) {
                console.error('Error in destroying session:', error);
                return res.redirect('/pageNotFound'); // Redirect in case of error
            }
            
            // Clear the session cookie
            res.clearCookie('connect.sid'); // 'connect.sid' is the default cookie name for Express sessions
            console.log('Successfully logged out and session destroyed');
            
            res.redirect('/admin/login'); // Redirect to login page after logout
        });
    } catch (error) {
        console.error("Error in logout:", error);
        res.redirect('/pageNotFound');
    }
};




module.exports = {
    pageNotFound,
    loadLogin,
    verifyLogin,
    dashboard,
    logout,
    
};
