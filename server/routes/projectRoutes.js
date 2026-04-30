import express from "express";
import { createProject, getProjects, updateProjectMembers } from "../controllers/projectController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getProjects).post(protect, authorizeRoles("admin"), createProject);
router.put("/:id/members", protect, authorizeRoles("admin"), updateProjectMembers);

export default router;
