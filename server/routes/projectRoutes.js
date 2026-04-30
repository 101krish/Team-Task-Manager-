import express from "express";
import { createProject, getProjects, updateProjectMembers, deleteProject, addProjectMember, removeProjectMember } from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getProjects).post(protect, createProject);
router.delete("/:id", protect, deleteProject);
router.put("/:id/members", protect, updateProjectMembers);
router.post("/:id/members/add", protect, addProjectMember);
router.delete("/:id/members/:memberId", protect, removeProjectMember);

export default router;
