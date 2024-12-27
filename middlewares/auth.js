const Address = require('../models/addressSchema');
const User = require('../models/userSchema');

const cartAuth= async(req,res,next)=>{
    try {
        req.session.cart = {
            cart:true
        };
        console.log('session ccarrtt tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt',req.session.cart)
        next()
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
}

const removeCartSession = async (req, res, next) => {
    try {
        if (req.session.cartData) {
            delete req.session.cartData; // Remove the cart session
            console.log('Cart session removed successfully.');
            next(); // Proceed to the next middleware
        } else {
            console.log('No cart session found.');
            return res.redirect('/'); // Render the "cart" view and terminate execution
        }
    } catch (error) {
        console.error('Error in removeCartSession:', error);
        next(error); // Pass the error to the error-handling middleware
    }
};


const userAuth = (req, res, next) => {
    if (req.session.user) {
        User.findById(req.session.user)
            .then(data => {
                if (data && !data.isBlocked) {
                    next();
                } else {
                    res.redirect('/login');
                }
            })
            .catch(error => {
                console.log("Error in userAuth middleware:", error);
                res.status(500).send("Internal server error");
            });
    } else {
        res.redirect('/login');
    }
};


const isLogin = (req, res, next) => {
    if (!req.session.user) {
        next();
    
            
    } else {
        res.redirect('/');
    }
};



const adminAuth = (req, res, next) => {
    if (req.session.admin) {
        User.findOne({ _id: req.session.admin._id, isAdmin: true })
            .then(data => {
                if (data) {
                    next();
                } else {
                    res.redirect('/admin/login');
                }
            })
            .catch(error => {
                console.log("Error in adminAuth middleware:", error);
                res.status(500).send('Internal server error');
            });
    } else {
        res.redirect('/admin/login');
    }
};

module.exports = {
    userAuth,
    adminAuth,
    cartAuth,
    removeCartSession,
    isLogin
};
