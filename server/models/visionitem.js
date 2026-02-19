const mongoose = require("mongoose");

const visionSchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
  notes: String
});

module.exports = mongoose.model("VisionItem", visionSchema);
