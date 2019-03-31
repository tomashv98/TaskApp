const validator = require("validator");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const Task = require("./task");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  age: {
    type: Number,
    validate(value) {
      if (value < 19) {
        throw new Error("Why the fuck you lyin?")
      }
    }
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Please enter a valid email")
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error(`Thats not a valid password`)
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer
  }
}, {
  timestamps: true
});

userSchema.virtual("tasks", {
  ref: "Task",
  // Local data associated with id
  localField: "_id",
  // Name of the field in Task model
  foreignField: "owner"
})

// Whenever we send a request JSON.stringify() is called
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar
  return userObject
};


userSchema.methods.generateToken = async function () {
  const user = this;
  const token = jwt.sign({
    _id: user.id.toString()
  }, process.env.AUTH_KEY);
  // array1.concat(array2) merge array, returns new array
  user.tokens = user.tokens.concat({
    token
  });
  await user.save()
  return token

};



userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({
    email
  })

  if (!user) {
    throw new Error('Unable to login')
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new Error('Unable to login')
  }

  return user
};

// Hash password before every user.save()
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
});

userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({
    owner: user._id
  })
  next();
})

const User = mongoose.model("User", userSchema);

module.exports = User;