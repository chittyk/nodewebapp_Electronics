const express = require('express');
const router = express.Router();
const { userAuth, adminAuth } = require('../middlewares/auth');
const categoryController = require('../controllers/admin/categoryController');
const adminController = require('../controllers/admin/adminController'); 
const customerController = require('../controllers/admin/customerController');
const ProductController =require("../controllers/admin/ProductController")
const multer =require("multer")
const storage=require('../helpers/multer')
const uploads = multer({storage:storage})
const brandController =require('../controllers/admin/brandController');
const { authenticate } = require('passport');
const BannerController =require('../controllers/admin/bannerController');
const Banner = require('../models/BannerSchema');
const couponController=require('../controllers/admin/couponController')
const orderController =require("../controllers/admin/orderController");
const salesReportController=require("../controllers/admin/salesReportController")
const pdfController =require('../controllers/admin/pdfController')
const ExcelJS = require('exceljs');

//pageNotFound
router.get("/pageNotFound",adminAuth,adminController.pageNotFound)

// Admin authentication routes
router.get('/login', adminController.loadLogin);
router.post('/login', adminController.verifyLogin);
router.get('/dashboard', adminAuth, adminController.dashboard);
router.get('/logout', adminController.logout);

// Customer management system
router.get('/users', adminAuth, customerController.customerInfo);
router.get('/blockCustomer', adminAuth, customerController.blockCustomer); // Changed to POST
router.get('/unblockCustomer', adminAuth, customerController.unblockCustomer); // Changed to POST



// Category management
router.get('/category', adminAuth, categoryController.categoryInfo); // Corrected route
router.post('/addCategory',adminAuth,categoryController.addCategory)
router.post('/addCategoryOffer',adminAuth,categoryController.addCategoryOffer)
router.post('/removeCategoryOffer',adminAuth,categoryController.removeCategoryOffer)
router.get('/unlistCategory',adminAuth,categoryController.getUnListCategory)
router.get('/listCategory',adminAuth,categoryController.getListCategory)
router.get('/editCategory',adminAuth,categoryController.getEditCategory)
router.post('/editCategory/:id',adminAuth,categoryController.editCategory)

// Brand management
router.get("/brands", adminAuth, brandController.getBrand);
router.post('/addBrand', adminAuth, uploads.single('image'), brandController.addBrand);

router.get("/blockBrand/:id", adminAuth, brandController.blockBrand);
router.get("/unblockBrand/:id", adminAuth, brandController.unblockBrand);
router.get("/deleteBrand/:id", adminAuth, brandController.deleteBrand);


//add product
router.get('/addProducts',adminAuth,ProductController.getProductAddpage)
router.post('/addProducts', adminAuth, uploads.array('images', 4), ProductController.addProducts);
router.get('/products',adminAuth,ProductController.getAllProducts)
router.post('/addProductOffer',adminAuth,ProductController.addProductOffer)
router.post('/removeProductOffer',adminAuth,ProductController.removeProductOffer)
router.get('/blockProduct',adminAuth,ProductController.blockProduct)
router.get("/unblockProduct",adminAuth,ProductController.unblockProduct)
router.get("/editProduct",adminAuth,ProductController.getEditProduct)
router.post('/editProduct/:id',adminAuth,uploads.array('images',4),ProductController.editProduct)
router.post('/deleteImage',adminAuth,ProductController.deleteSingleImage)

//Banner Management
router.get('/banner',adminAuth,BannerController.getBannerPage)
router.get('/addBanner',adminAuth,BannerController.addBannerPage)
router.post('/addBanner',adminAuth,uploads.single('images'),BannerController.addBanner)
router.get('/deleteBanner',adminAuth,BannerController.deleteBanner)

//order management
router.get('/orders',adminAuth,orderController.getOrders)
router.post('/changeStatus',adminAuth,orderController.changeStatus)
router.post('/removeFromHistory',adminAuth,orderController.removeFromHistory)

// Assuming you have a route for updating the order status
router.post('/update-order-status',adminAuth,orderController.updateOrders);

router.get('/orderDetails', adminAuth, orderController.orderDetails);


//coupon management 
router.get('/coupon', adminAuth, couponController.getCoupon)
router.post('/createCoupon',adminAuth, couponController.createCoupon)
router.get('/editCoupon',adminAuth,couponController.editCoupon)
router.post('/postEditCoupon',adminAuth,couponController.postEditCoupon)
router.post('/deleteCoupon',adminAuth,couponController.deleteCoupon)



// sales report
router.get("/salesReport",adminAuth,salesReportController.getSalesReport)

router.get('/generate-pdf',adminAuth,pdfController.createPdf)


module.exports = router;
