
const Orders = require("../../models/orderSchema")



const getSalesReport = async (req, res) => {
    try {
        console.log("Fetching sales report...");

        const basedOn = req.query.basedOn || 'all'; // Example parameter for filtering (if needed)
        const page = parseInt(req.query.page) || 1; // Current page, default is 1
        const limit = parseInt(req.query.limit) || 10; // Number of items per page, default is 10
        const skip = (page - 1) * limit; // Calculate the number of documents to skip

        console.log(`Page: ${page}, Limit: ${limit}, Based On: ${basedOn}`);

        // Fetch total number of orders for pagination metadata
        const totalOrders = await Orders.countDocuments({});

        // Fetch orders with pagination
        let orders = await Orders.find({})
        const filteredOrders =[]
        const salesReport =[]


        //c,w,d,m
        if (basedOn === "c") {
            // console.log(orders)
            const startDate = new Date('2024-12-12');
            const endDate = new Date('2024-12-13');

            filteredOrders = orders.filter(order => {
                const createdDate = new Date(order.createdOn);
                return createdDate >= startDate && createdDate <= endDate;
            })
            .skip(skip)
            .limit(limit);

            console.log(filteredOrders);
        }
        
        
        
        
        
        
        else if (basedOn === 'd') {
            if (!orders || !Array.isArray(orders)) {
              console.error("Invalid orders data");
              return [];
            }
          
            // Create a map to group orders by date
            const grouped = orders.reduce((acc, order) => {
                if (order.createdOn) {
                  // Check if createdOn is a Date or a String and handle accordingly
                  const date = (typeof order.createdOn === "string" 
                                ? order.createdOn 
                                : order.createdOn.toISOString().split("T")[0]); // Format Date to string and extract the date part
              
                  if (!acc[date]) {
                    acc[date] = [];
                  }
                  acc[date].push(order);
                } else {
                  console.warn("Missing or invalid createdOn for order:", order);
                }
                return acc;
              }, {});
              
              Object.entries(grouped).forEach(([key, value]) => {
                console.log(`Key: ${key}, Value:`);
                let value1 = {
                    date: key,
                    totalRevenue: (() => {
                        let total = 0;
                        value.forEach(val => {
                            if(val.status==="Delivered"){
                                total += val.totalPrice;
                            }
                        });
                        return total; // Return the computed total
                    })(), // Immediately invoke the function
                    totalSales:(()=>{
                        let countSales =0 
                        value.forEach(val => {
                            if(val.status==="Delivered"){
                                countSales =countSales+1
                                }
                            return countSales
                        })
                        return countSales
                    })(),
                    coupon:(()=>{
                        let countCoupon =0
                        value.forEach(val => {
                            if(val.couponApplied){
                                countCoupon =countCoupon+1
                            }
                        })
                    
                        return countCoupon
                                

                    })(),
                    totalOrders:(()=>{
                        let countOrders =0
                        value.forEach(val => {
                            countOrders =countOrders+1
                            })
                            return countOrders
                    })(),
                    discound:(()=>{
                        let countDiscount=0
                        value.forEach(val => {
                            if(val.discountApplied){
                                countDiscount =countDiscount+1
                            }
                            
                        })
                        return countDiscount
                    })()    

                };
                console.log(value1);
              });
          
            // Convert the grouped object into a sorted array
            
          }
        else if (basedOn === 'w') {
    if (!orders || !Array.isArray(orders)) {
        console.error("Invalid orders data");
        return [];
    }

    // Helper function to calculate the week number
    const getWeekNumber = (date) => {
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + startOfYear.getDay() + 1) / 7); // Week number
    };

    // Create a map to group orders by week and year
    const grouped = orders.reduce((acc, order) => {
        if (order.createdOn) {
            const date = new Date(order.createdOn);
            const weekYear = `${date.getFullYear()}-W${getWeekNumber(date)}`; // Format: YYYY-WW

            if (!acc[weekYear]) {
                acc[weekYear] = [];
            }
            acc[weekYear].push(order);
        } else {
            console.warn("Missing or invalid createdOn for order:", order);
        }
        return acc;
    }, {});

    Object.entries(grouped).forEach(([key, value]) => {
        console.log(`Key: ${key}, Value:`);
        let value1 = {
            weekYear: key, // Week-Year grouping
            totalRevenue: (() => {
                let total = 0;
                value.forEach(val => {
                    if (val.status === "Delivered") {
                        total += val.totalPrice;
                    }
                });
                return total; // Return the computed total
            })(),
            totalSales: (() => {
                let countSales = 0;
                value.forEach(val => {
                    if (val.status === "Delivered") {
                        countSales += 1;
                    }
                });
                return countSales;
            })(),
            coupon: (() => {
                let countCoupon = 0;
                value.forEach(val => {
                    if (val.couponApplied) {
                        countCoupon += 1;
                    }
                });
                return countCoupon;
            })(),
            totalOrders: (() => {
                return value.length; // Total orders is simply the array length
            })(),
            discount: (() => {
                let countDiscount = 0;
                value.forEach(val => {
                    if (val.discountApplied) {
                        countDiscount += 1;
                    }
                });
                return countDiscount;
            })()
        };
        console.log(value1);
    });

    // Convert the grouped object into a sorted array if needed
    const sortedGrouped = Object.entries(grouped)
        .sort(([keyA], [keyB]) => new Date(keyA) - new Date(keyB))
        .map(([key, value]) => ({
            weekYear: key,
            orders: value
        }));

    console.log("Sorted Weekly Sales Report:", sortedGrouped);
}








else if (basedOn === 'm') {
            if (!orders || !Array.isArray(orders)) {
                console.error("Invalid orders data");
                return [];
            }
        
            // Create a map to group orders by month and year
            const grouped = orders.reduce((acc, order) => {
                if (order.createdOn) {
                    // Check if createdOn is a Date or a String and handle accordingly
                    const date = new Date(order.createdOn);
                    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; // Format: YYYY-MM
        
                    if (!acc[monthYear]) {
                        acc[monthYear] = [];
                    }
                    acc[monthYear].push(order);
                } else {
                    console.warn("Missing or invalid createdOn for order:", order);
                }
                return acc;
            }, {});
        
            Object.entries(grouped).forEach(([key, value]) => {
                console.log(`Key: ${key}, Value:`);
                let value1 = {
                    monthYear: key, // Month-Year grouping
                    totalRevenue: (() => {
                        let total = 0;
                        value.forEach(val => {
                            if (val.status === "Delivered") {
                                total += val.totalPrice;
                            }
                        });
                        return total; // Return the computed total
                    })(),
                    totalSales: (() => {
                        let countSales = 0;
                        value.forEach(val => {
                            if (val.status === "Delivered") {
                                countSales += 1;
                            }
                        });
                        return countSales;
                    })(),
                    coupon: (() => {
                        let countCoupon = 0;
                        value.forEach(val => {
                            if (val.couponApplied) {
                                countCoupon += 1;
                            }
                        });
                        return countCoupon;
                    })(),
                    totalOrders: (() => {
                        return value.length; // Total orders is simply the array length
                    })(),
                    discount: (() => {
                        let countDiscount = 0;
                        value.forEach(val => {
                            if (val.discountApplied) {
                                countDiscount += 1;
                            }
                        });
                        return countDiscount;
                    })()
                };
                console.log(value1);
            });
        
            // Convert the grouped object into a sorted array if needed
            const sortedGrouped = Object.entries(grouped)
                .sort(([keyA], [keyB]) => new Date(keyA) - new Date(keyB))
                .map(([key, value]) => ({
                    monthYear: key,
                    orders: value
                }));
        
            console.log("Sorted Monthly Sales Report:", sortedGrouped);
        }
        else{
`            // orders = orders.skip(skip).limit(limit);
`        }





        // Calculate total pages
        const totalPages = Math.ceil(totalOrders / limit);

        // Render the view with pagination data
        res.render('sales-report', {
            
            orders,
            currentPage: page,
            totalPages,
            totalOrders,
            limit,
        });
    } catch (error) {
        console.error("Error fetching sales report:", error);
        res.render('/admin/pageNotFound');
    }
};


module.exports = {
    getSalesReport,
}