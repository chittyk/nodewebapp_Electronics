const Cart = require("../../models/cartSchema")
const User = require("../../models/userSchema")
const Product = require('../../models/productSchema');
const { render } = require("ejs");
const Address = require("../../models/addressSchema");
const Order = require("../../models/orderSchema")
const mongoose = require('mongoose')


const getCart = async (req, res) => {
    try {
        const userId = req.session.user;

        // Find the user and their cart
        const user = await User.findOne({ _id: userId });
        const cart = await Cart.findOne({ userId: userId });

        if (!cart) {
            return res.render('cart', {userData:user ,stock:0, products: [], message: "Your cart is empty!" });
        }

        // Initialize products array if it doesn't exist
        cart.products = [];
        const stock = []
        // Iterate through cart items and fetch product details
        for (let i = 0; i < cart.items.length; i++) {
            const element = cart.items[i];
            let product = await Product.findOne({ _id: element.productId });
            console.log('Product qty :', product.quantity)

            stock.push(product.quantity)


            if (product) {
                // Add quantity information from cart
                cart.products.push({
                    ...product.toObject(), // Spread product details
                    quantity: element.quantity // Add quantity from cart item
                });
            }
        }

        // console.log("Updated cart with product details:\n", cart.products);

        // Render the cart view with products
        res.render('cart', {userData: user, stock: stock, product: cart.products, cart: cart });
        console.log('\n\n\n\n\n\tUpdated cart:\n\n\n\n\n', cart);
        console.log('\n\n\n \tstock : ', stock)
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.redirect('/pageNotFound');
    }
};

const postCart = async (req, res) => {
    try {
        console.log('Request received for adding to cart');
        console.log(req.body);

        const { productId } = req.body;
        const userId = req.session.user;
        const quantity=1
        // Fetch product details
        const product = await Product.findOne({ _id: productId });
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Product not found' });
        }
        
        // Calculate total price for this item
        const itemTotalPrice = 1 * product.salePrice;

        // Find user's cart
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // Create a new cart if none exists
            cart = new Cart({
                userId: userId,
                items: [
                    {
                        productId: productId,
                        quantity: quantity,
                        price: product.salePrice,
                        totalPrice: itemTotalPrice,
                    },
                ],
            });
        } else {
            // Check if the product is already in the cart
            const existingItemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

            if (existingItemIndex !== -1) {
                // Update quantity and total price for the existing item
                cart.items[existingItemIndex].quantity += quantity;
                cart.items[existingItemIndex].totalPrice += itemTotalPrice;
                return res.status(500).json({ status: 'error', message: 'Product already in the Cart' });
            } else {
                // Add new product to cart
                cart.items.push({
                    productId: productId,
                    quantity: quantity,
                    price: product.salePrice,
                    totalPrice: itemTotalPrice,
                });
            }
        }

        // Save the cart
        await cart.save();
        console.log('\n\n\n\n\n\tUpdated cart:\n\n\n\n\n', cart);

        return res.json({ status: 'success', message: 'Product added to cart' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const removeProduct = async (req, res) => {
    try {
        console.log('hello')
        console.log('\t\t\treq.body', req.body)
        // console.log(req.query)
        // console.log(req.session)
        const { productId } = req.body
        const userId = req.session.user
        // console.log(productId)
        // console.log(userId)
        await Cart.updateOne(
            { userId: userId }, // Match the document by its _id
            {
                $pull: {
                    items: { productId: productId } // Match and remove the item by _id
                }
            }
        )



        return res.status(200).json({ status: true, message: "product removed successfuly form cart" })



    } catch (error) {
        return res.status(500).json({ status: false, message: "Error in removing product from cart" });
    }
}

const getCheckout = async (req, res) => {
    try {
        // Parse the items from the query string
        const items = JSON.parse(decodeURIComponent(req.query.items));
        console.log('Items:', items);

        // Extract product IDs from the items array
        const indices = items.map(({ productId }) => productId);
        console.log('indices', indices);

        // Get the user ID from the session
        const userId = req.session.user;
        const user = await User.findOne({_id:userId})
        // Find the user's cart and address
        const userCart = await Cart.findOne({ userId: userId });
        const userAddress = await Address.findOne({ userId: userId });

        if (!userCart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        console.log('userCart', userCart);

        // Initialize an array to hold selected product IDs
        const selectedProductIds = [];

        // Loop through the indices array (which contains productIds from the query)
        indices.forEach((index) => {
            // Ensure the index is a valid number
            const idx = parseInt(index);

            // Check if the index is valid and within the bounds of the userCart.items array
            if (userCart.items[idx]) {
                // Get the item using the index and push only the string value of the productId
                selectedProductIds.push(userCart.items[idx].productId.toString());
            }
        });

        const ids = await Product.find({
            _id: { $in: selectedProductIds }
        });


        console.log('ids: ', ids)

        console.log('Selected Product IDs:', selectedProductIds);

        // Query to find the products that match the selected product IDs
        // Convert the selectedProductIds to ObjectId for the query
        req.session.cartData ={
            product: ids
        }

        // Render the checkout page with user address, selected products, and items
        res.render('secureCheckout', {
            userData: user,
            userAddress: userAddress,
            items: items,
            product: ids,
            // Pass the products to the view
        });

    } catch (error) {
        console.error('Error in getCheckout:', error);
        res.status(500).send('Internal Server Error');
    }
};



const editAddress = async (req, res) => {
    try {
        const addressId = req.query.id
        const user = req.session.user
        const userData =await User.findOne({_id:user})
        console.log('hello1', addressId)
        const currAddress = await Address.findOne({
            'address._id': addressId

        })
        console.log(currAddress)

        if (!currAddress) {
            console.log('hello3')

            return res.redirect('/pageNotFound')
        }
        const addressData = currAddress.address.find((item) => {
            return item._id.toString() === addressId.toString()
        })
        if (!addressData) {
            console.log('hello5')

            return res.redirect('/pageNotFound')
        }
        console.log('hello6')

        res.render("edit-address-cart", {userData:userData, address: addressData, user: user })
    } catch (error) {
        console.log('error in edit address', error)
        res.redirect('/pageNotFound')
    }
}

const postEditAddress1 = async (req, res) => {
    try {

        const data = req.body
        const addressId = req.query.id
        const user = req.session.user
        const userData=await User.findOne({_id:user})
        console.log(user)
        const findAddress = await Address.findOne({ 'address._id': addressId })
        if (!findAddress) {
            console.log('1')
            res.redirect("/pageNotFound")
        }
        console.log('2')
        await Address.updateOne(
            { "address._id": addressId },
            {
                $set: {
                    'address.$': {
                        _id: addressId,
                        addressType: data.addressType,
                        name: data.name,
                        city: data.city,
                        landMark: data.landMark,
                        state: data.state,
                        pincode: data.pincode,
                        phone: data.phone,
                        altPhone: data.altPhone
                    }
                }
            }
        )
        const userAddress = await Address.findOne({ userId: user })
        console.log('addresses of updated ', userAddress)
        console.log('3')
        console.log('333')
        return res.render('secureCheckout', { userData:userData, userAddress: userAddress })




    } catch (error) {
        console.log("error in edit address", error);
        res.redirect('/pageNotFound')

    }
}

const updateAddress = async (req, res) => {
    try {
        const { selectedIndex } = req.body; // Get the selected index from the body
        if (!selectedIndex) {
            return res.status(400).json({ success: false, message: "Selected address index is required" });
        }

        const userId = req.session.user; // Get the user ID from the session
        if (!userId) {
            return res.status(401).json({ success: false, message: "User is not authenticated" });
        }

        console.log("Received address index:", selectedIndex);
        console.log("User ID:", userId);

        // You can perform the actual address update logic here, e.g., updating the user's address in the database
        // Example:
        // const address = await Address.findOneAndUpdate(
        //     { _id: selectedIndex, userId },
        //     { $set: { selected: true } },
        //     { new: true }
        // );

        await Address.updateMany(
            { userId: userId },
            { $set: { "address.$[].isSelected": false } }

        )
        await Address.updateMany(
            { userId: userId },
            { $set: { [`address.${selectedIndex}.isSelected`]: true } }

        )

        // For now, simulate a success response:
        res.json({ success: true, message: 'Address updated successfully!' });
    } catch (error) {
        console.error("Error in updating address:", error);
        res.status(500).json({ success: false, message: "An error occurred while updating the address" });
    }
};

const changeAddress = async (req, res) => {
    try {
        const userId = req.session.user

        await Address.updateMany(
            { userId: userId },
            { $set: { "address.$[].isSelected": false } }
        )
        res.json({ success: true, message: 'Address updated successfully!' });
    } catch (error) {
        console.error("Error in updating address:", error);
        res.status(500).json({ success: false, message: "An error occurred while updating the address" });
    }
}
const postConfirmOrder = async (req, res) => {
    try {

        console.log('hello1');
        const userId = req.session.user; // Fix typo
        console.log("userid ", userId)
        const user = await User.findOne({ _id: userId });
        console.log('session cart ',req.session.cart)
        const { addressIds, totalPrice, items, product, selectedOption } = req.body;
        console.log("ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss",items,"jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj",product)
        if(product.productName){
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        const productIdsToRemove = items.map(item => item.productIds);
        const productCount = items.map(item => ({
            quantity: item.quantity,
            productIds: item.productIds
        }));
        // Fetch address details
        const userAddress = await Address.findOne({ userId: userId })
        console.log('addressssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss', userAddress)
        const selectedAddress = userAddress.address.find((addr) => addr.isSelected);


        console.log('Selected Address:', selectedAddress);

        // Initialize order items array
        let ItemArr = [];
        for (let i = 0; i < product.length; i++) {
            const element = product[i];
            let arrayItem = {
                product: product[i]._id,
                quantity: (function () {
                    for (let j = 0; j < items.length; j++) {
                        if (items[j].productIds == product[i]._id) {
                            return items[j].quantity;
                        }
                    }
                    return 0; // Default return if not found
                })(),
                price: product[i].salePrice
            };
            ItemArr.push(arrayItem);
        }

        console.log("Order Items:", ItemArr);




        let order = new Order({
            userId: userId,
            orderedItems: ItemArr, // Push the ItemArr array here
            totalPrice: totalPrice,
            finalAmount: totalPrice, // Assuming no discounts, same as totalPrice
            address: selectedAddress ? selectedAddress._id : addresss.address[index]._id, // Handle if selectedAddress is undefined
            status: 'pending',
            createdOn: new Date(),
            paymentMethod: selectedOption
        });

        await order.save(); // Save the order to the database

        console.log("orderrsssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss", order)

        // const newOrder = await Order.findOne({userId:userId})
        await Cart.updateOne(
            { userId: userId },
            {
                $pull: {
                    items: {
                        productId: { $in: productIdsToRemove.map(id => new mongoose.Types.ObjectId(id)) }
                    }
                }
            }
        );



        for (let i = 0; i < productCount.length; i++) {
            const pro = productCount[i];
            await Product.updateOne(
                { _id: pro.productIds },
                {
                    $inc: { quantity: -pro.quantity }
                }
            )

        }

        await User.updateOne(
            { _id: user },
            { $push: { orderHistory: order._id } }
        )


        return res.status(200).json({ success: true, message: 'Order placed successfully', order });
    } catch (error) {
        console.log('hello2');
        console.error('Error in postConfirmOrder:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

















const cancelOrder = async (req, res) => {
    try {
      console.log('Order details:', req.body);
      const userId = req.session.user;
      const { orderId } = req.body;
  
      // Update the order status to 'Cancelled'
      const updateResult = await Order.updateOne(
        { _id: orderId }, // Filter to target the specific order
        { $set: { status: 'Cancelled' } }
      );
  
      if (updateResult.modifiedCount === 0) {
        return res.status(404).json({ status: 'error', message: "Order not found or already cancelled." });
      }
  
      // Fetch the specific order for the user
      const order = await Order.findOne({ _id: orderId, userId: userId });
  
      if (!order) {
        return res.status(404).json({ status: 'error', message: "Order not found." });
      }
  
      // Prepare ordered items for product quantity update
      const orderedItems = order.orderedItems.map(item => ({
        productId: item.product.toString(),
        quantity: item.quantity,
      }));
  
      console.log("Ordered items:", orderedItems);
  
      // Update product quantities concurrently
      const updatePromises = orderedItems.map(pro =>
        Product.updateOne(
          { _id: pro.productId },
          { $inc: { quantity: pro.quantity } }
        )
      );
  
      await Promise.all(updatePromises);
  
      return res.status(200).json({ status: 'success', message: "Order canceled and products updated successfully." });
    } catch (error) {
      console.error("Error canceling order:", error);
      return res.status(500).json({ status: 'error', message: "Internal server error." });
    }
  };
  
  const returnOrder=async (req,res) => {
    try {
        const {orderId}=req.body
        console.log('orderIiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii',orderId)
        await Order.updateOne(
            {_id:orderId},
            {
                $set:{status:"Return Request"}
            }
        )
        return res.status(200).json({ status: 'success', message: "Return Prouct request send successfully" });
        
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }


  const cancellReturnOrder=async (req,res) => {
    try {
        const {orderId}=req.body
        console.log('orderIiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii',orderId)
        await Order.updateOne(
            {_id:orderId},
            {
                $set:{status:"Delivered"}
            }
        )
        return res.status(200).json({ status: 'success', message: "Return Prouct request cancelled successfully" });
        
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  const addAddress = async (req, res) => {
    try {
        const user = req.session.user
        res.render('add-address1', { user: user })
    } catch (error) {
        res.redirect('/pageNotFound')
    }
}

const postAddAddress = async (req, res) => {
    try {
        const userId = req.session.user
        const userData = await User.findOne({ _id: userId })
        const { addressType, name, city, landMark, state, pincode, phone, altPhone } = req.body

        const userAddress = await Address.findOne({ userId: userData._id })

        if (!userAddress) {
            const newAddress = new Address({
                userId: userData._id,
                address: [{
                    addressType, name, city, landMark, state, pincode, phone, altPhone
                }],
            })
            await newAddress.save();
        } else {
            userAddress.address.push({ addressType, name, city, landMark, state, pincode, phone, altPhone })
            await userAddress.save()

        }
        res.redirect('/')
    } catch (error) {
        console.log('error in adding Address', error)
        res.redirect('/pageNotFound')

    }
}

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
        res.render('userOrders-details', { orders, user, selectedAddress, orderedProducts });
    } catch (error) {
        console.error('Error fetching order details:', error);

        // Fallback if 'error' view doesn't exist
        res.status(500).render('error', { message: 'Failed to fetch order details' });
    }
};




const orderDetails1 = async (req, res) => {
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
        res.render('userOrders-details', { orders, user, selectedAddress, orderedProducts });
    } catch (error) {
        console.error('Error fetching order details:', error);

        // Fallback if 'error' view doesn't exist
        res.status(500).render('error', { message: 'Failed to fetch order details' });
    }
};


module.exports = {
    postCart,
    getCart,
    removeProduct,

    getCheckout,
    editAddress,
    postEditAddress1,
    updateAddress,
    changeAddress,
    postConfirmOrder,
    cancelOrder,
    returnOrder,
    cancellReturnOrder,
    addAddress,
    postAddAddress,
    orderDetails,
    orderDetails1    

}