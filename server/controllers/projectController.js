import mongoose from "mongoose";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

// Check if user is project member or creator
const canAccessProject = (project, user) =>
  project.createdBy?.toString() === user._id.toString() ||
  project.members.some((memberId) => memberId.toString() === user._id.toString());

// Check if user is project creator
const isProjectCreator = (project, user) =>
  project.createdBy?.toString() === user._id.toString();

export const getProjects = async (req, res, next) => {
  try {
    // Users see only projects they're part of
    const filter = { $or: [{ members: req.user._id }, { createdBy: req.user._id }] };

    const projects = await Project.find(filter)
      .populate("members", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const [totalTasks, completedTasks, inProgressTasks, todoTasks] = await Promise.all([
          Task.countDocuments({ projectId: project._id }),
          Task.countDocuments({ projectId: project._id, status: "done" }),
          Task.countDocuments({ projectId: project._id, status: "in-progress" }),
          Task.countDocuments({ projectId: project._id, status: "todo" })
        ]);
        return {
          ...project.toObject(),
          isOwner: isProjectCreator(project, req.user),
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          progress: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
      })
    );

    res.json({ success: true, data: projectsWithStats });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { name, description = "", members = [] } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Project name is required" });
    }

    // Creator is automatically added to members
    const uniqueMemberIds = [...new Set([req.user._id.toString(), ...members])];
    const invalidMemberId = uniqueMemberIds.find((id) => !mongoose.Types.ObjectId.isValid(id));

    if (invalidMemberId) {
      return res.status(400).json({ success: false, message: "One or more member IDs are invalid" });
    }

    const usersFound = await User.countDocuments({ _id: { $in: uniqueMemberIds } });
    if (usersFound !== uniqueMemberIds.length) {
      return res.status(400).json({ success: false, message: "One or more members do not exist" });
    }

    const project = await Project.create({
      name,
      description,
      members: uniqueMemberIds,
      createdBy: req.user._id
    });

    const populatedProject = await Project.findById(project._id)
      .populate("members", "name email role")
      .populate("createdBy", "name email role");

    res.status(201).json({
      success: true,
      data: {
        ...populatedProject.toObject(),
        isOwner: true,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
        progress: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProjectMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { members = [] } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Project ID is invalid" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Only project creator can manage members
    if (!isProjectCreator(project, req.user)) {
      return res.status(403).json({ success: false, message: "Only project owner can manage members" });
    }

    // Creator must always be a member
    const uniqueMemberIds = [...new Set([project.createdBy.toString(), ...members])];
    const invalidMemberId = uniqueMemberIds.find((memberId) => !mongoose.Types.ObjectId.isValid(memberId));

    if (invalidMemberId) {
      return res.status(400).json({ success: false, message: "One or more member IDs are invalid" });
    }

    const usersFound = await User.countDocuments({ _id: { $in: uniqueMemberIds } });
    if (usersFound !== uniqueMemberIds.length) {
      return res.status(400).json({ success: false, message: "One or more members do not exist" });
    }

    project.members = uniqueMemberIds;
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate("members", "name email role")
      .populate("createdBy", "name email role");

    const [totalTasks, completedTasks, inProgressTasks, todoTasks] = await Promise.all([
      Task.countDocuments({ projectId: project._id }),
      Task.countDocuments({ projectId: project._id, status: "done" }),
      Task.countDocuments({ projectId: project._id, status: "in-progress" }),
      Task.countDocuments({ projectId: project._id, status: "todo" })
    ]);

    res.json({
      success: true,
      data: {
        ...populatedProject.toObject(),
        isOwner: true,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        progress: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Project ID is invalid" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Only project creator can delete
    if (!isProjectCreator(project, req.user)) {
      return res.status(403).json({ success: false, message: "Only project owner can delete project" });
    }

    // Delete all tasks in the project first
    await Task.deleteMany({ projectId: project._id });

    // Delete the project
    await Project.findByIdAndDelete(id);

    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const addProjectMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Project ID is invalid" });
    }

    if (!email?.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Only project creator can add members
    if (!isProjectCreator(project, req.user)) {
      return res.status(403).json({ success: false, message: "Only project owner can add members" });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found with that email" });
    }

    // Check if already a member
    if (project.members.some((memberId) => memberId.toString() === user._id.toString())) {
      return res.status(400).json({ success: false, message: "User is already a member of this project" });
    }

    // Add member
    project.members.push(user._id);
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate("members", "name email role")
      .populate("createdBy", "name email role");

    res.json({
      success: true,
      data: { ...populatedProject.toObject(), isOwner: true }
    });
  } catch (error) {
    next(error);
  }
};

export const removeProjectMember = async (req, res, next) => {
  try {
    const { id, memberId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Only project creator can remove members
    if (!isProjectCreator(project, req.user)) {
      return res.status(403).json({ success: false, message: "Only project owner can remove members" });
    }

    // Cannot remove project creator
    if (project.createdBy.toString() === memberId) {
      return res.status(400).json({ success: false, message: "Cannot remove project owner" });
    }

    // Remove member
    project.members = project.members.filter((m) => m.toString() !== memberId);
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate("members", "name email role")
      .populate("createdBy", "name email role");

    res.json({
      success: true,
      data: { ...populatedProject.toObject(), isOwner: true }
    });
  } catch (error) {
    next(error);
  }
};

export const assertProjectAccess = async (projectId, user) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) return null;
  const project = await Project.findById(projectId);
  if (!project || !canAccessProject(project, user)) return null;
  return project;
};
