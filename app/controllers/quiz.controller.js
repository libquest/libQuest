const chalk = require("chalk");

function generateJoinCode(n) {
  var add = 1,
    max = 12 - add;
  if (n > max) {
    return generate(max) + generate(n - max);
  }
  max = Math.pow(10, n + add);
  var min = max / 10;
  var number = Math.floor(Math.random() * (max - min + 1)) + min;
  return ("" + number).substring(add);
}

exports.createQuizSession = (req, res) => {
  require("crypto").randomBytes(20, function (err, buffer) {
    if (req.body.id == null) {
      res.status(400).json({ status: 400, message: { error: "session cannot be null" } });
      console.log(console_time_stamp, chalk.red(`✖ Requested null quiz ID.`));
    } else {
      const manager_key = buffer.toString("hex");
      const join_code = generateJoinCode(7);
      getBigPack(req.body.id)
        .then(function (pack) {
          const session = {
            join_code: join_code,
            big_pack: JSON.parse(pack),
            users: {},
            started: false,
            availability: false,
            question_index: 0,
            responses: {},
            globalping: "",
          };
          quiz_sessions.push(session);
          res.status(200).json({ manager_key: manager_key, session: session });
          console.log(console_time_stamp, chalk.green(`✔ Started new quiz session`));
          console.log(console_time_stamp, chalk.cyan(`ℹ The join code is ${join_code}`));
        })
        .catch(function (err) {
          res.status(400).json({ status: 400, message: { error: "cannot find session", id: req.body.id } });
          console.log(console_time_stamp, chalk.red(`✖ Requested invalid quiz ID.`));
        });
    }
  });
};

exports.getQuizSession = (req, res) => {
  if (req.params.id == null) {
    console.log(req.params.id);
    res.status(400).json({ status: 400, message: { error: "session cannot be null" } });
    console.log(console_time_stamp, chalk.red(`✖ Requested null quiz ID.`));
  } else {
    if (Array.isArray(quiz_sessions) && quiz_sessions.length) {
      var data = quiz_sessions.find((i) => i.join_code === req.params.id);
      if (data == undefined) {
        res.status(400).json({ status: 400, message: { error: "cannot find session", join_code: req.params.id } });
        console.log(console_time_stamp, chalk.red(`✖ Requested invalid session ID.`));
      } else {
        res.status(200).json(data);
        console.log(console_time_stamp, chalk.green(`✔ Connected with join code (${req.params.id})`));
      }
    } else {
      res.status(400).json({ status: 400, message: { error: "cannot find session", join_code: req.params.id } });
      console.log(console_time_stamp, chalk.red(`✖ Requested invalid session ID.`));
    }
  }
};
