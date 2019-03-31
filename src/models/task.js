const mongoose = require("mongoose");
const validator = require("validator");

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  completion: {
    type: Boolean,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  }
}, {
  timestamps: true
});

/*
taskSchema.pre("save", async function () {
  console.log(`before saving task`)
  next()
})*/

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;