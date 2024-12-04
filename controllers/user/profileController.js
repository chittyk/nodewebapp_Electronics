const User = require("../../models/userSchema");
const Address = require('../../models/addressSchema')
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt")
const env = require("dotenv").config();
// const session =require('express-session')
const session =require('express-session');
const { render } = require("ejs");
const Order = require("../../models/orderSchema");
const Product = require("../../models/productSchema");


render
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
const sendVerification = async (email, otp) => {
    
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

        const mailOptions = { 
            from: process.env.EMAIL,
            to: email,
            subject: "Password Reset",
            text: `Your OTP is ${otp}`,
            html: `<b>Your OTP: ${otp}</b>`,
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.messageId);
        return true;
        

        
    } catch (error) {
        console.error("Error in sending email:", error);
        return false;
    }
}

const securePassword =async(password)=>{
    try {
        const passwordHash =await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
        console.error('error in hashing ',error)
        return 0
    }
}  

const getResetPassPage = async (req,res) => {
    try {
        res.render('reset-password')
    } catch (error) {
        res.redirect('/pageNotFound ')
    }
}

const  forgotEmailValid=async (req,res) => {

    try {
        console.log('hollo  ')
        // const {email} = req.body
        const { email } = req.body;
        console.log(req.body)
        
        

        const findUser = await User.findOne({email:email})
        if(findUser){
            const otp =generateOtp()
            

            const emailSent = await sendVerification(email,otp )
            console.log('email send is:',emailSent)
            if(emailSent){
                console.log('hi form if conndition')
                req.session.userOtp =otp
                req.session.email =email
                console.log(email)
                console.log('forgotpass-otp is renderd')
                res.render('forgotPass-otp')
                console.log('otp is',otp)
            }
            else{
                res.json({success:false,message:"Faild to send otp"})
            }
        }else{
            console.log('ellse condition')
            res.render('forgot-password',{
                message:"User with this Email  is does't exist"
            })
        }

    } catch (error) {

        res.redirect('/pageNotFound')
        
    }
    
}

const verifyForgotPassOtp = async (req, res) => {
    try {
        const enteredOtp = String(req.body.otp).trim(); // Sanitize input

        if (enteredOtp === req.session.userOtp) {
            console.log('OTP verification successful');
            req.session.userOtp = null; // Clear OTP from session
            return res.json({ success: true, redirectUrl: '/reset-password' });
        } else {
            console.log('OTP mismatch');
            return res.json({ success: false, message: 'OTP not matching' });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({
            success: false,
            message: 'An internal error occurred. Please try again later.',
        });
    }
};



const getForgotPassPage=async(req,res)=>{
    try {
        res.render('forgot-password')
    } catch (error) {
        res.redirect('/pageNotFound')
    }
}

const resendOtp = async (req, res) => {
    console.log("Resend OTP API Called");
    console.log("Session Data:", req.session);

    try {
        console.log("Step 1: Checking session data");

        // Access email directly from session
        const email = req.session.email;

        if (!email) {
            console.log("Step 2: Email not found in session");
            return res.status(400).json({ success: false, message: "Email is not found in session" });
        }

        console.log("Step 3: Generating new OTP");
        const otp = generateOtp();

        // Save the new OTP in the session
        req.session.userOtp = otp;

        console.log("Step 4: Sending email with new OTP");
        const emailSent = await sendVerification(email, otp);

        if (emailSent) {
            console.log("Step 5: OTP resent successfully:", otp);
            return res.status(200).json({ success: true, message: "OTP is Resent successfully" });
        } else {
            console.log("Step 6: Failed to send OTP");
            return res.status(500).json({ success: false, message: "Failed to resend OTP" });
        }
    } catch (error) {
        console.error("Error in Resending OTP:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error, Try again" });
    }
};

const postNewPassword =async (req,res) => {
    try {
        console.log(req.body)
        const {newPass1,newPass2}=req.body
        const email= req.session.email
        if(newPass1===newPass2){
            const passwordHash = await securePassword(newPass1)
            await User.updateOne(
                {email:email},
                {$set:
                    {password:passwordHash}
                }
            )
            res.redirect('/login')
        }else{
            res.render('reset-password',{message:"password  mismatch"})
        }
    } catch (error) {
        res.redirect('/pageNotFound')
    }
}

const getuserProfile = async (req, res) => {
    try {
        const userId = req.session.user;
        const addressData = await Address.findOne({ userId: userId })
        // Fetch user data based on _id
        const userData = await User.findOne({ _id: userId });

        const orders = await Order.find({userId:userId})
        const product =await Product.find({})
        console.log('orders from profile',orders)
        res.render('profile', {
            userData,
            product:product,
            orders:orders,
            userAddress: addressData,
            
        });
    } catch (error) {
        console.log('Error in profile gathering:', error);
        res.redirect('/pageNotFound');
    }
};

const changeEmail = async (req, res) => {
    try {
        res.render('change-email')
    } catch (error) {
        res.redirect('/pageNotFound')
    }
}

const changeEmailValid = async (req, res) => {
    try {
        const { email } = req.body
        const userExists = await User.findOne({ email: email })
        if (userExists) {
            console.log('user exist',userExists)
            const otp = generateOtp()
            const emailSent = await sendVerification(email, otp)
            if (emailSent) {
                req.session.userOtp = otp
                req.session.userData = req.body
                console.log('session :',req.session.userData)
                req.session.email = email
                res.render("change-email-otp",{user:userExists})
                console.log("email :", email);
                console.log('otp :', otp);


            } else {
                res.render("change-email", {
                    message: 'User with this email not exist'
                })
            }
        }
    } catch (error) {
        res.redirect("/pageNotFound")
    }
}

const verifyEmailOtp = async (req, res) => {
    console.log('1')
    try {
        console.log('2')
        const enteredOtp = req.body.otp
        console.log('3')
        console.log("otp from server", req.session.userOtp)
        console.log('4')
        if (enteredOtp === req.session.userOtp) {
            console.log('5')
            console.log('user enterd otp', enteredOtp)
            console.log(req.session.userData)
            console.log('\n\nsession',req.session)
            console.log('user enterd otp1', enteredOtp)

            const aboutUser = await User.findOne({email:req.session.email})
            console.log("aboutUser :",aboutUser)
            res.render("new-email",{
                userData: req.session.userData,
                aboutUser:aboutUser,

            })
        } else {
            console.log('6')
            res.render("change-email-otp", {
                message: "OTP not matching",
                userData: req.session.userData
            })
        }
    } catch (error) {
        console.log('7')
        res.redirect('/pageNotFound')
    }
}

const updateEmail = async (req, res) => {
    console.log('hello from updateEmail');
    try {
        console.log('Step 1: Extracting newEmail and userId');
        console.log('Request body:', req.body);

        const {newName,newEmail,newPhone}=req.body
        
        const userId = req.session.user;

        console.log('User ID:', userId);
        console.log('New Email:', newEmail);

        // Check if required data exists
        if (!userId || !newEmail) {
            console.error('Missing userId or newEmail');
            return res.status(400).send('Invalid request data');
        }

        console.log('Step 2: Updating email in database');

        const result = await User.updateOne(
            { _id: userId },
            { $set: { email: newEmail,name:newName,phone:newPhone } }
        );


        console.log('Update Result:', result);
        if (result.matchedCount === 0) {
            console.error('User not found');
            return res.status(404).send('User not found');
        }

        console.log('Step 3: Redirecting to user profile');
        res.redirect('/userProfile');
    } catch (error) {
        console.error('Error updating email:', error.message);
        res.redirect('/pageNotFound');
    }
};


const changePassword = async (req, res) => {
    try {
        res.render('change-password')
    } catch (error) {
        res.redirect('/pageNotFound')

    }
}


const changePasswordValid = async (req, res) => {
    try {
        const { email } = req.body
        const userExists = await User.findOne({ email })
        if (userExists) {
            const otp = generateOtp()
            const emailSent = await sendVerification(email, otp)
            if (emailSent) {
                req.session.userOtp = otp
                req.session.userData = req.body
                req.session.email = email;
                res.render('change-password-otp')
                console.log('OTP :', otp)
            } else {
                res.json({
                    success: false,
                    message: "Failed to send OTP "
                })
            }
        } else {
            res.render('change-password', {
                message: 'user with this email does not exist'
            })
        }
    } catch (error) {
        console.log('error in change password', error)
        res.redirect('/pageNotFound')

    }
}
const verifyChangepasswordOtp = async (req, res) => {
    try {
        const enteredOtp = req.body.otp
        if (enteredOtp === req.session.userOtp) {
            res.json({ success: true, redirectUrl: "/reset-password" })
        } else {
            res.json({ sucess: false, message: "OTP not matching" })
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "An error occured" })

    }
}

const addAddress = async (req, res) => {
    try {
        const user = req.session.user
        res.render('add-address', { user: user })
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
        res.redirect('/userProfile')
    } catch (error) {
        console.log('error in adding Address', error)
        res.redirect('/pageNotFound')

    }
}

const editAddress = async (req, res) => {
    try {
        const addressId = req.query.id
        const user = req.session.user
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

        res.render("edit-address", { address: addressData, user: user })
    } catch (error) {
        console.log('error in edit address', error)
        res.redirect('/pageNotFound')
    }
}

const deleteAddress = async (req, res) => {
    try {
        const addressId = req.query.id
        const findAddress = await Address.findOne({ 'address._id': addressId })
        if (!findAddress) {

            return res.status(404).send("Address Not Found")

        }
        await Address.updateOne({
            "address._id": addressId
        }, {
            $pull: {
                address: {
                    _id: addressId
                }
            }
        })
        res.redirect("/userProfile")
    } catch (error) {
        console.log('errror in deleting the address')
        res.redirect('/pageNotFound')

    }
}


const postEditAddress = async (req, res) => {
    try {
        const data = req.body
        const addressId = req.query.id
        const user = req.session.user
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
        console.log('3')
        res.redirect('/userProfile')



    } catch (error) {
        console.log("error in edit address", error);
        res.redirect('/pageNotFound')

    }
}
const getforgotEmailValid = async (req,res) => {
    try {
        res.render('forgotPass-otp')
    } catch (error) {
        res.redirect('/forgot-password')
    }
}


module.exports = {
    getuserProfile,
    changeEmail,
    changeEmailValid,
    resendOtp,
    sendVerification,
    verifyEmailOtp,
    updateEmail,
    changePassword,
    changePasswordValid,
    verifyChangepasswordOtp,  
    addAddress,
    postAddAddress,
    deleteAddress,
    editAddress,
    postEditAddress,


    getForgotPassPage,
    forgotEmailValid,
    getforgotEmailValid,
    verifyForgotPassOtp,
    getResetPassPage,
    postNewPassword,
    
};
