const controller = require("../controllers/quiz.controller");
const express = require("express");
const chalk = require("chalk");

module.exports = function (app) {
  app.use(function (err, req, res, next) {
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
    if (err) {
      res.status(400).json({ status: 400, error: "error while parsing data" });
      console.log(chalk.yellow(`⚠ Error while parsing data`));
    } else {
      next();
    }
  });

  app.use(express.json());
  app.post("/quiz/session/create", controller.createQuizSession);
};
