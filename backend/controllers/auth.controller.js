import asyncHandler from "express-async-handler";
import { signupValidator, User } from "../models/user.model.js";
import generateTokenAndSetCookie  from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

export const signup = asyncHandler(async (req, res) => {
  const { error } = signupValidator(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { fullName, username, password, confirmPassword, gender } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords not matching" });
  }

  const user = await User.findOne({ username });
  if (user) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
  const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

  const newUser = new User({
    fullName,
    username,
    password,
    gender,
    profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
  });

  if (newUser) {
    generateTokenAndSetCookie(newUser._id, res);

    await newUser.save();

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      profilePic: newUser.profilePic,
    });
  } else {
    return res.status(400).json({ error: "Invalid user data" });
  }
});

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  const isMatchPsw = await bcrypt.compare(password, user.password);

  if (!user || !isMatchPsw) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  generateTokenAndSetCookie(user._id, res);

  res.status(200).json({
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    profilePic: user.profilePic,
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "Logout successful" });
});
