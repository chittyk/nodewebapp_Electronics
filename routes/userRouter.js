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
const { userAuth, adminAuth, cartAuth, removeCartSession } = require('../middlewares/auth');

const userController =require('../controllers/user/userController');
const passport = require('passport');
const profileController =require('../controllers/user/profileController')
const cartController =require('../controllers/user/cartController')
const wishlistController=require('../controllers/user/wishlistController')
const couponController=require("../controllers/user/couponController")

const crypto = require('crypto');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: 'rzp_test_D64ckPQSXSWgra',
    key_secret: 'Swz6kCqpqDLYbodGriBcRFx4',
});


// Routes
router.get('/pageNotFound', userController.pageNotFound);
router.get('/', userController.loadHomepage);
router.get('/signLog', userController.signLog);
router.post('/signup', userController.signup);
router.get('/login', userController.getlogin);
router.post('/login',userController.login)
router.post('/verify-otp', userController.verifyOtp);
router.post('/resend-otp', userController.resendOtp);


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
router.get('/shop',userAuth,userController.loadShop)
router.get('/filter',userAuth,userController.filterProduct)
router.get('/filterPrice',userAuth,userController.filterPrice)
// router.post('/search',userAuth,userController.searchProduct)
router.get('/sort', userAuth, userController.sortProduct);
router.get('/detailProduct',userAuth,userController.detailProduct)
router.get('/advancedSearch', userAuth, userController.advancedSearch);


//wishlist management
router.get('/wishlist',userAuth,wishlistController.getWishlist)
router.post('/addToWishlist',userAuth,wishlistController.addToWishlist)
router.get('/removeFormWishlist',userAuth,wishlistController.removeProduct)

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
    console.log("rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",req.body)
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    console.log(razorpay_order_id,razorpay_payment_id,razorpay_signature)
    const generatedSignature = crypto
        .createHmac('sha256', 'Swz6kCqpqDLYbodGriBcRFx4')
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

    if (generatedSignature === razorpay_signature) {
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
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