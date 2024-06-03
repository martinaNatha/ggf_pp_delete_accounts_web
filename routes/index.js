const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("auth/login",{layout: false});
  });
router.get("/resetaccount", (req, res) => {
    res.render("pages/resetaccount");
  });
router.get("/home", (req, res) => {
    res.render("home");
  });

  module.exports = router;