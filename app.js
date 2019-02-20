const express = require("express");
const path = require("path");
const expressHandlebars = require("express-handlebars");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express(); //initialize the application

//Load routers
const ideas = require("./routes/ideas");
const users = require("./routes/users");

//connect to mongoose
mongoose
  .connect("mongodb://localhost/vidjot-db", {
    useNewUrlParser: true
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch(err => {
    console.log(err);
  });

//handlebars MIddleware
app.engine("handlebars", expressHandlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//static folder
app.use(express.static(path.join(__dirname, "public")));

//method override middleware
app.use(methodOverride("_method"));

//express session middleware
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

//flash middleware
app.use(flash());

//global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//index routea
app.get("/", (req, res) => {
  const title = "Welcome";

  res.render("index", {
    title: title
  });
});

//about route
app.get("/about", (req, res) => {
  res.render("about");
});

// Use routes
app.use("/ideas", ideas);
app.use("/users", users);

const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
