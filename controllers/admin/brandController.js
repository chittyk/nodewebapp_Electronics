const Brand = require("../../models/brandSchema");
const Product = require("../../models/productSchema");
const { pageNotFound } = require("./adminController");

const getBrand = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit; // Correct skip calculation

        // Fetch brand data with pagination
        const brandData = await Brand.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total number of brands
        const totalBrands = await Brand.countDocuments(); // Corrected method name

        // Calculate total pages based on brand count and limit
        const totalPages = Math.ceil(totalBrands / limit);

        // Render the "brands" view
        res.render("brands", {
            data: brandData,
            currentPage: page,
            totalPages: totalPages,
            totalBrands: totalBrands
        });
    } catch (error) {
        console.log("page not found", error);
        res.redirect("/admin/pageNotFound");
    }
};

const addBrand = async (req, res) => {
    try {
        const brandname = req.body.name;  // Assuming the form field for the brand name is 'name'
        const findBrand = await Brand.findOne({ brandname });
        
        if (!findBrand) {
            const image = req.file.filename;
            const newBrand = new Brand({
                brandname:req.body.name,                  // Matches 'brandname' in schema
                brandImage: [image],        // Matches 'brandImage' and stores the filename in an array
                isBlocked: false            // Optional, as it defaults to false
            });
            console.log("find brand \n ",brandname)
            await newBrand.save();
            res.redirect('/admin/brands');
        } else {
            // If a brand with the same name exists, you may want to handle this case
            res.status(400).send('Brand already exists');
        }
    } catch (error) {
        console.error('An error occurred:', error);
        res.redirect('/admin/pageNotFound');
    }
};
const blockBrand = async (req, res) => {
    try {
        const id = req.params.id;  // Use params to get id from the URL
        if (!id) {
            return res.status(400).redirect("/admin/pageNotFound");
        }

        await Brand.updateOne({ _id: id }, { $set: { isBlocked: true } });
        res.redirect('/admin/brands');
    } catch (error) {
        console.error("Error in blocking brand:", error);
        res.redirect("/admin/pageNotFound");
    }
};

const unblockBrand = async (req, res) => {
    try {
        const id = req.params.id;  // Use params to get id from the URL
        if (!id) {
            return res.status(400).redirect("/admin/pageNotFound");
        }

        await Brand.updateOne({ _id: id }, { $set: { isBlocked: false } });
        res.redirect('/admin/brands');
    } catch (error) {
        console.error("Error in unblocking brand:", error); 
        res.redirect("/admin/pageNotFound");
    }
};

const deleteBrand = async (req, res) => {
    try {
        const id = req.params.id;  // Use params to get id from the URL
        if (!id) {
            return res.status(400).redirect("/admin/pageNotFound");
        }

        await Brand.deleteOne({ _id: id });
        res.redirect('/admin/brands');
    } catch (error) {
        console.error("Error in deleting brand:", error);
        res.status(500).redirect('/admin/pageNotFound');
    }
};


module.exports = {
    getBrand,
    addBrand,
    blockBrand,
    unblockBrand,
    deleteBrand
};
