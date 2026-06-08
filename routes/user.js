const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.js");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/register", userController.renderRegisterForm);
router.post("/register", userController.register);

router.get("/login", userController.renderLoginForm);
router.post("/login", saveRedirectUrl, userController.login);

router.get("/logout", userController.logout);

module.exports = router;