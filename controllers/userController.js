const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Registering A New User
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All Fields Are Mandatory!");
  }

  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("This User Is Already Registered!");
  }

  //   HASH PASSWORD
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Hashed Password : ", hashedPassword);
  //   END OF HASHED PASSWORD

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });
  console.log(`New User created ${user}`);
  if (user) {
    res.status(200).json({ _id: user.id, email: user.email });
  } else {
    res.status(400);
    throw new Error("User Data Is Invalid");
  }
  res.json({ message: "Register the User" });
});
// END OF NEW USER

// LOGINNG IN AN EXISITING USER
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    // PAYLOAD
    const accessToken = jwt.sign(
      {
        user: {
          username: user.username,
          email: user.email,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30m" }
    );
    // END OF PAYLOAD
    res.status(200).json({ accessToken });
  } else {
    res.status(401);
    throw new Error("Email or password is not valid");
  }
});

// END OF LOGGING IN AN EXISTING USER

const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = { registerUser, loginUser, currentUser };
