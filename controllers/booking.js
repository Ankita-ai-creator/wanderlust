const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");

// Show booking form
module.exports.renderBookingForm = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("bookings/new", { listing });
};

// Create booking after fake payment
module.exports.createBooking = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let { checkIn, checkOut, transactionId } = req.body;

    let days = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    let totalPrice = days * listing.price;

    let booking = new Booking({
        listing: id,
        user: req.user._id,
        checkIn,
        checkOut,
        totalPrice,
        transactionId,
        status: "pending"
    });

    await booking.save();
    req.flash("success", "Booking request sent! Waiting for owner approval.");
    res.redirect(`/listings/${id}`);
};

// My bookings page
module.exports.myBookings = async (req, res) => {
    let bookings = await Booking.find({ user: req.user._id }).populate("listing");
    res.render("bookings/my-bookings", { bookings });
};

// Owner - view booking requests
module.exports.ownerBookings = async (req, res) => {
    let listings = await Listing.find({ owner: req.user._id });
    let listingIds = listings.map(l => l._id);
    let bookings = await Booking.find({ listing: { $in: listingIds } })
        .populate("listing")
        .populate("user");
    res.render("bookings/owner-bookings", { bookings });
};

// Owner - approve/reject booking
module.exports.updateBookingStatus = async (req, res) => {
    let { bookingId } = req.params;
    let { status } = req.body;
    await Booking.findByIdAndUpdate(bookingId, { status });
    req.flash("success", `Booking ${status}!`);
    res.redirect("/bookings/owner");
};