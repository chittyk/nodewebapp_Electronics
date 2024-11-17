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
const { userAuth, adminAuth } = require('../middlewares/auth');
const userController = require('../controllers/user/userController');
const passport = require('passport');
const profileController =require('../controllers/user/profileController')

// Routes
router.get('/pageNotFound', userController.pageNotFound);
router.get('/', userController.loadHomepage);
router.get('/signLog', userController.signLog);
router.post('/signup', userController.signup);
router.get('/login', userController.getlogin);
router.post('/verify-otp', userController.verifyOtp);
router.post('/resend-otp', userController.resendOtp);


// Google Authentication Route
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Authentication Callback Route
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/signup' }), (req, res) => {
    res.redirect('/');
});

router.post('/login',userController.login)

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


//shopping page
router.get('/shop',userAuth,userController.loadShop)
router.get('/filter',userAuth,userController.filterProduct)
router.get('/filterPrice',userAuth,userController.filterPrice)
router.post('/search',userAuth,userController.searchProduct)
router.get('/detailProduct',userAuth,userController.detailProduct)
module.exports = router;


