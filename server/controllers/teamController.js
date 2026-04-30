import Team from "../models/Team.js";
import User from "../models/User.js";

// Generate 6-character invite code
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Create team (admin flow)
export const createTeam = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { teamName } = req.body;

    if (!teamName || !teamName.trim()) {
      return res.status(400).json({ success: false, message: "Team name is required" });
    }

    // Check if user already has a team
    const existingUser = await User.findById(userId);
    if (existingUser.teamId) {
      return res.status(400).json({ success: false, message: "User already belongs to a team" });
    }

    // Generate unique invite code
    let inviteCode;
    let isUnique = false;
    while (!isUnique) {
      inviteCode = generateInviteCode();
      const existing = await Team.findOne({ inviteCode });
      if (!existing) isUnique = true;
    }

    // Create team
    const team = await Team.create({
      name: teamName.trim(),
      owner: userId,
      inviteCode,
      members: [userId]
    });

    // Update user with role, teamId, and completion status
    await User.findByIdAndUpdate(userId, {
      role: "admin",
      teamId: team._id,
      hasCompletedSetup: true
    });

    res.status(201).json({
      success: true,
      data: {
        team: {
          id: team._id,
          name: team.name,
          inviteCode: team.inviteCode,
          owner: team.owner,
          members: team.members
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Join team (member flow)
export const joinTeam = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { inviteCode } = req.body;

    if (!inviteCode || !inviteCode.trim()) {
      return res.status(400).json({ success: false, message: "Invite code is required" });
    }

    const trimmedCode = inviteCode.trim().toUpperCase();

    // Check if user already has a team
    const existingUser = await User.findById(userId);
    if (existingUser.teamId) {
      return res.status(400).json({ success: false, message: "User already belongs to a team" });
    }

    // Find team by invite code
    const team = await Team.findOne({ inviteCode: trimmedCode });
    if (!team) {
      return res.status(404).json({ success: false, message: "Invalid invite code" });
    }

    // Check if user already in team
    if (team.members.includes(userId)) {
      return res.status(400).json({ success: false, message: "User already in this team" });
    }

    // Add user to team
    team.members.push(userId);
    await team.save();

    // Update user with role, teamId, and completion status
    await User.findByIdAndUpdate(userId, {
      role: "member",
      teamId: team._id,
      hasCompletedSetup: true
    });

    res.json({
      success: true,
      data: {
        team: {
          id: team._id,
          name: team.name,
          owner: team.owner,
          members: team.members
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get team details
export const getTeam = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user.teamId) {
      return res.status(404).json({ success: false, message: "User not part of any team" });
    }

    const team = await Team.findById(user.teamId).populate("owner members", "name email role");

    res.json({
      success: true,
      data: { team }
    });
  } catch (error) {
    next(error);
  }
};

// Get team members
export const getTeamMembers = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user.teamId) {
      return res.status(404).json({ success: false, message: "User not part of any team" });
    }

    const team = await Team.findById(user.teamId).populate("members", "name email role");

    res.json({
      success: true,
      data: { members: team.members }
    });
  } catch (error) {
    next(error);
  }
};

// Get invite code (admin only)
export const getInviteCode = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admins can view invite codes" });
    }

    if (!user.teamId) {
      return res.status(404).json({ success: false, message: "User not part of any team" });
    }

    const team = await Team.findById(user.teamId);

    res.json({
      success: true,
      data: { inviteCode: team.inviteCode }
    });
  } catch (error) {
    next(error);
  }
};
