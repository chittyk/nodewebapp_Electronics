const User = require('../../models/userSchema');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const category = require('../../models/catagorySchema');
const Order = require('../../models/orderSchema');
const Brand = require('../../models/brandSchema');

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



        const topSellingCategories = await Order.aggregate([
            // Unwind the orderedItems array to get each product separately
            { $unwind: "$orderedItems" },
        
            // Lookup to get the product details from the "products" collection
            {
                $lookup: {
                    from: "products", // The name of the product collection
                    localField: "orderedItems.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
        
            // Unwind the productDetails array to access the product data
            { $unwind: "$productDetails" },
        
            // Group by category ID and calculate total quantity sold for each category
            {
                $group: {
                    _id: "$productDetails.category", // Group by category ID
                    totalQuantitySold: { $sum: "$orderedItems.quantity" } // Sum up the quantity
                }
            },
        
            // Sort by totalQuantitySold in descending order (top-selling categories first)
            { $sort: { totalQuantitySold: -1 } },
        
            // Limit to the top 10 categories
            { $limit: 10 },
        
            // Lookup to get the category details from the "categories" collection
            {
                $lookup: {
                    from: "categories", // The name of the category collection
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
        
            // Unwind the categoryDetails array to access the category data
            { $unwind: "$categoryDetails" },
        
            // Project the fields you want in the final output
            {
                $project: {
                    categoryId: "$_id",
                    categoryName: "$categoryDetails.name",
                    totalQuantitySold: 1
                }
            }
        ]);
        
        let topCategoryName =[]
        let topCategorySales=[]
        topSellingCategories .forEach(category => {
           topCategoryName.push(category.categoryName) 
           topCategorySales.push(category.totalQuantitySold)
        });




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
        
            // Lookup to get the product details from the "products" collection
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
        
            // Unwind the productDetails array to access the product data
            { $unwind: "$productDetails" },
        
            // Lookup to get the category name from the "categories" collection
            {
                $lookup: {
                    from: "categories",
                    localField: "productDetails.category",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
        
            // Unwind the categoryDetails array to access the category data
            { $unwind: "$categoryDetails" },
        
            // Add category and brand to an array, ensuring no duplicates
            {
                $addFields: {
                    categoryArray: { $ifNull: ["$categoryArray", []] }, // Initialize categoryArray if not exists
                    brandArray: { $ifNull: ["$brandArray", []] }
                }
            },
            {
                $addFields: {
                    categoryArray: {
                        $cond: {
                            if: { $in: ["$categoryDetails.name", "$categoryArray"] },
                            then: "$categoryArray",
                            else: { $concatArrays: ["$categoryArray", ["$categoryDetails.name"]] }
                        }
                    },
                    brandArray: {
                        $cond: {
                            if: { $in: ["$productDetails.brand", "$brandArray"] },
                            then: "$brandArray",
                            else: { $concatArrays: ["$brandArray", ["$productDetails.brand"]] }
                        }
                    }
                }
            },
        
            // Project the fields you want in the final output
            {
                $project: {
                    productId: "$_id",
                    productName: "$productDetails.productName",
                    totalQuantitySold: 1,
                    productPrice: "$productDetails.regularPrice",
                    categories: "$categoryArray", // All unique categories
                    brands: "$brandArray" // All unique brands
                }
            }
        ]);
        
        let productNames =[]
        let productQty=[]
        topSellingProducts.forEach(product => {
            productNames.push(product.productName)
            productQty.push(product.totalQuantitySold)
            
        });



        const topSellingBrands = await Order.aggregate([
            // Unwind the orderedItems array to get each product separately
            { $unwind: "$orderedItems" },
        
            // Lookup to get the product details from the "products" collection
            {
                $lookup: {
                    from: "products", // The name of the product collection
                    localField: "orderedItems.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
        
            // Unwind the productDetails array to access the product data
            { $unwind: "$productDetails" },
        
            // Group by brand and calculate total quantity sold for each brand
            {
                $group: {
                    _id: "$productDetails.brand", // Group by brand
                    totalQuantitySold: { $sum: "$orderedItems.quantity" } // Sum up the quantity
                }
            },
        
            // Sort by totalQuantitySold in descending order (top-selling brands first)
            { $sort: { totalQuantitySold: -1 } },
        
            // Limit to the top 10 brands
            { $limit: 10 },
        
            // Project the fields you want in the final output
            {
                $project: {
                    brandName: "$_id",
                    totalQuantitySold: 1
                }
            }
        ]);
        

        topBrandNames=[]
        topBrandQty=[]
        topSellingBrands.forEach(brand => {
            topBrandNames.push(brand.brandName)
            topBrandQty.push(brand.totalQuantitySold)
        });

        let regData  = []


        orders.forEach(order => {
            if(order.status==="Delivered"){
                let data = {
                    date :(function() {
                        const isoDate = order.createdOn
                    
                        // Create a Date object from the ISO string
                        const date = new Date(isoDate);
                    
                        // Get the day, month, and year
                        const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if needed
                        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
                        const year = date.getFullYear();
                    
                        // Format in dd/mm/yyyy
                        const formattedDate = `${day}/${month}/${year}`;
                    
                        return formattedDate
                    })(),
                    description:order.orderId,
                    debit:0,
                    credit:order.finalAmount,

                    
                }
                regData.push(data)
            }
        });


        console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH',topSellingBrands )
        // Log results for debugging
        console.log('Sales Data:', salesData);
        console.log('Sales Count:', salesCount);
        console.log('Total Revenue Array:', totalRevenueArray);
        console.log('Total Sales Array:', productQty);

        // Render the dashboard view
        return res.render('dashboard', {
            productQty:JSON.stringify(productQty),
        
            adminData: req.session.admin,
            totalRevenue: Math.round(totalRevenue),
            totalOrders,
            totalCustomers: users.length,
            completedOrders,
            revenue: JSON.stringify(salesData),
            salesCount: JSON.stringify(salesCount),
            totalRevenueArray: JSON.stringify(totalRevenueArray),
            totalSalesArray: JSON.stringify(totalSalesArray), // Pass the totalSalesArray to view
            topSellingProducts: JSON.stringify(topSellingProducts), // Pass the topSellingProducts
            productNames:JSON.stringify(productNames),
            topCategoryName: JSON.stringify(topCategoryName), // Pass the topSellingCategories
            topCategorySales: JSON.stringify(topCategorySales),
            topBrandNames: JSON.stringify(topBrandNames),
            topBrandQty: JSON.stringify(topBrandQty),
            regData:JSON.stringify(regData)
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
