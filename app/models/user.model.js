const mongoose = require("mongoose");
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    isUser: String,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
  })
);

global.getUsername = async function getMap() {
  const userMap = await User.find({}, { _id: 0, username: 1 });
  console.log("INFO: getUsername async function.");
  return userMap;
};

global.getEmail = async function getMap() {
  const userMap = await User.find({}, { _id: 0, email: 1 });
  console.log("INFO: getEmail async function.");
  return userMap;
};

global.getID = async function getMap() {
  const userMap = await User.find({}, { _id: 1 });
  console.log("INFO: getID async function.");
  return userMap;
};

global.getRoles = async function getMap() {
  const userMap = await User.find({}, { _id: 0, roles: 1 });
  console.log("INFO: getRoles async function.");
  return userMap;
};

global.getUserJson = async function getMap() {
  const userMap = await User.find({});
  console.log("INFO: getUserJson async function.");
  return userMap;
};

global.getAdmin = async function getMap() {
  const userMap = await User.find({}, { _id: 0, isAdmin: 1 });
  console.log("INFO: getAdmin async function.");
  return userMap;
};

global.getUser = async function getMap() {
  const userMap = await User.find({}, { _id: 0, isUser: 1 });
  console.log("INFO: getUser async function.");
  return userMap;
};

global.getUserCount = async function getMap() {
  const userMap = await User.find().countDocuments();
  return userMap;
};

module.exports = User;
