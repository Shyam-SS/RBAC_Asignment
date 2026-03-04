const express = require("express");
const Router = express.Router();
const Auth = require("../controllers/auth_Controller");

// Pages
Router.post("/register", Auth.userRegister);



Router.post("/verify-otp", Auth.verifyAccount);
Router.post("/resend-otp", Auth.resendOtp);


Router.post("/login", Auth.login);

Router.post('/reset-password-link',Auth.resetPasswordLink);
Router.post('/reset-password/:id/:token',Auth.resetPassword);



module.exports = Router;