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
      res.status(400).json({ status: 400, error: "quiz ID cannot be null" });
      console.log(chalk.red(`  ✖ Requested null quiz ID.`));
    } else {
      const blank = "null";
      const token = buffer.toString("hex");
      const join_code = generateJoinCode(7);
      getBigPack(req.body.id).then(function (pack) {
        res.status(200).json({
          manager_key: token,
          session: {
            join_code: join_code,
            big_pack: JSON.parse(pack),
            users: {},
            started: false,
            availability: false,
            question_index: blank,
            responses: {},
            globalping: blank,
          },
        });
      });
      console.log(chalk.green(`  ✔ Started new quiz session (${req.body.id})`));
      console.log(chalk.cyan(`  ℹ The join code is ${join_code}`));
    }
  });
};
