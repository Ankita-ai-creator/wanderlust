const passport = require("passport");
const User = require("../models/User");

module.exports.renderRegisterForm = (req, res) => {
    res.render("users/register");
};

module.exports.register = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        if (e.name === "UserExistsError") {
            req.flash("error", "Account already exists! Please login instead.");
            return res.redirect("/login");
        }
        req.flash("error", e.message);
        res.redirect("/register");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};

module.exports.login = (req, res, next) => {
    const { username } = req.body;
    User.findOne({ username }).then(foundUser => {
        if (!foundUser) {
            req.flash("error", "Account does not exist! Please register first.");
            return res.redirect("/register");
        }
        // ✅ Fixed failureFlash format
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,  
        })(req, res, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome back!");
            let redirectUrl = res.locals.redirectUrl || "/listings";
            res.redirect(redirectUrl);
        });
    });
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "Logged out successfully!");
        res.redirect("/listings");
    });
};