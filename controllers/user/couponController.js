const Coupon = require('../../models/couponSchema')

const checkCoupon = async (req,res) => {

    try {
        const { code } = req.body;
        const userid = req.session.user._id
        console.log(req.session) 

        console.log('1',code,typeof(code))
        const coupon = await Coupon.findOne({ name: code });
        console.log('2',coupon)
        if(!coupon){
            console.log('3')
            return res.status(404).json({ message: 'Coupon not found',success:false })
        }
        if(coupon.expireOn < new Date()){
            console.log('4')

            return res.status(404).json({ message: 'Coupon expired',success:false })
        }
        if(coupon.UserId.length>0){
            console.log('5')

            return res.status(404).json({ message: 'Already used Coupon code',success:false })
        }
        console.log('6')

        coupon.UserId.push(userid)
        coupon.isList=false
        await coupon.save()

return res.status(200).json({ message: 'Coupon applied successfully', success: true })        

    } catch (error) {
        
    }
}


module.exports ={
    checkCoupon,
}