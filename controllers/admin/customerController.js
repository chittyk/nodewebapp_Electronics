const { session } = require("passport");
const User = require("../../models/userSchema");
const customerInfo = async (req, res) => {
    try {
        let search = "";
        if (req.query.search) {
            search = req.query.search;
        }
        
        let page = 1;
        if (req.query.page) {
            page = parseInt(req.query.page); // Ensure it's an integer
        }
        
        const limit = 3; // Number of items per page
        const userData = await User.find({
            isAdmin: false,
            $or: [
                { name: { $regex: ".*" + search + ".*" } },
                { email: { $regex: ".*" + search + ".*" } }
            ]
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

        const count = await User.find({
            isAdmin: false,
            $or: [
                { name: { $regex: ".*" + search + ".*" } },
                { email: { $regex: ".*" + search + ".*" } }
            ]
        }).countDocuments();

        // Calculate the total number of pages
        const totalPages = Math.ceil(count / limit);

        // Pass totalPages and currentPage to the view
        res.render('customers', { data: userData, Count: count, totalPages, currentPage: page,adminData:req.session.admin });
    } catch (error) {
        console.log('Error in customer management:', error);
    }
};
const blockCustomer = async (req, res) => {
    console.log('Executing blockCustomer controller...');
    try {
        let id = req.query.userId;
        console.log("Session details:", req.session.admin);
        console.log('User ID:', id);

        await User.updateOne({ _id: id }, { $set: { isBlocked: true } });
        res.redirect("/admin/users");
    } catch (error) {
        console.log('Error in blocking:', error);
    }
};



const unblockCustomer=async(req,res)=>{
    try {
        let id =req.query.id
        console.log('id',id)

        await User.updateOne({_id:id},{$set:{isBlocked:false}})
        res.redirect("/admin/users")
    } catch (error) {
        console.log('error in unblocking')
        
    }
}

module.exports = {
    customerInfo,
    unblockCustomer,
    blockCustomer,
    
};
