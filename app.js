const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const User = require("./models/user");
const ExpressError = require("./utils/ExpressError.js");
const { MongoStore } = require("connect-mongo");

const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user.js");
const bookingRoutes = require("./routes/booking.js");

const dburl = process.env.ATLASDB_URL;
const secret = process.env.SECRET || "wanderlust-secret";
const port = process.env.PORT || 3000;

// View engine setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
        return req.body._method;
    }
    if (req.query && "_method" in req.query) {
        return req.query._method;
    }
}));

// Session store
const store = MongoStore.create({
    mongoUrl: dburl,
    ttl: 7 * 24 * 60 * 60,
    autoRemove: "native",
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
    }
});

store.on("error", (err) => {
    console.error("❌ Session Store Error:", err.message);
});

const sessionOptions = {
    store,
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
};

app.use(session(sessionOptions));
app.use(flash());

// Passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Locals middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Request logger (dev only)
app.use((req, res, next) => {
    if (req.method === "POST" || req.method === "PUT") {
        const body = { ...req.body };
        if (body.password) body.password = "******";
        console.log("REQUEST:", req.method, req.url, body);
    }
    next();
});

// Routes
app.get("/", (req, res) => res.send("root server is working"));
app.use("/", userRoutes);
app.use("/listings", listingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);

// 404 handler
app.all("/{*splat}", (req, res, next) => next(new ExpressError(404, "Page not found!")));

// Error handler
app.use((err, req, res, next) => {
    console.error("FULL ERROR:", err);
    let { status = 500, message = "Something went wrong!" } = err;
    if (err.name === "CastError") message = "Invalid ID!";
    if (req.flash) req.flash("error", message);
    res.status(status).render("error", { status, message });
});

// Connect to DB then start server
async function main() {
    await mongoose.connect(dburl);
}

main()
    .then(() => {
        console.log("✅ MongoDB connected successfully");
        app.listen(port, () => console.log(`✅ App is listening on port ${port}`));
    })
    .catch(err => {
        console.error("❌ DB Connection Failed:", err.message);
        process.exit(1);
    });