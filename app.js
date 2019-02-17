const express = require("express");
const expressHandlebars = require("express-handlebars");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express(); //initialize the application

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

//Load idea model
require("./models/Idea");
const Idea = mongoose.model("ideas");

//handlebars MIddleware
app.engine("handlebars", expressHandlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
  res.locals.error = req.flash("error_msg");
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

//add idea form
app.get("/ideas/add", (req, res) => {
  res.render("ideas/add");
});

//edit idea form
app.get("/ideas/edit/:id", (req, res) => {
  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    res.render("ideas/edit", {
      idea: idea
    });
  });
});

//edit form process
app.put("/ideas/:id", (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
    .then(idea => {
      idea.title = req.body.title;
      idea.details = req.body.details;

      idea.save().then(idea => {
        req.flash("success_msg", "Video idea updated");
        res.redirect("/ideas");
      });
    })
    .catch(err => {
      console.log(err);
    });
});

//delete idea
app.delete("/ideas/:id", (req, res) => {
  Idea.deleteOne({ _id: req.params.id }).then(() => {
    req.flash("success_msg", "Video idea removed");
    res.redirect("/ideas");
  });
});

//idea index page
app.get("/ideas", (req, res) => {
  Idea.find({})
    .sort({ date: "descending" })
    .then(ideas => {
      res.render("ideas/index", {
        ideas: ideas
      });
    });
});

//process form to add idea
app.post("/ideas", (req, res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push({ text: "Please add title" });
  }

  if (!req.body.details) {
    errors.push({ text: "Please add some details" });
  }

  if (errors.length > 0) {
    res.render("ideas/add", {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details
    };

    new Idea(newUser).save().then(idea => {
      req.flash("success_msg", "Video idea added");
      res.redirect("/ideas");
    });
  }
});
const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
