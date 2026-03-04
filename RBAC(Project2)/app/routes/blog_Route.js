const express = require("express");
const Router = express.Router();
const blogController = require("../controllers/blog_controller");
const CheckAuth = require("../middlewares/AuthChecker");
const auth = require("../controllers/auth_Controller");
const authorize = require("../middlewares/roleMiddleware");

// PUBLIC ROUTES
Router.get("/", blogController.publicBlogs);
Router.get("/blog/:id", blogController.singleBlog);

// AUTHOR ROUTES


Router.post(
  "/author/create",
  CheckAuth,
  auth.AuthUserCheck,
  CheckAuth,
  authorize("author"),
  blogController.createBlog,
);

Router.get(
  "/author/edit/:id",
  CheckAuth,
  authorize("author"),
  blogController.editSingle,
);

Router.patch(
  "/author/update",
  CheckAuth,
  authorize("author"),
  blogController.updateBlog,
);

Router.delete(
  "/author/delete/:id",
  CheckAuth,
  authorize("author"),
  blogController.deleteBlog,
);

Router.get(
  "/author/toggle/:id",
  CheckAuth,
  authorize("author"),
  blogController.toggleActive,
);

// ADMIN ROUTES
Router.get(
  "/admin/blogs",
  CheckAuth,
  authorize("admin"),
  blogController.adminBlogs,
);

Router.patch(
  "/admin/approve/:id",
  CheckAuth,
  authorize("admin"),
  blogController.approveBlog,
);

Router.patch(
  "/admin/reject/:id",
  CheckAuth,
  authorize("admin"),
  blogController.rejectBlog,
);

module.exports = Router;
