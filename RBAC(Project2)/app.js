require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const DbConnection = require("./app/config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");


DbConnection();



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(
  session({
    secret: process.env.JWT_SECRET_KEY || "mysecret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);


app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.user = req.session.user || null;
  next();
});



app.set("view engine", "ejs");
app.set("views", "view");


app.use(express.static(path.join(__dirname, "public")));



app.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const role = req.session.user.role;

  if (role === "admin") return res.redirect("/admin/dashboard");
  if (role === "author") return res.redirect("/author/dashboard");
  if (role === "user") return res.redirect("/user/dashboard");

  return res.redirect("/login");
});


app.use("/", require("./app/routes/authRoutes"));
app.use("/", require("./app/routes/dashboardRoute"));

app.use("/blogs", require("./app/routes/blog_Route"));




const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});