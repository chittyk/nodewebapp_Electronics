
const Coupon = require('../../models/couponSchema')


const getCoupon = async (req, res) => {
    try {
        const findCoupons = await Coupon.find({})
        findCoupons.forEach(coupon => {
            if (coupon.expireOn < new Date()) {
                coupon.isList = false
            }else{
                coupon.isList=true
            }
        })
        await Coupon.bulkWrite(findCoupons.map(coupon => ({
            updateOne: {
                filter: { _id: coupon._id },
                update: { $set: { isList: coupon.isList } }
            }
        })))

        


        return res.render('coupon', { coupons: findCoupons })
    } catch (error) {
        res.redirect('/admin/pageNotFound')
    }
}


const createCoupon = async (req, res) => {
    try {
        const data = {
            couponName: req.body.couponName,
            startDate: new Date(req.body.startDate + "T00:00:00"),
            endDate: new Date(req.body.endDate + "T00:00:00"),
            offerPrice: parseInt(req.body.offerPrice),
            minimumPrice: parseInt(req.body.minimumPrice)
        }
        const newCoupon = new Coupon({
            name: data.couponName,
            createdOn: data.startDate,
            expireOn: data.endDate,
            offerPrice: data.offerPrice,
            minimumPrice: data.minimumPrice,
        })
        await newCoupon.save()
        return res.redirect('/admin/coupon')
    } catch (error) {
        res.redirect('/admin/pageNotFound')
    }
}

const editCoupon = async (req, res) => {
    try {
        const id = req.query.id
        const findCoupon = await Coupon.findOne({
            _id: id
        })
        res.render('edit-coupon', {
            findCoupon: findCoupon
        })
    } catch (error) {
        res.redirect('/admin/pageNotFound')
    }
}
const postEditCoupon = async (req, res) => {
    try {
        console.log('hello')
        console.log(req.body)
        const data = req.body

        const couponData = await Coupon.findOne({ _id: data.couponId })
        if (!couponData) {
            return res.status(404).json({ message: 'Coupon not found', success: false })
        }
        await Coupon.updateOne(
            {
                _id: data.couponId
            },
            {
                $set: {
                    name: data.couponName,
                    createdOn: new Date(data.startDate + "T00:00:00.000Z"),
                    expireOn: new Date(data.endDate + "T00:00:00.000Z"),
                    offerPrice: parseInt(data.offerPrice),
                    minimumPrice: parseInt(data.minimumPrice)
                }
            }
        )
        res.redirect('/admin/coupon')
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal Server Error', success: false })
    }
}

const deleteCoupon = async (req, res) => {
    try {
        console.log('hello')
        const id = req.query.id
        console.log('id:', id)
        const findCoupon = await Coupon.findOne({ _id: id })
        if (!findCoupon) {
            return res.status(404).json({ message: 'Coupon not found', success: false })
        }
        await Coupon.deleteOne({ _id: id })
        return res.status(200).json({ success: true, message: "it deleted successfully" })
    } catch (error) {
        console.log(error)

        res.status(500).json({ message: 'Internal Server Error', success: false })
    }

}



module.exports = {
    getCoupon,
    createCoupon,
    editCoupon,
    postEditCoupon,
    deleteCoupon
}