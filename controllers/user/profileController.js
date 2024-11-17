const User = require("../../models/userSchema");
const Address = require('../../models/addressSchema')
const nodemailer = require("nodemailer");
const env = require("dotenv").config();


function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


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

const getuserProfile = async (req, res) => {
    try {
        const userId = req.session.user;
        const addressData = await Address.findOne({ userId: userId })
        // Fetch user data based on _id
        const userData = await User.findOne({ _id: userId });

        res.render('profile', {
            userData,
            userAddress: addressData
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
            console.log('user exist')
            const otp = generateOtp()
            const emailSent = await sentEmailOtp(email, otp)
            if (emailSent) {
                req.session.userOtp = otp
                req.session.userData = req.body
                req.session.email = email
                res.render("change-email-otp")
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
    try {
        const enteredOtp = req.body.otp
        console.log("otp from server", req.session.userOtp)
        if (enteredOtp === req.session.userOtp) {
            console.log('user enterd otp', enteredOtp)
            req.session.userData = req.body.userData
            console.log('user enterd otp1', enteredOtp)
            res.render("new-email", {
                userData: req.session.userData,

            })
        } else {
            res.render("change-email-otp", {
                message: "OTP not matching",
                userData: req.session.userData
            })
        }
    } catch (error) {
        res.redirect('/pageNotFound')
    }
}

const updateEmail = async (req, res) => {
    try {
        const newEmail = req.body.newEmail
        const userId = req.session.user
        await User.findByIdAndUpdate(userId, { email: newEmail })
        res.redirect('/userProfile')
    } catch (error) {
        res.redirect('/pageNotFound')
    }
}

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
            const emailSent = await sentEmailOtp(email, otp)
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



module.exports = {
    getuserProfile,
    changeEmail,
    changeEmailValid,
    resendOtp,
    sentEmailOtp,
    verifyEmailOtp,
    updateEmail,
    changePassword,
    changePasswordValid,
    verifyChangepasswordOtp,
    addAddress,
    postAddAddress,
    deleteAddress,
    editAddress,
    postEditAddress
};
