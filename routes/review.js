const express = require("express");
const router = express.Router({ mergeParams: true });
const reviewController = require("../controllers/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateReview } = require("../middleware.js"); // ✅ fixed import

// ── Routes ──
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));
router.delete("/:reviewId", isLoggedIn, wrapAsync(reviewController.destroyReview));

module.exports = router;