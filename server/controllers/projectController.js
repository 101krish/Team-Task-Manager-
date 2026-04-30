import mongoose from "mongoose";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

const canAccessProject = (project, user) =>
  user.role === "admin" ||
  project.createdBy?.toString() === user._id.toString() ||
  project.members.some((memberId) => memberId.toString() === user._id.toString());

export const getProjects = async (req, res, next) => {
  try {
    const filter =
      req.user.role === "admin"
        ? {}
        : { $or: [{ members: req.user._id }, { createdBy: req.user._id }] };

    const projects = await Project.find(filter)
      .populate("members", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const [totalTasks, completedTasks] = await Promise.all([
          Task.countDocuments({ projectId: project._id }),
          Task.countDocuments({ projectId: project._id, status: "done" })
        ]);
        return {
          ...project.toObject(),
          totalTasks,
          completedTasks,
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

    res.status(201).json({ success: true, data: { ...populatedProject.toObject(), totalTasks: 0, completedTasks: 0, progress: 0 } });
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

    const [totalTasks, completedTasks] = await Promise.all([
      Task.countDocuments({ projectId: project._id }),
      Task.countDocuments({ projectId: project._id, status: "done" })
    ]);

    res.json({
      success: true,
      data: {
        ...populatedProject.toObject(),
        totalTasks,
        completedTasks,
        progress: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
      }
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
