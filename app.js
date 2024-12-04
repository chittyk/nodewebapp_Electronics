const express =require('express')
const app= express()
const env =require('dotenv').config()
const session =require('express-session')

const passport =require('./config/passport')

const db =require('./config/db')
db()

const path=require('path')
const exp = require('constants')

const userRouter=require('./routes/userRouter.js')
const adminRouter=require('./routes/adminRouter.js')
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        secure:false,
        httpOnly:true,
        maxAge:72*60*60*1000
    }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use((req,res,next)=>{
    res.set('cache-control','no-store')
    next()
})


//seting viewengineb

app.set('view engine','ejs')
app.set('views',[path.join(__dirname,'views/user'),path.join(__dirname,'views/admin')])
app.use(express.static(path.join(__dirname, 'public')));

app.use('/',userRouter)
app.use('/admin',adminRouter)



app.listen(process.env.PORT,()=>{
    console.log(`sever is running, http://localhost:${process.env.PORT}`)
})

module.exports=app