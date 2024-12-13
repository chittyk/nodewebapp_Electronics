const Razorpay = require('razorpay');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,      // Your Key ID
    key_secret: process.env.RAZORPAY_KEY_SECRET, // Your Key Secret
});

// Payment Controller
const createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body; // Amount from the client (in rupees)

        const options = {
            amount: amount * 100, // Convert rupees to paise
            currency: "INR",
            receipt: "receipt#" + Date.now(),
        };

        const order = await razorpay.orders.create(options);
        res.status(201).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create Razorpay order" });
    }
};


// Payment verification endpoint
const verifyRazorpayPayment = async (req, res) => {
    try {
        const { payment_id, order_id, signature } = req.body;
        console.log("Payment ID:", payment_id); // Debugging line
        console.log("Order ID:", order_id); // Debugging line
        console.log("Signature:", signature); // Debugging line

        const isSignatureValid = razorpay.utils.verifyPaymentSignature({
            payment_id,
            order_id,
            signature,
        });

        if (!isSignatureValid) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
        });
    } catch (error) {
        console.error("Verification Error:", error); // Debugging line
        return res.status(500).json({
            success: false,
            message: 'An error occurred while verifying payment',
        });
    }
};





module.exports = {
    createRazorpayOrder, // Exporting the controller function
    verifyRazorpayPayment
};
