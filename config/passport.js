// const passport = require("passport")

// const GoogleStrategy = require("passport-google-oauth20").Strategy
// const User=require('../models/userSchema')

// const env = require("dotenv").config()


// passport.use(new GoogleStrategy({
//     clientID:process.env.GOOGLE_CLIENT_ID,
//     clientSecret:process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL:'/auth/google/callback'
// },

// async (accessToken,refreshToken,profile,done)=>{
//     try {
//          let user=await User.findOne({googleId:profile.id})
//          if(user){
//             return done(null,user)
//          }else{
//             user = new User({
//                 name:profile.displayName,
//                 email:profile.email[0].value,
//                 googleId:profile.id
//             })
//             await user.save()
//             return done(null,user)
//          }
//     } catch (error) {
//         return done(error,null)
//     }
// }
// ))

// passport.serializeUser((user,done)=>{
//     done(null,user.id)
// })

// passport.deserializeUser((id,done)=>{
//     User.findById(id)
//     .then(user=>{
//         done(null,user)
//     })
//     .catch(error =>{
//         done(error,null)
//     })
// })


// module.exports=passport




const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require('../models/userSchema');
require("dotenv").config();  // Ensure dotenv is correctly configured at the top

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://ec2-15-207-30-166.ap-south-1.compute.amazonaws.com/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Find user based on Google ID
            let user = await User.findOne({ googleId: profile.id });
            if (user) {
                return done(null, user);  // User already exists, continue
            } else {
                // Create new user if it doesn't exist
                user = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,  // Access the email correctly
                    googleId: profile.id
                });
                await user.save();
                return done(null, user);
            }
        } catch (error) {
            console.error("Error in GoogleStrategy:", error);
            return done(error, null);
        }
    }
));

// Serialize user to store in session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session based on ID
passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user);
        })
        .catch(error => {
            console.error("Error in deserializeUser:", error);
            done(error, null);
        });
});

module.exports = passport;

