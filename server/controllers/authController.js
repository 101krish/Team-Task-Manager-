import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  teamId: user.teamId,
  hasCompletedSetup: user.hasCompletedSetup
});

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      return res.status(400).json({ success: false, message: "Name must be at least 2 characters long" });
    }

    if (!validateEmail(trimmedEmail)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email is already registered" });
    }

    // Don't auto-assign role - user will choose during setup
    const user = await User.create({ name: trimmedName, email: trimmedEmail, password, role: null, hasCompletedSetup: false });
    const token = signToken(user._id);

    res.status(201).json({ success: true, data: { user: userPayload(user), token } });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!validateEmail(trimmedEmail)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    const user = await User.findOne({ email: trimmedEmail }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken(user._id);
    res.json({ success: true, data: { user: userPayload(user), token } });
  } catch (error) {
    next(error);
  }
};
