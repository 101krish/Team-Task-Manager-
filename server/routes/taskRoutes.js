import express from "express";
import { createTask, getTasksByProject, updateTask } from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:projectId", protect, getTasksByProject);
router.post("/", protect, createTask);
router.put("/:id", protect, updateTask);

export default router;
