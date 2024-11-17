const Brand = require("../../models/brandSchema")
const Category = require("../../models/catagorySchema")
const Product = require("../../models/productSchema")
const fs = require('fs')
const path = require('path')
const sharp = require("sharp")
const User = require("../../models/userSchema")
const { search } = require("../../routes/adminRouter")
const { render } = require("ejs")
const category = require("../../models/catagorySchema")

const getProductAddpage = async (req, res) => {
    try {

        const category = await Category.find({ isListed: true })
        const brand = await Brand.find({ isBlocked: false })
        console.log("brand:\n",)
        res.render("product-add", {
            cat: category,
            brand: brand
        })
    } catch (error) {
        res.redirect('/admin/pageNotFound')
    }
}
const addProducts = async (req, res) => {
    try {
        console.log('hello from addProduct');

        const products = req.body;

        // Check if the product already exists in the database
        const productExists = await Product.findOne({
            productName: products.productName,
        });

        if (productExists) {
            return res.status(400).json("Product already exists");
        }

        const images = [];

        // If files are uploaded, process them
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const originalImagePath = req.files[i].path;
                const resizedImageDir = path.join('public', 'uploads', 'product-images');

                // Ensure the directory exists
                if (!fs.existsSync(resizedImageDir)) {
                    fs.mkdirSync(resizedImageDir, { recursive: true });
                }

                const resizedImagePath = path.join(resizedImageDir, req.files[i].filename);

                // Resize the image and save it
                await sharp(originalImagePath).resize({ width: 440, height: 440 }).toFile(resizedImagePath);

                images.push(req.files[i].filename);
            }
        }

        // Validate the category
        const category = await Category.findOne({ name: products.category });
        if (!category) {
            return res.status(400).send('Invalid category name');
        }
        console.log("porducts", products)
        // Create the new product
        const newProduct = new Product({
            productName: products.productName,
            description: products.description,
            brand: products.brand,
            category: category,
            regularPrice: products.regularPrice,
            salePrice: products.salePrice,
            productOffer: 0,
            createdOn: new Date(),
            quantity: products.quantity,
            // size: products.size,
            color: products.color,
            productImage: images,
            status: "Available"
        });

        // Save the new product to the database
        await newProduct.save();

        console.log('Product added successfully:', newProduct.productName);
        return res.redirect('/admin/addProducts');

    } catch (error) {
        console.error("Error in saving product:", error);
        return res.redirect('/admin/pageNotFound');
    }
}

const getAllProducts = async (req, res) => {
    try {
        const search = req.query.search || ""; // Search query
        const page = parseInt(req.query.page) || 1; // Current page, defaults to 1 if not specified
        const limit = parseInt(req.query.limit) || 10; // Number of items per page, defaults to 10 if not specified

        // Fetch products with pagination and search filter
        const productData = await Product.find({
            $or: [
                { productName: { $regex: new RegExp('.*' + search + '.*', 'i') } },
                { brand: { $regex: new RegExp('.*' + search + '.*', 'i') } }
            ]
        })
        .limit(limit)
        .skip((page - 1) * limit)
        .populate('category')
        .exec();

        // Count total products matching the search query
        const count = await Product.countDocuments({
            $or: [
                { productName: { $regex: new RegExp('.*' + search + '.*', 'i') } },
                { brand: { $regex: new RegExp('.*' + search + '.*', 'i') } }
            ]
        });

        // Fetch categories and brands
        const categories = await Category.find({ isListed: true });
        const brands = await Brand.find({ isBlocked: false });

        if (categories && brands) {
            // Render the products page with data
            res.render("products", {
                data: productData,
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                categories: categories,
                brands: brands,
                search: search // Pass search query to maintain input value in the frontend
            });
        } else {
            // Render page not found if no categories or brands found
            res.render('pageNotFound');
        }
    } catch (error) {
        console.error("Error fetching products:", error); // Log error for debugging
        res.redirect('/admin/pageNotFound');
    }
};

const addProductOffer = async (req, res) => {
    try {
        console.log('Request Body: ', req.body);
        const { productId, percentage } = req.body;

        // Trim whitespace from productId
        const trimmedProductId = productId.trim();

        // Find the product and check if it exists
        const findProduct = await Product.findById(trimmedProductId);
        if (!findProduct) {
            return res.status(404).json({ status: false, message: "Product not found" });
        }

        // Find the category and check if it exists
        const findCategory = await Category.findById(findProduct.category);
        if (!findCategory) {
            return res.status(404).json({ status: false, message: "Category not found" });
        }

        // Check if the category offer is greater than the product offer percentage
        if (findCategory.categoryOffer > percentage) {
            return res.json({ status: false, message: "The product's category offer already exists" });
        }

        // Calculate the sale price and apply the product offer
        findProduct.salePrice = findProduct.regularPrice - Math.floor(findProduct.regularPrice * (percentage / 100));
        findProduct.productOffer = parseInt(percentage, 10);

        // Save the updated product and reset category offer
        await findProduct.save();
        findCategory.categoryOffer = 0;
        await findCategory.save();

        res.json({ status: true, message: "Product offer added successfully" });
    } catch (error) {
        console.error("Error in addProductOffer:", error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

// In your route handler
const removeProductOffer = async (req, res) => {
    try {
        console.log('hello')
        const { productId } = req.body;
        console.log("Received request to remove offer with productId:", productId); // Step 1: Log incoming productId

        // Fetch the product
        const product = await Product.findById(productId);
        if (!product) {
            console.log("Product not found for productId:", productId); // Step 2: Log if product is not found
            return res.json({ status: false, message: "Product not found" });
        }

        // Check if an offer exists
        const offerPercentage = product.productOffer;
        if (offerPercentage === 0) {
            console.log("No offer applied to this product"); // Step 3: Log if there's no offer to remove
            return res.json({ status: false, message: "No offer applied to this product" });
        }

        // Calculate the original price and remove offer
        product.salePrice = product.salePrice / (1 - offerPercentage / 100);
        console.log("Recalculated sale price to original:", product.salePrice); // Step 4: Log recalculated price
        product.productOffer = 0;

        // Save updated product
        await product.save();
        console.log("Offer removed and product updated successfully"); // Step 5: Log success message
        res.json({ status: true });
    } catch (error) {
        console.error("Error in removing offer:", error); // Step 6: Log any errors encountered
        res.json({ status: false, message: 'Error occurred' });
    }
};


const blockProduct =async (req,res) => {
    try {
        let id =req.query.id
        await Product.updateOne({_id:id},{$set:{isBlocked:true}})
        res.redirect('/admin/products')
    } catch (error) {
        res.redirect('/admin/pageNotFound')
    }
}

const unblockProduct =async (req,res) =>{
    try {
        let id =req.query.id
        await Product.updateOne({_id:id},{$set:{isBlocked:false}})
        res.redirect('/admin/products')
    } catch (error) {
        res.redirect('/admin/pageNotFound')
        
    }
}
const getEditProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const product = await Product.findOne({ _id: id });
        const category = await Category.find({});
        const brand = await Brand.find({});
        res.render('edit-product', {
            product: product,
            cat: category,
            brand: brand
        });
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/pageNotFound');
    }
};

const editProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        console.log('id:',id)

        const existingProduct = await Product.findOne({
            productName: data.productName,
            _id: { $ne: id }
        });

        if (existingProduct) {
            console.log('it is alreay exist')
            return res.status(400).json({ error: "Product with this name already exists" });
        }

        const images = [];
        if (req.files?.length > 0) {
            req.files.forEach(file => images.push(file.filename));
        }

        const updateFields = {
            productName: data.productName,
            description: data.descriptionData,
            brand: data.brand,
            category: data.category,
            regularPrice: data.regularPrice,
            //size: data.size,
            color: data.color,
        };
        console.log("data \n",data)

        console.log("updateFiels \n",updateFields)

        if (images.length > 0) {
            updateFields.$push = { productImage: { $each: images } };
        }

        await Product.findByIdAndUpdate(id, updateFields, { new: true });

        res.redirect('/admin/products');
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/admin/pageNotFound');
    }
};

const deleteSingleImage = async (req, res) => {
    try {
        const { imageNameToServer, productIdToServer } = req.body;
        const imagePath = path.join('public', 'uploads', 're-image', imageNameToServer);

        if (fs.existsSync(imagePath)) {
            await fs.promises.unlink(imagePath);
            console.log(`Image ${imageNameToServer} deleted successfully`);
        } else {
            console.log('Image not found');
        }

        res.send({ status: true });
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/admin/pageNotFound');
    }
};

module.exports = {
    getProductAddpage,
    addProducts,
    getAllProducts,
    addProductOffer,
    removeProductOffer,
    blockProduct,
    unblockProduct,
    getEditProduct,
    editProduct,
    deleteSingleImage,
};
