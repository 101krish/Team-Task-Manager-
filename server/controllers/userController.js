import User from "../models/User.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("name email role").sort({ name: 1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};
