const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const cloudinary = require("../utils/cloudinary.js");

module.exports.index = async (req, res) => {
    let { category, q } = req.query;
    let filter = {};

    if (category && category !== "") {
        filter.category = new RegExp(`^${category}$`, "i");
    }

    if (q && q.trim() !== "") {
        filter.$and = [{
            $or: [
                { title:    new RegExp(q.trim(), "i") },
                { location: new RegExp(q.trim(), "i") },
                { country:  new RegExp(q.trim(), "i") },
            ]
        }];
    }

    let allListings = await Listing.find(filter);
    res.render("listings/index", { allListings, currentFilters: req.query });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

module.exports.renderEditForm = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) return next(new ExpressError(404, "Listing not found!"));
    res.render("listings/edit", { listing });
};

module.exports.showListing = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews").populate("owner");
    if (!listing) return next(new ExpressError(404, "Listing not found!"));
    res.render("listings/show", { listing });
};

module.exports.createListing = async (req, res) => {
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await newListing.save();
    req.flash("success", "Listing created successfully!");
    res.redirect("/listings");
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let updatedData = req.body.listing;

    if (req.file) {
        let oldListing = await Listing.findById(id);
        if (oldListing.image && oldListing.image.filename) {
            await cloudinary.uploader.destroy(oldListing.image.filename);
        }
        updatedData.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await Listing.findByIdAndUpdate(id, updatedData);
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (listing.image && listing.image.filename) {
        await cloudinary.uploader.destroy(listing.image.filename);
    }

    // ✅ removed duplicate Review.deleteMany — model hook handles it
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
};