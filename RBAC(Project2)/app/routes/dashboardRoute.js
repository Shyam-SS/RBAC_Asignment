const express = require("express");
const Router = express.Router();
const CheckAuth = require("../middlewares/AuthChecker");
const Auth = require("../controllers/auth_Controller");

Router.get("/user/dashboard", 
    CheckAuth,
      Auth.AuthUserCheck,
 Auth.dashboard);

Router.get("/admin/dashboard",
   
    CheckAuth,
      Auth.AuthUserCheck,
      Auth.adminDashboard);


Router.get("/author/dashboard", 
    CheckAuth,
    Auth.AuthUserCheck,
     Auth.authorDashboard);

module.exports = Router;