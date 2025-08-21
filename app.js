if (process.env.NODE_ENV !="production"){
  require('dotenv').config();
}



//============================================================================   Import Dependencies   ============================================================================  



const express= require("express");
const app= express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session")
const MongoStore=require("connect-mongo");
const flash= require("connect-flash");
const passport= require("passport");
const LocalStrategy = require("passport-local");
const ejsMate = require("ejs-mate");
const { nextTick } = require("process");

const ExpressError=require("./utils/ExpressError.js");
const User= require("./models/user.js");

const listingsRouter= require("./routes/listing.js");
const reviewRouter= require("./routes/review.js");
const userRouter=require("./routes/user.js");



// ============================================================================  Database Connection  ============================================================================  



const dbUrl=process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
}
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });



//  ============================================================================  App Configuration  ============================================================================  



app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.engine('ejs',ejsMate);

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"/public")));



// ============================================================================  Session Store Configuration  ============================================================================  



const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret:process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error",()=>{
  console.log(" ❌ ERROR in MONGO SESSION STORE",err);
});


const sessionOption = {
  store,
  secret:process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,   
    maxAge: 7 * 24 * 60 * 60 * 1000,             // 7 days
    httpOnly:true
  }
};

app.use(session(sessionOption));
app.use(flash());



// ============================================================================ Passport Authentication ============================================================================  



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());






// middleware for  flash
app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
})



// ============================================================================  Routes   ============================================================================  



//  Listings Routes 

app.get("/", (req, res) => {
  res.render("listings/home.ejs");
});

app.use("/listings",listingsRouter);



//  Review Routes 
app.use("/listings/:id/reviews",reviewRouter);

app.use("/",userRouter);



//  ============================================================================  Error handler   ============================================================================  



// for a route that is not defined
app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});


//  General error handler
app.use((err,req,res,next)=>{
  let {statusCode=500,message="something went wrong "}=err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs",{err});
})




app.listen( 8080, ()=>{
    console.log("🚀 Server running on http://localhost:8080/listings");
});
