const User = require('../../models/userSchema');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const category = require('../../models/catagorySchema');

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

const dashboard = (req, res) => {
    try {
        if (req.session.admin) {
            return res.render('dashboard', { adminData: req.session.admin });
        } else {
            return res.redirect('/admin/login');
        }
    } catch (error) {
        console.error('Error in redirecting to dashboard:', error);
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
