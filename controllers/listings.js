const Listing=require("../models/listing.js");


module.exports.index=async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};


module.exports.renderNewForm=(req, res) => {
    // console.log(req.user);
    res.render("listings/new.ejs");
};

module.exports.showListing=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path:"reviews",populate:{path:"author"}})
    .populate("owner");
    
    if (!listing){
        req.flash("error", " Listing you requested for does not exist ! ");
        res.redirect("/listings");
        return;
    }
    // console.log(listing);
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing=async (req, res,next) => {
    let url=req.file.path;
    let filename=req.file.filename;
    
    const newListing = new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success", " New listing added successfully");
    res.redirect("/listings");
};

module.exports.renderEditForm=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing){
        req.flash("error", " Listing you requested for does not exist ! ");
        res.redirect("/listings");
        return;
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");

    res.render("listings/edit.ejs", { listing ,originalImageUrl });
};

module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
    let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
    if ( typeof req.file !== "undefined"){   // when user have given new file 
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }
    req.flash("success", " Listing Updated successfully");
    res.redirect(`/listings/${id}`);  
};

module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    // console.log(deletedListing);
    req.flash("success", "Listing Deleted successfully");
    res.redirect("/listings");
};

