const express = require("express");
const router = new express.Router();
const Task = require("../models/task");
const auth = require("../middleware/auth")

// Read tasks
router.get("/", auth, async (req, res) => {
  try {
    const match = {};
    const sort = {};
    if (req.query.completion) {
      match.completion = req.query.completion === "true"
    }

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      // sort.createdBy = 1 or -1
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1
    }
    /*const tasks = await Task.find({
      owner: req.user._id
    });*/

    await req.user.populate({
      path: "tasks",
      match,
      //Only shows 2 results
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate()
    res.send(req.user.tasks);
  } catch (e) {
    res.status(400).send(e);
    console.log(e)
  }
});

//Create task
router.post("/", auth, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      owner: req.user._id
    });
    await task.save();
    console.log(task)
    res.send(task)
  } catch (e) {
    res.status(400).send(e)
  }
});
// Read task
router.get('/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id;
    // const task = await Task.findById(_id);
    // only owner of task can find task
    const task = await Task.findOne({
      _id,
      owner: req.user._id
    })
    if (!task) {
      return res.status(404).send();
    }
    res.send(task)
  } catch (e) {
    res.status(500).send();
  }
});
// Update task
router.patch("/:id", auth, async (req, res) => {
  const _id = req.params.id;
  const allowedUpdates = ["description", "completion"];
  // Object.keys returns array of Object's names
  const updates = Object.keys(req.body);
  // Check each key name is allowed
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({
      error: "Invalid updates"
    })
  }
  try {
    //const task = await Task.findById(_id);
    const task = await Task.findOne({
      _id,
      owner: req.user._id
    })
    /*const task = await Task.findByIdAndUpdate(_id, req.body, {
      new: true,
      runValidators: true
    });*/
    if (!task) {
      return res.status(404).send()
    }
    updates.forEach(update => task[update] = req.body[update]);
    await task.save()
    res.send(task)
  } catch (e) {
    res.status(400).send(e)
  }
});

// Delete task
router.delete("/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOneAndDelete({
      _id,
      owner: req.user._id
    });
    if (!task) {
      return res.status(404).send("Task not found")
    }
    res.send(`${task.description} removed`)
  } catch (e) {
    res.status(500).send(e)
  }
});

module.exports = router;