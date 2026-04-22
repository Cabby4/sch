const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({

  title: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required : true
  },

  completed: {
    type: Boolean,
    default: false
  },

  completedAt : {
    type : Date
  }
  
},

{timestamps: true});



module.exports = mongoose.model("Task", taskSchema);