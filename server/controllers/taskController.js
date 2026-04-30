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

    // Project members can see all tasks in the project
    const tasks = await Task.find({ projectId })
      .populate("assignedTo", "name email role")
      .populate("projectId", "name")
      .sort({ createdAt: -1 });

    // Calculate progress stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
    const todoTasks = tasks.filter((t) => t.status === "todo").length;

    res.json({
      success: true,
      data: {
        project: populatedProject,
        tasks,
        progress: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          percentage: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
        }
      }
    });
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

    if (!assignedTo) {
      return res.status(400).json({ success: false, message: "Task must be assigned to someone" });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid task status" });
    }

    const project = await assertProjectAccess(projectId, req.user);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or access denied" });
    }

    // Validate assignedTo is a project member
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({ success: false, message: "Assigned user ID is invalid" });
    }

    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return res.status(400).json({ success: false, message: "Assigned user does not exist" });
    }

    const isProjectMember =
      project.members.some((member) => member.toString() === assignee._id.toString()) ||
      project.createdBy.toString() === assignee._id.toString();

    if (!isProjectMember) {
      return res.status(400).json({ success: false, message: "Assigned user must be a project member" });
    }

    const task = await Task.create({ 
      title, 
      description, 
      status, 
      assignedTo, 
      projectId, 
      dueDate 
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate("projectId", "name");

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

    // Check if user is allowed to update task
    const isAssignedUser = task.assignedTo?.toString() === req.user._id.toString();
    const isProjectCreator = project.createdBy?.toString() === req.user._id.toString();

    if (!isAssignedUser && !isProjectCreator) {
      return res.status(403).json({ 
        success: false, 
        message: "Only assigned user or project owner can update this task" 
      });
    }

    // Only project creator can reassign tasks
    if (assignedTo && assignedTo !== task.assignedTo?.toString()) {
      if (!isProjectCreator) {
        return res.status(403).json({ 
          success: false, 
          message: "Only project owner can reassign tasks" 
        });
      }

      const assignee = await User.findById(assignedTo);
      if (!assignee) {
        return res.status(400).json({ success: false, message: "Assigned user does not exist" });
      }

      const isNewAssigneeMember = 
        project.members.some((member) => member.toString() === assignedTo) || 
        project.createdBy.toString() === assignedTo;

      if (!isNewAssigneeMember) {
        return res.status(400).json({ success: false, message: "New assignee must be a project member" });
      }

      task.assignedTo = assignedTo;
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();
    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate("projectId", "name");

    res.json({ success: true, data: updatedTask });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Task ID is invalid" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const project = await assertProjectAccess(task.projectId.toString(), req.user);
    if (!project) {
      return res.status(403).json({ success: false, message: "Access denied for this task" });
    }

    // Only project creator can delete tasks
    const isProjectCreator = project.createdBy?.toString() === req.user._id.toString();
    if (!isProjectCreator) {
      return res.status(403).json({ 
        success: false, 
        message: "Only project owner can delete tasks" 
      });
    }

    await Task.findByIdAndDelete(id);
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};
