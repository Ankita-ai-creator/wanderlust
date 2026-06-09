const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.js");
const { isLoggedIn } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");

router.get("/my", isLoggedIn, wrapAsync(bookingController.myBookings));
router.get("/owner", isLoggedIn, wrapAsync(bookingController.ownerBookings));
router.post("/:bookingId/status", isLoggedIn, wrapAsync(bookingController.updateBookingStatus));
router.get("/:id/new", isLoggedIn, wrapAsync(bookingController.renderBookingForm));
router.post("/:id", isLoggedIn, wrapAsync(bookingController.createBooking));

module.exports = router;