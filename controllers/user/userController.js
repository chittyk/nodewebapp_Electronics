// const nodemailer = require("nodemailer");
// const env = require("dotenv").config();
// const User = require("../../models/userSchema");
// const bcrypt = require("bcrypt");

// // Render signup/login page
// const signLog = async (req, res) => {
//   try {
//     return res.render("signuplogin");
//   } catch (error) {
//     console.error("Error rendering signuplogin page:", error);
//     res.redirect("/user/pageNotFound");
//   }
// };

// // Function for OTP generation
// function generateOtp() {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }

// // Function for sending OTP via email
// async function sentEmailOtp(email, otp) {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       port: 587,
//       secure: false,
//       requireTLS: true,
//       auth: {
//         user: process.env.EMAIL,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const info = await transporter.sendMail({
//       from: process.env.EMAIL,
//       to: email,
//       subject: "Verify Email",
//       text: `Your OTP is ${otp}`,
//       html: `<b>Your OTP: ${otp}</b>`,
//     });

//     return info.accepted.length > 0;
//   } catch (error) {
//     console.error("Error in sending email:", error);
//     return false;
//   }
// }



// // Post signup
// // const signup = async (req, res) => {
// //   try {
// //     const { name, phone, email, password, cpassword } = req.body;

// //     if (password !== cpassword) {
// //       return res.render("signuplogin", { message: "Passwords do not match" });
// //     }

// //     const findUser = await User.findOne({ email });
// //     if (findUser) {
// //       console.log("User already exists");
// //       return res.render("signuplogin", { message: "Email already exists" });
// //     }

// //     const otp = generateOtp();
// //     const emailSent = await sentEmailOtp(email, otp);

// //     if (!emailSent) {
// //       return res.json("email-error");
// //     }

// //     req.session.userOtp = otp;
// //     req.session.userData = { name, phone, email, password };
// //     console.log("\n\nsession data :", req.session.userData);
// //     res.render("verify-otp");
// //     console.log("OTP Sent:", otp);
// //   } catch (error) {
// //     console.error("Signup error:", error);
// //     res.redirect("/pageNotFound");
// //   }
// // };

// // Secure password hashing
// const securePassword = async (password) => {
//     try {
//       const passwordHash = await bcrypt.hash(password, 10);
//       return passwordHash;
//     } catch (error) {
//       console.error("Error in hashing:", error);
//       throw new Error("Hashing failed"); // Throw an error to indicate a problem in hashing
//     }
//   };

//   // OTP verification
// //   const verifyOtp = async (req, res) => {
// //     try {
// //       let { otp } = req.body; // Assuming 'otp' is sent as an array of characters
// //       otp = otp.join(""); // Convert array to string
// //       console.log("Entered OTP:", otp);
// //       console.log("Session OTP:", req.session.userOtp);

// //       // Check if the entered OTP matches the session OTP
// //       if (otp === req.session.userOtp) {
// //         const user = req.session.userData; // Retrieve user data from session
// //         const passwordHash = await securePassword(user.password); // Secure the password

// //         // Create a new user with hashed password
// //         const saveUserData = new User({
// //           name: user.name,
// //           email: user.email,
// //           phone: user.phone,
// //           password: passwordHash,
// //         });

// //         // Save user data to the database
// //         await saveUserData.save();

// //         // Store user ID in the session
// //         req.session.User = saveUserData._id; 

// //         // Respond with success and redirect URL
// //         res.status(200).json({ success: true, redirectUrl: "/" }); // 200 OK status
// //       } else {
// //         // Invalid OTP response
// //         res.status(400).json({ success: false, message: "Invalid OTP, Please Try again" }); // 400 Bad Request
// //       }
// //     } catch (error) {
// //       console.error("Error in OTP verification:", error);
// //       // Handle unexpected errors with a server error status
// //       res.status(500).json({ success: false, message: "An Error occurred" }); // 500 Internal Server Error
// //     }
// //   };


// // Load home page
// const loadHomepage = async (req, res) => {
//   try {
//     const user = req.session.user; // Get the user from session
//     console.log(req.session.user); // Log the user object for debugging

//     if (user) {
//       const userData = await User.findOne({_id: user}); 
//       console.log('userData is  :\n', userData); 

//       return res.render("home", { userData }); 
//     } else {
//       res.redirect('/', { message: 'login failed try again' }); 
//     }

//   } catch (error) {
//     console.log("Home page not found:", error); 
//     res.status(500).send("Server error"); 
//   }
// };


// // Page not found handler
// const pageNotFound = async (req, res) => {
//   try {
//     res.render("404");
//   } catch (error) {
//     console.log("404 page rendering error:", error);
//     res.status(404).send("Page not found");
//   }
// };


// const signup = async (req, res) => {
//     try {
//       const { name, phone, email, password, cpassword } = req.body;

//       if (password !== cpassword) {
//         return res.render("signuplogin", { message: "Passwords do not match" });
//       }

//       const findUser = await User.findOne({ email });
//       if (findUser) {
//         console.log("User already exists");
//         return res.render("signuplogin", { message: "Email already exists" });
//       }

//       const otp = generateOtp();
//       const emailSent = await sentEmailOtp(email, otp);

//       if (!emailSent) {
//         return res.json("email-error");
//       }

//       req.session.userOtp = otp;
//       req.session.userData = { name, phone, email, password };

//       res.render("verify-otp");
//       console.log("OTP Sent:", otp);
//     } catch (error) {
//       console.error("Signup error:", error);
//       res.redirect("/pageNotFound");
//     }
//   };

//   // Update verifyOtp function to ensure saving
//   const verifyOtp = async (req, res) => {
//     try {
//       let { otp } = req.body; // Assuming 'otp' is sent as an array of characters
//       otp = otp.join(""); // Convert array to string

//       if (otp === req.session.userOtp) {
//         const user = req.session.userData; // Retrieve user data from session
//         const passwordHash = await securePassword(user.password); // Secure the password

//         // Create a new user with hashed password
//         const saveUserData = new User({
//           name: user.name,
//           email: user.email,
//           phone: user.phone,
//           password: passwordHash,
//         });

//         // Save user data to the database
//         try {
//           await saveUserData.save(); // This needs to be inside a try-catch block
//           req.session.User = saveUserData._id; // Store user ID in the session
//           res.status(200).json({ success: true, redirectUrl: "/" });
//         } catch (dbError) {
//           console.error("Error saving user data:", dbError); // Log database errors
//           res.status(500).json({ success: false, message: "Could not create user" });
//         }
//       } else {
//         res.status(400).json({ success: false, message: "Invalid OTP, Please Try again" });
//       }
//     } catch (error) {
//       console.error("Error in OTP verification:", error);
//       res.status(500).json({ success: false, message: "An Error occurred" });
//     }
//   };
//   const resendOtp = async (req, res) => {
//     try {
//         const { email } = req.session.userData;
//         if (!email) {
//             return res.status(400).json({ success: false, message: "Email is not found in session" });
//         }

//         const otp = generateOtp();
//         req.session.userOtp = otp;

//         const emailSent = await sentEmailOtp(email, otp);
//         if (emailSent) {
//             console.log("Resend OTP is ", otp);
//             res.status(200).json({ success: true, message: "OTP is Resent successfully" });
//         } else {
//             res.status(500).json({ success: false, message: "Failed to resend OTP" });
//         }
//     } catch (error) {
//         console.log("Error in Resending OTP: ", error);
//         res.status(500).json({ success: false, message: "Internal Server Error, Try again" });
//     }
// };

// const login= async(req,res)=>{
//     try {
//       console.log('start varifing')
//       const {email,password}=req.body
//       // console.log(req.body)//checked
//       // console.log('email :',email, 'pass:',password)//checked
//       const findUser =await User.findOne({isAdmin:0,email:email})
//       // console.log(findUser)//checked
//       if(!findUser){
//         console.log('User Not found')
//         return res.render("signuplogin",{message1:"User not found"})
//       }
//       if(findUser.isBlocked){
//         console.log('user is tempararly blocked')
//         return res.render("signuplogin",{message1:"User is Bolcked by Admin"})
//       }
//       const passwordMatch = await bcrypt.compare(password,findUser.password)

//       if(!passwordMatch){
//         console.log('password is missmatch')
//         return res.render("signuplogin",{message1:'Incorrect Password'})
//       }
//       req.session.user =findUser.id
//       console.log("user is login successfully")
//       res.redirect('/home')

//     } catch (error) {
//       console.error("error in login",error)
//       res.render('signuplogin',{message1:"login failed, try again later"})
//     }
// }

// const logout= async(req,res)=>{
//   try {
//     req.session.destroy((err)=>{
//       if(err){
//         console.log('Session destroy error ',err.message)
//         return res.redirect('/pageNotFound')
//       }else{
//         return res.redirect('/')
//       }
//     })
//   } catch (error) {
//     console.log('error in log out ',error)
//     res.redirect('/pageNotFound')
//   }
// }


// module.exports = {
//   loadHomepage,
//   pageNotFound,
//   signLog,
//   signup,
//   verifyOtp,
//   resendOtp,
//   login,
//   logout,
// };









const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const User = require("../../models/userSchema");
const Category = require('../../models/catagorySchema')
const Product = require('../../models/productSchema')
const Banner = require('../../models/BannerSchema')
const Brand =require('../../models/brandSchema')
const bcrypt = require("bcrypt");

const { create } = require("hbs");
const { query } = require("express");
const { search } = require("../../routes/userRouter");



// Render signup/login page
const signLog = async (req, res) => {
  try {
    return res.render("signuplogin");
  } catch (error) {
    console.error("Error rendering signuplogin page:", error);
    res.redirect("/user/pageNotFound");
  }
};


const getlogin = async (req, res) => {
  try {
    return res.render("login");
  } catch (error) {
    console.error("Error rendering signuplogin page:", error);
    res.redirect("/user/pageNotFound");
  }
};


// Function for OTP generation
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function for sending OTP via email
async function sentEmailOtp(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Verify Email",
      text: `Your OTP is ${otp}`,
      html: `<b>Your OTP: ${otp}</b>`,
    });

    return info.accepted.length > 0;
  } catch (error) {
    console.error("Error in sending email:", error);
    return false;
  }
}


const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.error("Error in hashing:", error);
    throw new Error("Hashing failed"); // Throw an error to indicate a problem in hashing
  }
};



// Load home page
const loadHomepage = async (req, res) => {
  try {
    const today = new Date().toISOString()
    const findBanner = await Banner.find({
      startDate: { $lt: new Date(today) },
      endDate: { $gt: new Date(today) }
    })
    const user = req.session.user; // Get the user from session

    const categories = await Category.find({ isListed: true })
    let productData = await Product.find(
      {
        isBlocked: false,
        category: { $in: categories.map(category => category._id) }, quantity: { $gt: 0 }
      }
    )

    productData.sort((a, b) => (b.createdOn) - (a.createdOn));
    productData = productData.slice(0, 4)

    console.log(req.session.user); // Log the user object for debugging




    if (user) {
      const userData = await User.findOne({ _id: user });
      console.log('userData is  :\n', userData);
      console.log('product is  :\n', productData);
      console.log('banner :\n', findBanner)
      return res.render("home", { userData, productData, banner: findBanner || [] });
    } else {
      console.log('banner :\n', findBanner)

      res.render('home', { productData, banner: findBanner || [] });
    }

  } catch (error) {
    console.log("Home page not found:", error);
    res.status(500).send("Server error");
  }
};


// Page not found handler
const pageNotFound = async (req, res) => {
  try {
    res.render("404");
  } catch (error) {
    console.log("404 page rendering error:", error);
    res.status(404).send("Page not found");
  }
};


const signup = async (req, res) => {
  try {
    const { name, phone, email, password, cpassword } = req.body;

    if (password !== cpassword) {
      return res.render("signuplogin", { message: "Passwords do not match" });
    }

    const findUser = await User.findOne({ email });
    if (findUser) {
      console.log("User already exists");
      return res.render("signuplogin", { message: "Email already exists" });
    }

    const otp = generateOtp();
    const emailSent = await sentEmailOtp(email, otp);

    if (!emailSent) {
      return res.json("email-error");
    }

    req.session.userOtp = otp;
    req.session.userData = { name, phone, email, password };

    res.render("verify-otp");
    console.log("OTP Sent:", otp);
  } catch (error) {
    console.error("Signup error:", error);
    res.redirect("/pageNotFound");
  }
};

// Update verifyOtp function to ensure saving
const verifyOtp = async (req, res) => {
  try {
    let { otp } = req.body; // Assuming 'otp' is sent as an array of characters
    otp = otp.join(""); // Convert array to string

    if (otp === req.session.userOtp) {
      const user = req.session.userData; // Retrieve user data from session
      const passwordHash = await securePassword(user.password); // Secure the password

      // Create a new user with hashed password
      const saveUserData = new User({
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: passwordHash,
      });

      // Save user data to the database
      try {
        await saveUserData.save(); // This needs to be inside a try-catch block
        req.session.User = saveUserData._id; // Store user ID in the session
        res.status(200).json({ success: true, redirectUrl: "/login" });
      } catch (dbError) {
        console.error("Error saving user data:", dbError); // Log database errors
        res.status(500).json({ success: false, message: "Could not create user" });
      }
    } else {
      res.status(400).json({ success: false, message: "Invalid OTP, Please Try again" });
    }
  } catch (error) {
    console.error("Error in OTP verification:", error);
    res.status(500).json({ success: false, message: "An Error occurred" });
  }
};
const resendOtp = async (req, res) => {
  try {
    const { email } = req.session.userData;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is not found in session" });
    }

    const otp = generateOtp();
    req.session.userOtp = otp;

    const emailSent = await sentEmailOtp(email, otp);
    if (emailSent) {
      console.log("Resend OTP is ", otp);
      res.status(200).json({ success: true, message: "OTP is Resent successfully" });
    } else {
      res.status(500).json({ success: false, message: "Failed to resend OTP" });
    }
  } catch (error) {
    console.log("Error in Resending OTP: ", error);
    res.status(500).json({ success: false, message: "Internal Server Error, Try again" });
  }
};

const login = async (req, res) => {
  try {
    console.log('start varifing')
    const { email, password } = req.body
    // console.log(req.body)//checked
    // console.log('email :',email, 'pass:',password)//checked
    const findUser = await User.findOne({ isAdmin: 0, email: email })
    // console.log(findUser)//checked
    if (!findUser) {
      console.log('User Not found')
      return res.render("login", { message1: "User not found" })
    }
    if (findUser.isBlocked) {
      console.log('user is tempararly blocked')
      return res.render("login", { message1: "User is Bolcked by Admin" })
    }
    const passwordMatch = await bcrypt.compare(password, findUser.password)

    if (!passwordMatch) {
      console.log('password is missmatch')
      return res.render("login", { message1: 'Incorrect Password' })
    }
    req.session.user = findUser.id
    console.log("user is login successfully")
    res.redirect('/')

  } catch (error) {
    console.error("error in login", error)
    res.render('login', { message1: "login failed, try again later" })
  }
}

const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log('Session destroy error ', err.message)
        return res.redirect('/pageNotFound')
      } else {
        return res.redirect('/')
      }
    })

  } catch (error) {
    console.log('error in log out ', error)
    res.redirect('/pageNotFound')
  }
}
const loadShop = async (req, res) => {
  try {
    const user = req.session.user;
    const userData = await User.findOne({ _id: user });
    const categories = await Category.find({ isListed: true });
    const categoryIds = categories.map(category => category._id.toString());
    
    const page = parseInt(req.query.page) || 1;  // Get page number from query params
    const limit = 4;
    const skip = (page - 1) * limit;  // Calculate products to skip for pagination

    const products = await Product.find({
      isBlocked: false,
      category: { $in: categoryIds },
      quantity: { $gt: 0 },
    })
    .sort({ createdOn: -1 })
    .skip(skip)
    .limit(limit);  // Apply limit for pagination

    const totalProducts = await Product.countDocuments({
      isBlocked: false,
      category: { $in: categoryIds },
      quantity: { $gt: 0 }
    });

    const totalPages = Math.ceil(totalProducts / limit);  // Calculate total pages

    const brands = await Brand.find({ isBlocked: false });

    res.render('shop', {
      userData,
      products,
      category: categories,
      brand: brands,
      totalProducts,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    res.redirect('/pageNotFound');
  }
};
const filterProduct = async (req, res) => {
  try {
    const user = req.session.user;
    const category = req.query.category;
    const brand = req.query.brand;

    const findCategory = category ? await Category.findOne({ _id: category }) : null;
    const findBrand = brand ? await Brand.findOne({ _id: brand }) : null;
    const brands = await Brand.find({}).lean();

    const query = {
      isBlocked: false,
      quantity: { $gt: 0 }
    };

    if (findCategory) {
      query.category = findCategory._id;
    }
    if (findBrand) {
      query.brand = findBrand.brandname;
    }

    let findProducts = await Product.find(query).lean();
    findProducts.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));

    const categories = await Category.find({ isListed: true });

    let itemsPerPage = 6;
    let currentPage = parseInt(req.query.page) || 1;
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let totalPages = Math.ceil(findProducts.length / itemsPerPage);
    const currentProduct = findProducts.slice(startIndex, endIndex);

    let userData = null;
    if (user) {
      userData = await User.findOne({ _id: user });
      if (userData) {
        const searchEntry = {
          category: findCategory ? findCategory._id : null,
          brand: findBrand ? findBrand.brandname : null,
          searchedOn: new Date()
        };
        userData.searchHistory.push(searchEntry);
        await userData.save();
      }
    }

    req.session.filteredProducts = currentProduct;
    res.render('shop', {
      userData: req.session.userData,
      products: currentProduct,
      brand:brands,
      category: categories, // Ensure this line passes categories as "category"
      totalPages,
      currentPage,
      selectedCategory: category || null,
      selectedBrand: brand || null
    });
    

  } catch (error) {
    console.error('Error in filterProduct:', error); // Log the error
    res.redirect('/pageNotFound');
  }
};

const filterPrice = async (req,res) => {
  try {
    const user =req.session.user
    const userData = await User.findOne({_id:user})
    const brands = await Brand.find({}).lean()
    const categories = await Category.find({isListed:true}).lean()

    let findProducts =await Product.find({
      salePrice:{$gte:req.query.gt,$lt:req.query.lt},
      isBlocked:false,
      quantity : {$gt:0}
    }).lean()
    findProducts.sort((a,b)=>new Date(b.createdOn)-new Date(a.createdOn))
    
    let itemsPerPage=6;
    let currentPage=parseInt(req.query.page) || 1
    let startIndex =(currentPage-1)*itemsPerPage
    let endIndex =startIndex+itemsPerPage
    let totalPages =Math.ceil(findProducts.length/itemsPerPage)
    const currentProduct=findProducts.slice(startIndex,endIndex)
    req.session.filteredProducts = findProducts

    res.render('shop',{
      userData: req.session.userData,
      products :currentProduct,
      category: categories,
      brand:brands,
      totalPages,
      currentPage,
    })
  } catch (error) {
    res.redirect('/pageNotFound')
  }
}
const searchProduct = async (req, res) => {
  try {
    const user = req.session.user;
    const userData = await User.findOne({ _id: user });
    let search = req.body.query;
    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0',req.body.query)
    // Fetch brands and categories
    const brands = await Brand.find({}).lean();
    const categories = await Category.find({ isListed: true }).lean();
    const categoryIds = categories.map(category => category._id.toString());

    let searchResult = [];
    if (req.session.filteredProducts && req.session.filteredProducts.length > 0) {
      searchResult = req.session.filteredProducts.filter(product =>
        product.productName.toLowerCase().includes(search.toLowerCase())
      );
    } else {
      searchResult = await Product.find({
        productName: { $regex: search, $options: 'i' },
        isBlocked: false,
        quantity: { $gt: 0 },
        category: { $in: categoryIds }
      }).lean();
    }

    searchResult.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));

    const itemsPerPage = 6;
    const currentPage = parseInt(req.query.page) || 1;  // Check the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const totalPages = Math.ceil(searchResult.length / itemsPerPage);

    // Debugging
    console.log('Current page:', currentPage);
    console.log('Total pages:', totalPages);

    const currentProduct = searchResult.slice(startIndex, endIndex);

    res.render('shop', {
      userData: req.session.userData,
      products: currentProduct,
      category: categories,
      brand: brands,
      totalPages,
      currentPage,
      count: searchResult.length
    });

  } catch (error) {
    console.error('Error occurred:', error);
    res.redirect('/pageNotFound');
  }
};


const detailProduct =async (req,res)=>{
  try {
    const productId = req.query.id; 
    console.log('Product ID:', req.session);
    
    const userData= await User.findOne({_id:req.session.user})
    const product = await Product.findOne({_id:productId})
    const category= await Category.findOne({_id:product.category})
    console.log(product)
    console.log ('\ncategory\n',category)
    res.render('product-details',{
      userData:userData,
      product:product,
      category:category

    })
  } catch (error) {
    res.redirect('/pageNotFound')
  }
}


const sortProduct = async (req, res) => {
  try {
    const user = req.session.user;
    const userData = user ? await User.findById(user) : null;
    const categories = await Category.find({ isListed: true });
    const brands = await Brand.find({ isBlocked: false });

    // Default sorting criteria
    let sortCriteria = { createdOn: -1 }; // Newest first

    // Retrieve sorting parameter from query
    const { sortBy } = req.query;

    // Define sorting logic
    switch (sortBy) {
      case "priceLowHigh":
        sortCriteria = { salePrice: 1 }; // Sort by sale price (ascending)
        break;
      case "priceHighLow":
        sortCriteria = { salePrice: -1 }; // Sort by sale price (descending)
        break;
      case "nameAsc":
        sortCriteria = { productName: 1 }; // Sort by name A-Z
        break;
      case "nameDesc":
        sortCriteria = { productName: -1 }; // Sort by name Z-A
        break;
      default:
        sortCriteria = { createdOn: -1 }; // Default to newest first
    }

    // Fetch products with sorting
    const products = await Product.find({
      isBlocked: false,
      quantity: { $gt: 0 },
    })
      .sort(sortCriteria)
      .lean();

    res.render("shop", {
      userData,
      products,
      brand: brands,
      category: categories,
    });
  } catch (error) {
    console.error("Error while sorting products:", error);
    res.redirect("/pageNotFound");
  }
};



module.exports = {
  getlogin,
  loadHomepage,
  pageNotFound,
  signLog,
  signup,
  verifyOtp,
  resendOtp,
  login,
  logout,
  loadShop,
  filterProduct,
  filterPrice,
  searchProduct,
  detailProduct,
  sortProduct
};
