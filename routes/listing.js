const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const listingController = require("../controllers/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn, validateListing } = require("../middleware.js");
const upload = require("../utils/multer.js");

// ── isOwner middleware ──
const isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) return next(new ExpressError(404, "Listing not found!"));
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// ── Routes ──
router.get("/", wrapAsync(listingController.index));
router.get("/new", isLoggedIn, listingController.renderNewForm);
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));
router.get("/:id", wrapAsync(listingController.showListing));

router.post("/", isLoggedIn, upload.single("image"), validateListing, wrapAsync(listingController.createListing));
router.put("/:id", isLoggedIn, isOwner, upload.single("image"), (req, res, next) => {
    console.log("AFTER MULTER BODY:", JSON.stringify(req.body));
    next();
}, validateListing, wrapAsync(listingController.updateListing));
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;