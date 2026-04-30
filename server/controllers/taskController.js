import mongoose from "mongoose";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { assertProjectAccess } from "./projectController.js";

const VALID_STATUSES = ["todo", "in-progress", "done"];

export const getTasksByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await assertProjectAccess(projectId, req.user);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or access denied" });
    }

    const populatedProject = await Project.findById(projectId)
      .populate("members", "name email role")
      .populate("createdBy", "name email role");

    const tasks = await Task.find({ projectId })
      .populate("assignedTo", "name email role")
      .populate("projectId", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { project: populatedProject, tasks } });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description = "", status = "todo", assignedTo, projectId, dueDate } = req.body;

    if (!title?.trim() || !projectId) {
      return res.status(400).json({ success: false, message: "Task title and projectId are required" });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid task status" });
    }

    const project = await assertProjectAccess(projectId, req.user);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or access denied" });
    }

    const assigneeId = assignedTo || req.user._id;
    if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
      return res.status(400).json({ success: false, message: "Assigned user is invalid" });
    }

    const assignee = await User.findById(assigneeId);
    if (!assignee) {
      return res.status(400).json({ success: false, message: "Assigned user does not exist" });
    }

    const isProjectMember =
      project.members.some((member) => member.toString() === assignee._id.toString()) ||
      project.createdBy.toString() === assignee._id.toString();

    if (!isProjectMember) {
      return res.status(400).json({ success: false, message: "Assigned user must belong to the project" });
    }

    const task = await Task.create({ title, description, status, assignedTo: assigneeId, projectId, dueDate });
    const populatedTask = await Task.findById(task._id).populate("assignedTo", "name email role").populate("projectId", "name");

    res.status(201).json({ success: true, data: populatedTask });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, assignedTo, dueDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Task ID is invalid" });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid task status" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const project = await assertProjectAccess(task.projectId.toString(), req.user);
    if (!project) {
      return res.status(403).json({ success: false, message: "Access denied for this task" });
    }

    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee) return res.status(400).json({ success: false, message: "Assigned user does not exist" });
      const isProjectMember = project.members.some((member) => member.toString() === assignedTo);
      if (!isProjectMember) {
        return res.status(400).json({ success: false, message: "Assigned user must belong to the project" });
      }
      task.assignedTo = assignedTo;
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();
    const updatedTask = await Task.findById(task._id).populate("assignedTo", "name email role").populate("projectId", "name");

    res.json({ success: true, data: updatedTask });
  } catch (error) {
    next(error);
  }
};
