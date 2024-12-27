

const getAboutPage = async (req,res) => {
    try {
        res.render('about')
    } catch (error) {
        res.redirect("pageNotFound")
    }
}




module.exports={
    getAboutPage,
}