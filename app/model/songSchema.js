// Calling the "mongoose" package
const mongoose = require("mongoose");

// Creating a Schema for uploaded files
const songSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
    required: [true, "Uploaded file must have a name"],
  },
  fileName: {
    type: String,
    required: [true, "Uploaded file must have a filename"],
  },
  lyrics: {
    type: Array
  }
});

// Creating a Model from that Schema
const Song = mongoose.model("Song", songSchema);

// Exporting the Model to use it in app.js File.
module.exports = Song;