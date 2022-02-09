const dbConfig = require("./app/config/db.config");
const prettyMilliseconds = require("pretty-ms");
const bodyParser = require("body-parser");
const { response } = require("express");
const rt = require("require-times")();
const osutils = require("os-utils");
const express = require("express");
const crypto = require("crypto");
const figlet = require("figlet");
const https = require("https");
const chalk = require("chalk");
const hasha = require("hasha");
const http = require("http");
const cors = require("cors");
const app = express();

String.prototype.replaceAt = function (index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
rt.start();
console.time(chalk.green("  ✔ App ready in"));
var corsOptions = {
  origin: ["https://libquest.xyz", "https://play.libquest.xyz"],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./app/models");
const Role = db.role;

function loadingAnimation(text = "Loading libQuest API daemon…", chars = ["⠙", "⠘", "⠰", "⠴", "⠤", "⠦", "⠆", "⠃", "⠋", "⠉"], delay = 100) {
  let x = 0;

  return setInterval(function () {
    process.stdout.write("\r" + chars[x++] + " " + text);
    x = x % chars.length;
  }, delay);
}

db.mongoose
  .connect(`mongodb+srv://${dbConfig.USERNAME}:${dbConfig.PASSWORD}@${dbConfig.HOST}/${dbConfig.DB}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(chalk.green(`  ✔ Successfully connected to MongoDB.`));
    initial();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

// root route
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => {
  var serverID = hasha(crypto.randomBytes(1), { algorithm: "md5" }).toString();
  res.send(`<html lang=en">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="theme-color" content="#000" />
    <link rel="stylesheet" href="public/main.css" />
    <title>403: FORBIDDEN</title>
    <div class="container">
      <main>
        <p class="devinfo-container">
          <span class="error-code"><strong>403</strong>: FORBIDDEN</span> <span class="devinfo-line">Code: <code>ACCESS_DENIED</code></span>
          <span class="devinfo-line">Uptime: <code>${prettyMilliseconds(osutils.sysUptime() * 1000)}</code></span>
          <span class="devinfo-line">ID: <code>${serverID.replaceAt(6, "-").replaceAt(20, "-")}</code></span>
        </p>
        <a href="#">
          <div class="note">Click here to learn more about this error.</div>
        </a>
      </main>
    </div>
  </html>
  `);
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/quiz.routes")(app);

// set port, run startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  figlet.text("libQuest", async function (err, data) {
    let loader = loadingAnimation();
    setTimeout(() => clearInterval(loader), 100);
    await delay(200);
    console.clear();
    version = console.log(`\n${data}\n`);
    console.log(chalk.blue(`╭──────────────────────────────────────────────────────╮`));
    console.log(
      chalk.blue(`│`),
      chalk.yellow(`ℹ  API Daemon v${require("./package.json").version} started.                       `),
      chalk.blue(`│`)
    );
    console.log(chalk.blue(`│`), chalk.yellow(`ℹ  MongoDB connected to ${dbConfig.HOST}  `), chalk.blue(`│`));
    console.log(chalk.blue(`╰──────────────────────────────────────────────────────╯\n`));
    console.log(chalk.green(`  ✔ Daemon is running on port`) + `: ${PORT}`);
    console.log(chalk.cyan(`  ℹ Network`) + `: https://api.libquest.xyz/`);
    console.log(chalk.cyan(`  ℹ Running date`) + `: ${new Date().toISOString()}`);
    console.log(chalk.cyan(`  ℹ System uptime`) + `: ${prettyMilliseconds(osutils.sysUptime() * 1000)}`);
    console.log(chalk.cyan(`  ℹ Memory:`) + ` ${readMem()}`);
    console.timeEnd(chalk.green("  ✔ App ready in"));
    getUserCount().then(function (user_count) {
      console.log(chalk.cyan(`  ℹ Registered users`) + `: ${user_count}`);
    });
    getQuizCount().then(function (user_count) {
      console.log(chalk.cyan(`  ℹ Created quizzes`) + `: ${user_count}\n`);
    });
  });
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "admin",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'admin' to roles collection");
      });
    }
  });
}

function readMem() {
  const mem = process.memoryUsage();
  const convert = { Kb: (n) => n / 1024, Mb: (n) => convert.Kb(n) / 1024 };
  const toHuman = (n, t) => `${convert[t](n).toFixed(2)}${t}`;
  return `Used ${toHuman(mem.heapUsed, "Mb")} of ${toHuman(mem.heapTotal, "Mb")} - RSS: ${toHuman(mem.rss, "Mb")}`;
}
rt.end();
