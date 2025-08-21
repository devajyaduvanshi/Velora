const express= require("express");
const router = express.Router();
const User=require("../models/user.js");
const wrapAsync=require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const UserController=require("../controllers/users.js");


//                                  Signup
router.route("/signup")
    .get(UserController.renderSignupForm)
    .post( wrapAsync(UserController.signup));




//                                         Login
router.route("/login")
  .get(UserController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    // ✅ Reaches here only after successful authentication
    wrapAsync(UserController.login)
  );




//                                       Logout
router.get("/logout",UserController.logout);


module.exports=router;
