const express= require("express");
const router = express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const {listingSchema,reviewSchema}=require("../schema.js");
const Listing=require("../models/listing.js");
const ExpressError=require("../utils/ExpressError.js");
const { isLoggedIn , isOwner  ,validateListing} = require("../middleware.js");

const ListingController=require("../controllers/listings.js");

const multer  = require('multer'); // to process image

const { storage }= require("../cloudConfig.js");
const upload = multer({storage});


// Index route
router.route("/")
    .get(wrapAsync(ListingController.index))
    
    .post(
        isLoggedIn ,
        upload.single("listing[image]"),
        validateListing, 
        wrapAsync(ListingController.createListing)
    );
    // .post(upload.single('listing[image]'),(req,res)=>{
    //     res.send(req.file);
    // })


// New route 
router.get("/new", isLoggedIn , ListingController.renderNewForm);


router.route("/:id")
    .get( wrapAsync(ListingController.showListing))
    .put( isLoggedIn ,isOwner ,upload.single("listing[image]"), validateListing , wrapAsync(ListingController.updateListing))
    .delete( isLoggedIn , isOwner , wrapAsync(ListingController.destroyListing));


//Edit Route
router.get("/:id/edit", isLoggedIn ,isOwner , wrapAsync(ListingController.renderEditForm));


module.exports=router;