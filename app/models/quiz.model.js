const mongoose = require("mongoose");
const Quiz = mongoose.model("quizzes", new mongoose.Schema({ pack: String, _id: Object }), "quizzes");

global.getBigPack = async function getMap(id) {
  const data = await Quiz.findOne({ _id: id.toString() });
  return data.pack.toString();
};

global.getQuizCount = async function getMap() {
  const data = await Quiz.find().countDocuments();
  return data;
};

module.exports = Quiz;
