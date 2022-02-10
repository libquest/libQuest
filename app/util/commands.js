const stringSimilarity = require("string-similarity");
const dbConfig = require("../config/db.config");
const { spawn } = require("child_process");
const readline = require("readline");
const chalk = require("chalk");
const util = require("util");
const os = require("os");

const commands = ["get_users", "get_sessions", "get_quizzes", "db_info*", "get_quiz_session [join_code]", "clear", "help", "exit", "quit"];

function prompt() {
  return new Promise(function (resolve, reject) {
    let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });
    rl.setPrompt("libQuest> ");
    rl.prompt();
    rl.on("line", function (line) {
      function commandHandler(n) {
        return line.split(" ")[0] === commands[n].split(" ")[0] && commands[n].split(" ")[0].slice(-1) !== "*";
      }
      if (line === "exit" || line === "quit" || line == "q") {
        rl.close();
        console.log(chalk.green("\nlibquest terminated cleanly."));
        process.exit();
      } else if (line === "help" || line === "?") {
        console.log(
          `libQuest, version 1.0.5-prerelease (${
            os.platform() + os.release()
          })\nThese commands are defined internally. Type 'help' to see this list.` +
            `\n\nA star (*) next to a name means that the command is disabled. \n\n` +
            commands
              .map((item) => `  ${item}`)
              .slice(0, -2)
              .join("\n") +
            "\n  exit|quit"
        );
      } else if (commandHandler(0)) {
        getUserCount().then(function (user_count) {
          console.log(`Registered users: ${user_count}`);
        });
      } else if (commandHandler(3)) {
        console.log(
          `connected to: mongodb+srv://${dbConfig.USERNAME}:${dbConfig.PASSWORD}@${dbConfig.HOST}/${dbConfig.DB}?retryWrites=true&w=majority`
        );
      } else if (commandHandler(1)) {
        console.log(`Current sessions: 0`);
      } else if (commandHandler(2)) {
        getQuizCount().then(function (quiz_count) {
          console.log(`Created quizzes: ${quiz_count}`);
        });
      } else if (commandHandler(4)) {
        var data = quiz_sessions.find((i) => i.join_code === line.split(" ").pop());
        console.log(util.inspect(data, false, null, true));
      } else if (commandHandler(5)) {
        console.clear();
      } else if (line.trim() === "") {
      } else {
        if (line.length < 20) {
          const matches = stringSimilarity.findBestMatch(line.trim(), commands);
          if (matches.bestMatch.rating == 0) {
            console.log(`Unknown command '${line}'`);
          } else {
            if (matches.bestMatch.target[matches.bestMatch.target.length - 1] === "*") {
              console.log(`Unknown command '${line}'`);
            } else {
              console.log(`Command '${line}' not found, did you mean: ` + matches.bestMatch.target.split(" ")[0] + "?");
            }
          }
        }
      }
      setTimeout(function () {
        rl.prompt();
      }, 100);
    }).on("close", function () {
      rl.close();
      console.log(chalk.green("\nlibquest terminated cleanly."));
      process.exit();
    });
  });
}

module.exports = {
  stdin: prompt,
};
