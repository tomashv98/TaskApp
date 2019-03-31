const jwt = require("jsonwebtoken");
const User = require("../models/user")

/* Everytime an user signs in or signs up a special token is generated and
 is stored in an array of tokens in user profile. 
 Everytime auth is called, it reads the token, verifies it using secret key.
and find the user using _id and token number.

Req.token and req.user is attach to every request Object
*/



const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.AUTH_KEY)
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token
    });
    if (!user) {
      throw new Error()
    }
    req.user = user;
    req.token = token;
    next()
  } catch (e) {
    res.status(401).send({
      error: "Please authenticate"
    })
  }
};
module.exports = auth;