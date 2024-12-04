const User = require('../../models/userSchema');
const Product = require('../../models/productSchema')


const getWishlist=async (req,res) => {
    try {
        const userId =req.session.user
        const user = await User.findOne({_id:userId})

        const products = await Product.find({_id:{$in:user.wishlist}}).populate('category')
        res.render('wishlist',{
            userData: req.session.userData,
            products:products,
            userData:user
        })
    } catch (error) {
        res.redirect('/pageNotFound')
    }
}


const addToWishlist =async (req,res) => {
    try {
        
        console.log('hello')
        const productId = req.body.productId
        const userId =req.session.user
        const user = await User.findOne({_id:userId})
        // console.log('req.body.productId:',req.body.productId)
        // console.log('productId',productId)
        // console.log('reqsessionuser',req.session.user)
        console.log('userId',userId)
        console.log('user',user)
        if(user.wishlist.includes(productId)){
            console.log('1')
            return res.status(200).json({status:false,message:"product is already in wish list"})
        }
        console.log('user 1',user)
        user.wishlist.push(productId)
        await user.save()
        console.log('user 2',user)
        return res.status(200).json({status:true,message:'Product is add to wishlist'})
    } catch (error) {
        console.error('error in adding wishlist',error)
        return res.status(500).json({status:false,message:'error in server'})
        
    }
}

const removeProduct = async (req,res) => {
    try {
        const productId =req.query.productId
        const userId =req.session.user
        const user = await User.findOne({_id:userId})
        const index = user.wishlist.indexOf(productId)
        user.wishlist.splice(index,1)
        await user.save()
        return res.redirect('/wishlist')
    } catch (error) {
        console.error('error in deleting wishlist ',error)
        return res.status(500).json({status:false,message:'Server-error'})
    }
}


module.exports ={
    getWishlist,
    addToWishlist,
    removeProduct
}