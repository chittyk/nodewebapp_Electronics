/*const express =require('express')
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

app.use('/login', (req, res, next) => {
    if (req.session && req.session.user) {
        // If the user is already logged in, redirect to the dashboard or home page
        res.redirect('/'); // Adjust the route as needed
    } else {
        // If not logged in, allow access to the login page
        next();
    }
});


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
*/















const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const session = require('express-session');
const passport = require('./config/passport');  // Ensure this is correctly exported
const db = require('./config/db');
const path = require('path');

// Initialize the database connection
db();

// Middleware to avoid ngrok warning
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

// Middleware for JSON and URL encoding
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,  // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Cache control to avoid storing sensitive information in the cache
app.use((req, res, next) => {
    res.set('cache-control', 'no-store');
    next();
});

// Login redirection middleware
app.use('/login', (req, res, next) => {
    if (req.session && req.session.user) {
        res.redirect('/');  // Redirect to homepage if logged in
    } else {
        next();
    }
});

// Set up the view engine and static files
app.set('view engine', 'ejs');
app.set('views', [path.join(__dirname, 'views/user'), path.join(__dirname, 'views/admin')]);
app.use(express.static(path.join(__dirname, 'public')));

// Routing
const userRouter = require('./routes/userRouter.js');
const adminRouter = require('./routes/adminRouter.js');
app.use('/', userRouter);
app.use('/admin', adminRouter);

// Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server is running at http://localhost:${process.env.PORT}`);
});

module.exports = app;

