const Category = require('../../models/catagorySchema');
const Product = require('../../models/productSchema');

// Get category information with pagination
const categoryInfo = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;

    const categoryData = await Category.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCategories = await Category.countDocuments();
    const totalPages = Math.ceil(totalCategories / limit);

    res.render("category", { 
      cat: categoryData,
      currentPage: page,
      adminData: req.session.adminData,
      totalPages: totalPages,
      totalCategories: totalCategories
    });
  } catch (error) {
    console.error('Error in loading category', error);
    res.redirect("/error");
  }
};

// Add a new category
const addCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const existingCategory = await Category.findOne({ name: name.toLowerCase() });
    if (existingCategory) {
      return res.status(400).json({ status: false, message: "Category already exists" });
    }

    const newCategory = new Category({ name: name.toLowerCase(), description });
    await newCategory.save();
    return res.json({ status: true, message: "Category added successfully" });
  } catch (error) {
    console.error("Error in adding category", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

// Add an offer to a category
const addCategoryOffer = async (req, res) => {
  try {
    const percentage = parseInt(req.body.percentage);
    const categoryId = req.body.categoryId;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ status: false, message: "Category not found" });
    }

    const products = await Product.find({ category: category._id });
    const hasProductOffer = products.some((product) => product.productOffer > percentage);
    if (hasProductOffer) {
      return res.json({ status: false, message: "Category already has a higher product offer" });
    }

    await Category.updateOne({ _id: categoryId }, { $set: { categoryOffer: percentage } });

    for (const product of products) {
      product.productOffer = 0;
      product.salePrice = product.regularPrice;
      await product.save();
    }

    res.json({ status: true, message: "Category offer applied successfully" });
  } catch (error) {
    console.error("Error in adding category offer", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

const removeCategoryOffer =async (req,res) => {
  try {

    const categoryId=req.body.categoryId
    const category =await Category.findById(categoryId);

    if  (!category){
      return res.status(404).json({status:false, message:"Category not found"})
    }

    const percentage = category.categoryOfferr;
    const products = await Product.find({category:category._id})
    if(products.length > 0){
      for(const product of products){
        product.salePrice += Math.floor(product.regularPrice * (percentage/100))
        product.productOffer = 0
        await product.save()
      }
    }
    category.categoryOffer = 0 
    await category.save()
    res.json({status:true})
    
  } catch (error) {
    res.status(500).json({status:false , message: "Internal Server Error"})
  }
}

// List category
const getListCategory = async (req, res) => {
  try {
    console.log('hello')
    let id = req.query.id;
    let catdata =await Category.findOne({_id:id})
    console.log("id ",req.query.id)

    console.log("catdata :\n ",catdata)
    
    await Category.updateOne({ _id: id }, { $set: { isListed: false } });

    catdata =await Category.findOne({_id:id})
    console.log("catdata :\n ",catdata)

     return res.redirect("/admin/category");
  } catch (error) {
    console.log(error)
    return res.redirect("/pageNotFound");
  }
};

// Unlist category
const getUnListCategory = async (req, res) => {
  try {
    console.log('hello1')
    let id = req.query.id;
    let catdata =await Category.findOne({_id:id})
    console.log("id ",req.query.id)
    console.log("catdata :\n ",catdata)
    await Category.updateOne({ _id: id }, { $set: { isListed: true } });
    
    catdata =await Category.findOne({_id:id})
    console.log("catdata :\n ",catdata)
     return res.redirect('/admin/category');
  } catch (error) {
    console.log(error)
    return res.redirect('/pageNotFound');
  }
};


const getEditCategory = async (req,res) => {
  try {
    
    const id = req.query.id
    const category =await Category.findOne({_id:id})
    res.render('edit-category',{category:category})
  } catch (error) {
    res.render('404')
  }
  
}


const editCategory= async (req,res) => {
  try {
    const id =req.params.id
    const {categoryname,description}=req.body
    const existingCategory = await Category.findOne({name:categoryname})

    if(existingCategory){
      return res.status(400).json({error:"It already exist try another"})

    }

    const updateCategory =await Category.findByIdAndUpdate(id,{
      name:categoryname,
      description:description
    },{new:true})

    if(updateCategory){
      res.redirect('/admin/category')
    }else{
      res.status(404).json({error:"Category not found"})
    }

  } catch (error) {
    res.status(500).json({error:"Internal server error"})
  }
}


module.exports = {
  categoryInfo,
  addCategory,
  addCategoryOffer,
  removeCategoryOffer,
  getListCategory,
  getUnListCategory,
  getEditCategory,
  editCategory
};
