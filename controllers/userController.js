const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const profileModel = require("../models/profileModel"); // Add this

const registerUser = asyncHandler(async (req, res) => {
  const { username, phone, password } = req.body;
  if (!username || !phone || !password) {
    res.status(400);
    throw new Error("All fields are mandatory !");
  }
  const userAvailable = await User.findOne({ phone });
  if (userAvailable) {
    res.status(400);
    throw new Error("User already registered!");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Hashed Password: ", hashedPassword);
  const user = await User.create({
    username,
    phone,
    password: hashedPassword,
  });

  console.log(`User created ${user}`);
  if (user) {
    // Create profile automatically
    const profile = await profileModel.create({
      userId: user._id,
      firstName: username.split(' ')[0] || 'User', // Default firstName from username
      lastName: username.split(' ')[1] || 'Unknown', // Default lastName
    });
    console.log(`Profile created ${profile}`);
    res.status(201).json({ _id: user.id, phone: user.phone });
  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }
  // Remove this line as it’s unreachable: res.json({ message: "Register the user" });
});

const loginUser = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    res.status(400);
    throw new Error("All fields are mandatory !");
  }
  const user = await User.findOne({ phone });
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          username: user.username,
          phone: user.phone,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "60m" }
    );
    res.status(200).json({ access_token: accessToken });
  } else {
    res.status(401);
    throw new Error("Phone or password is not valid");
  }
});

const currentUser = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

module.exports = { registerUser, loginUser, currentUser };