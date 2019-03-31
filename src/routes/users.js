const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth")
const multer = require("multer");
const sharp = require("sharp");
const {
  sendWelcome,
  sendFarewell
} = require("../emails/account")


// Read all users
router.get("/me", auth, async (req, res) => {
  try {
    const users = await User.find({})
    res.send(users)
    console.log(req.token)
  } catch (e) {
    res.status(500).send(e)
  }
});

// Create User
router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    sendWelcome(user.email, user.name)
    const token = await user.generateToken();
    res.status(201).send({
      user,
      token
    })
  } catch (e) {
    res.status(500).send(e)
  }
});
// Read user
router.get('/:id', async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (e) {
    res.status(500).send();
  }

});

//Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateToken()
    res.send({
      user,
      token
    });
  } catch (e) {
    res.status(400).send();
    console.log(e)

  }
})

//Logout
router.post("/logout", auth, async (req, res) => {
  try {
    // Grab array of current user's tokens
    req.user.tokens = req.user.tokens.filter((token) => {
      // Filter to returns array of tokens not containing current session's token
      return token.token !== req.token
    })
    // Save the user profile
    await req.user.save()
    res.send(`${req.user.name} logged out`)

  } catch (e) {
    res.status(500).send()
  }
});

//Logout All
router.post("/logoutall", auth, async (req, res) => {
  try {
    // Grab array of current user's tokens
    req.user.tokens = []
    await req.user.save()
    res.send("Token array emptied")

  } catch (e) {
    res.status(500).send()
  }
});


//Update user
router.patch("/me", auth, async (req, res) => {
  const allowedUpdates = ["name", "email", "password"];
  // Object.keys returns array of Object's names
  const updates = Object.keys(req.body);
  // Check each key name is allowed
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  if (!isValidOperation) {
    return res.status(400).send({
      error: "Invalid updates"
    })
  }
  try {

    updates.forEach(update => req.user[update] = req.body[update])
    await req.user.save()
    /*const user = await User.findByIdAndUpdate(_id, req.body, {
      new: true,
      runValidators: true
    });*/
    if (!req.user) {
      return res.status(404).send()
    }
    res.send(req.user)
  } catch (e) {
    res.status(400).send(e)
    console.log(e)
  }
})

//Delete user
router.delete("/me", auth, async (req, res) => {
  try {
    await req.user.remove()
    res.send(`${req.user.name} removed`)
    sendFarewell(req.user.email, req.user.name)
  } catch (e) {
    res.status(400).send(e)
    console.log(e)
  }
});

// Set up params for avatar upload
const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"))
    }
    cb(undefined, true)
  }
})

// Upload avatar
router.post("/me/avatar", auth, upload.single("avatar"), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({
      width: 250,
      height: 250
    }).png().toBuffer()
    req.user.avatar = buffer;
    await req.user.save()
    res.status(200).send()
  },
  // Error handling callback
  (err, req, res, next) => {
    res.status(400).send({
      err: err.message
    })
  })

router.get("/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avatar) {
      throw new Error()
    }
    // Content type was automatically json 
    res.set("Content-Type", "image/png");
    res.send(user.avatar)
  } catch (e) {
    res.status(404).send()
  }
})


// Delete avatar
router.delete("/me/avatar", auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save()
    res.status(200).send()
  },
  // Error handling callback
  (err, req, res, next) => {
    res.status(400).send({
      err: err.message
    })
  })

module.exports = router;