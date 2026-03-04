const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  // Author controls
  isActive: { type: Boolean, default: true }, 
  
  // Admin controls
  isApproved: { type: Boolean, default: false } 

}, { timestamps: true });

module.exports = mongoose.model("Blog", blogSchema);
