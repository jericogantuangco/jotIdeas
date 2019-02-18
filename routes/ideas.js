const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

//Load idea model
require("../models/Idea");
const Idea = mongoose.model("ideas");

//add idea form
router.get("/add", (req, res) => {
  res.render("ideas/add");
});

//edit idea form
router.get("/edit/:id", (req, res) => {
  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    res.render("ideas/edit", {
      idea: idea
    });
  });
});

//edit form process
router.put("/:id", (req, res) => {
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
router.delete("/:id", (req, res) => {
  Idea.deleteOne({ _id: req.params.id }).then(() => {
    req.flash("success_msg", "Video idea removed");
    res.redirect("/ideas");
  });
});

//idea index page
router.get("/", (req, res) => {
  Idea.find({})
    .sort({ date: "descending" })
    .then(ideas => {
      res.render("ideas/index", {
        ideas: ideas
      });
    });
});

//process form to add idea
router.post("/", (req, res) => {
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

module.exports = router;
