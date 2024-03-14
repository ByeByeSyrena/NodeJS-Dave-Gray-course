const express = require("express");
const router = express.Router();
const path = require("path");
const data = {};
data.employees = require("../../data/employees.json");

router
  .route("/")
  .get((req, res) => {
    res.json(data.employees);
  })
  .post((req, res) => {
    req.json({ firstname: req.body.firstname, lastname: req.body.lastname });
  })
  .put((req, res) => {
    req.json({ firstname: req.body.firstname, lastname: req.body.lastname });
  })
  .delete((req, res) => {
    req.json({ firstname: req.body.id });
  });

router.route("/:id").get((req, res) => {
  res.json({ id: req.params.id });
});

module.exports = router;
