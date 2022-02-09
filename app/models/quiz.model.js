const mongoose = require("mongoose");
const Quiz = mongoose.model("quizzes", new mongoose.Schema({ pack: String, _id: Object }), "quizzes");

global.getBigPack = async function getMap(id) {
  const quizMap = await Quiz.findById(id.toString());
  return quizMap.pack;
};

global.getQuizCount = async function getMap() {
  const quizMap = await Quiz.find().countDocuments();
  return quizMap;
};

module.exports = Quiz;
