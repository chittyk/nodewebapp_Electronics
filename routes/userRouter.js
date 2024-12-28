// const express=require('express')
// const router=express.Router()

// const userController=require('../controllers/user/userController')
// const passport = require('passport')


// router.get('/pageNotFound',userController.pageNotFound)
// router.get('/home',userController.loadHomepage)
// router.get('/',userController.signLog)
// router.post('/signup',userController.signup)
// router.post('/verify-otp',userController.verifyOtp)

// router.post('/resend-otp',userController.resendOtp)

// router.get('/auth/google',passport.authenticate('google',{scope:['profile',email]}))
 
// router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
//     res.redirect('/')
// }

// )


// module.exports = router

const express = require('express');
const router = express.Router();
const { userAuth, adminAuth, cartAuth,isLogin, removeCartSession } = require('../middlewares/auth');

const userController =require('../controllers/user/userController');
const passport = require('passport');
const profileController =require('../controllers/user/profileController')
const cartController =require('../controllers/user/cartController')
const wishlistController=require('../controllers/user/wishlistController')
const couponController=require("../controllers/user/couponController")
const aboutController=require("../controllers/user/aboutController")

const crypto = require('crypto');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: 'rzp_test_D64ckPQSXSWgra',
    key_secret: 'Swz6kCqpqDLYbodGriBcRFx4',
});


// Routes
router.get('/pageNotFound', userController.pageNotFound);
router.get('/', userController.loadHomepage);
router.get('/signLog', isLogin,userController.signLog);
router.post('/signup',isLogin, userController.signup);
router.get('/login',isLogin, userController.getlogin);
router.post('/login',isLogin,userController.login)
router.post('/verify-otp',isLogin, userController.verifyOtp);
router.post('/resend-otp',isLogin, userController.resendOtp);


// Google Authentication Route
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Authentication Callback Route
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/signup' }), (req, res) => {
    console.log('req.bodyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',req.user)
    req.session.user=req.user
    res.redirect('/');
});



//router for logout
router.get('/logoutUser',userController.logout)

//user profile
router.get('/userProfile',userAuth,profileController.getuserProfile)
router.get('/change-email',userAuth,profileController.changeEmail)
router.post('/change-email',userAuth,profileController.changeEmailValid)
router.post('/verify-email-otp',userAuth,profileController.verifyEmailOtp)
router.post('/update-email',userAuth,profileController.updateEmail)
router.get('/change-password',userAuth,profileController.changePassword)
router.post('/change-password',userAuth,profileController.changePasswordValid)
router.post('/verify-changepassword-otp',userAuth,profileController.verifyChangepasswordOtp)


//address management
router.get('/addAddress',userAuth,profileController.addAddress)
router.post('/addAddress',userAuth,profileController.postAddAddress)
router.get('/editAddress',userAuth,profileController.editAddress)
router.post('/editAddress',userAuth,profileController.postEditAddress)
router.get('/deleteAddress',userAuth,profileController.deleteAddress)

//profile controllers
router.get ('/forgot-password',profileController.getForgotPassPage)
router.get('/forgot-email-valid',profileController.getforgotEmailValid)
router.post('/forgot-email-valid',profileController.forgotEmailValid)
router.post('/verify-passForgot-otp',profileController.verifyForgotPassOtp)
router.get ('/reset-password',profileController.getResetPassPage)
router.post('/resend-forgot-otp', profileController.resendOtp);
router.post('/reset-password',profileController.postNewPassword)



  
//shopping page
router.get('/shop',userController.loadShop)
router.get('/filter',userController.filterProduct)
router.get('/filterPrice',userController.filterPrice)
// router.post('/search',userAuth,userController.searchProduct)
router.get('/sort', userController.sortProduct);
router.get('/detailProduct',userController.detailProduct)
router.get('/advancedSearch', userController.advancedSearch);


//wishlist management
router.get('/wishlist',userAuth,wishlistController.getWishlist)
router.post('/addToWishlist',userAuth,wishlistController.addToWishlist)
router.get('/removeFormWishlist',userAuth,wishlistController.removeProduct)

//about session
router.get('/about',aboutController.getAboutPage)


//cart management
router.post('/cart',userAuth,cartController.postCart)
router.get('/cart',userAuth,cartController.getCart)
router.post('/removeProduct',userAuth,cartController.removeProduct)
router.get('/checkout',userAuth ,cartController.getCheckout);
router.get('/addAddress1',userAuth,cartController.addAddress)
router.post('/addAddress1',userAuth,cartController.postAddAddress)


router.get('/editAddressCart1',userAuth,cartController.editAddress)
router.post('/editAddressCart1',userAuth,cartController.postEditAddress1)
router.post('/updateAddress', userAuth, cartController.updateAddress);
router.get('/changeAddress',userAuth,cartController.changeAddress)
router.post('/confirmOrder',removeCartSession,userAuth,cartController.postConfirmOrder);
router.post('/updateData',userAuth,cartController.updateData)
//razorpay

router.post('/create-order', async (req, res) => {
    const { amount, currency, receipt } = req.body; // Expect amount in paise
    try {
        const order = await razorpay.orders.create({
            amount: amount, 
            currency: currency || 'INR', 
            receipt: receipt || 'receipt_order_1',
        });
        res.status(200).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});



router.post('/verify-payment', (req, res) => {
    console.log("Payment verification initiated:", req.body);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // If any field is missing, log and return immediately
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        console.error("Missing parameters in payment verification request.");
        res.status(400).json({ success: false, message: "Invalid payment data" });
        return;
    }

    const generatedSignature = crypto
        .createHmac('sha256', 'Swz6kCqpqDLYbodGriBcRFx4') // Replace with your actual key secret
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

    if (generatedSignature === razorpay_signature) {
        console.log("Payment verification successful:", razorpay_payment_id);
        res.status(200).json({ success: true });
    } else {
        console.error("Payment verification failed:");
        console.error(`Order ID: ${razorpay_order_id}`);
        console.error(`Payment ID: ${razorpay_payment_id}`);
        console.error(`Expected Signature: ${generatedSignature}`);
        console.error(`Received Signature: ${razorpay_signature}`);
        
        res.status(400).json({ 
            success: false, 
            message: 'Payment verification failed'
        });
    }
});




router.post('/log-payment-failure', (req, res) => {
    const { error_code, error_description, order_id, payment_id } = req.body;

    console.error("Payment Failure Log:");
    console.error(`Error Code: ${error_code}`);
    console.error(`Description: ${error_description}`);
    console.error(`Order ID: ${order_id}`);
    console.error(`Payment ID: ${payment_id}`);

    // Log into a file, database, or monitoring system
    // Example: Log to a file
    const fs = require('fs');
    const logMessage = `Payment Failed: Code: ${error_code}, Description: ${error_description}, Order ID: ${order_id}, Payment ID: ${payment_id}\n`;
    fs.appendFile('payment_failure.log', logMessage, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
            return res.status(500).json({ success: false, message: "Failed to log error." });
        }
        res.status(200).json({ success: true, message: "Error logged successfully." });
    });
});




//create the new router

router.post('/cancelOrder',userAuth,cartController.cancelOrder)
router.post('/returnOrder',userAuth,cartController.returnOrder)
router.post('/cancellReturnOrder',userAuth,cartController.cancellReturnOrder)
router.get('/orderDetails',userAuth,cartController.orderDetails)
router.get('/orderDetails1',userAuth,cartController.orderDetails1)



//coupon management
router.post('/checkCoupon',userAuth,couponController.checkCoupon)
module.exports = router;