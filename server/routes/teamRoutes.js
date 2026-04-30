import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createTeam,
  joinTeam,
  getTeam,
  getTeamMembers,
  getInviteCode
} from "../controllers/teamController.js";

const router = express.Router();

// Protect all team routes
router.use(protect);

// Create team (admin flow)
router.post("/create", createTeam);

// Join team (member flow)
router.post("/join", joinTeam);

// Get current team details
router.get("/", getTeam);

// Get team members
router.get("/members", getTeamMembers);

// Get invite code (admin only)
router.get("/invite-code", authorizeRoles("admin"), getInviteCode);

export default router;
