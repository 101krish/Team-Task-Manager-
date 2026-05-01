import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import StateMessage from "../components/StateMessage";
import TaskCard from "../components/TaskCard";
import MembersSection from "../components/MembersSection";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const columns = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "done", label: "Completed" }
];

const initialTaskForm = { title: "", description: "", status: "todo", dueDate: "", assignedTo: "" };

export default function TaskBoard() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialTaskForm);
  const [saving, setSaving] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState("");
  const [deletingTaskId, setDeletingTaskId] = useState("");
  const [formError, setFormError] = useState("");

  const loadTasks = async () => {
    try {
      setLoading(true);
      const tasksResponse = await api.get(`/tasks/${projectId}`);
      
      setProject(tasksResponse.data.data.project);
      setTasks(tasksResponse.data.data.tasks);
      setProgress(tasksResponse.data.data.progress);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  // Debug logging: Show available members for task assignment
  useEffect(() => {
    if (project?.members) {
      console.log("Project Members:", project.members);
      console.log(`Members Count: ${project.members.length}`);
      
      if (project.members.length === 1) {
        console.warn("⚠️ BACKEND ISSUE: Only 1 member in project.members (usually just admin)");
        console.log("Fix: Ensure project creation fetches Team and copies team.members");
      } else if (project.members.length > 1) {
        console.log(`✅ CORRECT: Project has ${project.members.length} members`);
      } else {
        console.warn("⚠️ Project has 0 members - check team setup");
      }
      
      console.log("✓ Project Members Available:", project.members.map(m => ({ name: m.name, id: m._id, role: m.role })));
    } else {
      console.warn("⚠ Project has no members assigned");
    }
  }, [project]);

  const groupedTasks = useMemo(
    () =>
      columns.reduce((acc, column) => {
        acc[column.key] = tasks.filter((task) => task.status === column.key);
        return acc;
      }, {}),
    [tasks]
  );

  const handleStatusChange = async (taskId, status) => {
    setUpdatingTaskId(taskId);
    try {
      const response = await api.put(`/tasks/${taskId}`, { status });
      setTasks((current) => current.map((task) => (task._id === taskId ? response.data.data : task)));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingTaskId("");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) return;
    
    setDeletingTaskId(taskId);
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((current) => current.filter((task) => task._id !== taskId));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingTaskId("");
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      const payload = {
        ...form,
        projectId,
        assignedTo: form.assignedTo || undefined,
        dueDate: form.dueDate || undefined
      };
      
      // Debug logging
      console.log("📋 Creating task with payload:", payload);
      console.log("📋 Assigned user ID:", payload.assignedTo);
      console.log("📋 Available project members:", project?.members?.map(m => ({ id: m._id, name: m.name })));
      
      const response = await api.post("/tasks", payload);
      console.log("✓ Task created successfully:", response.data.data);
      setTasks((current) => [response.data.data, ...current]);
      setForm(initialTaskForm);
      setModalOpen(false);
    } catch (err) {
      console.error("✗ Task creation failed:", err.message);
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <StateMessage title="Loading board" message="Fetching Kanban tasks..." />;
  if (error && !project) return <StateMessage title="Board unavailable" message={error} tone="error" />;

  return (
    <>
      {error ? <div className="mb-md rounded-lg bg-error-container p-md text-label-md text-on-error-container">{error}</div> : null}
      <div className="mb-xl flex items-center justify-between">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Kanban Board</h1>
          <p className="text-body-lg text-on-surface-variant">{project?.name || "Project"} workflow and team velocity.</p>
        </div>
        <div className="flex items-center gap-md">
          <div className="flex -space-x-2">
            {(project?.members || []).slice(0, 4).map((member) => (
              <div
                key={member._id}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-surface-container-high text-[10px] font-bold text-primary"
                title={member.name}
              >
                {member.name
                  ?.split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            ))}
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-outline px-4 py-2 font-label-md text-label-md transition-colors hover:bg-slate-50" type="button">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filters
          </button>
          {user?.role === "admin" && (
            <button
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-white transition-colors hover:bg-primary-container"
              type="button"
              onClick={() => setModalOpen(true)}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Task
            </button>
          )}
        </div>
      </div>

      {progress && (
        <div className="mb-xl grid grid-cols-1 gap-md rounded-xl border border-outline-variant bg-white p-lg md:grid-cols-4">
          <div className="flex flex-col">
            <p className="text-label-sm font-semibold text-on-surface-variant mb-md">Total Tasks</p>
            <p className="text-h3 font-h3 text-on-surface">{progress.totalTasks}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-label-sm font-semibold text-on-surface-variant mb-md">Completed</p>
            <p className="text-h3 font-h3 text-green-600">{progress.completedTasks}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-label-sm font-semibold text-on-surface-variant mb-md">In Progress</p>
            <p className="text-h3 font-h3 text-blue-600">{progress.inProgressTasks}</p>
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-label-sm font-semibold text-on-surface-variant mb-md">To Do</p>
              <p className="text-h3 font-h3 text-slate-600">{progress.todoTasks}</p>
            </div>
            <div className="mt-md border-t border-outline-variant pt-md">
              <p className="text-label-sm font-semibold text-on-surface-variant mb-xs">Progress</p>
              <p className="text-h2 font-h2 text-primary">{progress.percentage}%</p>
            </div>
          </div>
        </div>
      )}

      {!tasks.length ? (
        <div className="mb-lg">
          <StateMessage title="No tasks yet" message="Add a task to start building this project's workflow." />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-xl pb-12 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <MembersSection teamId={user?.teamId} />
        </div>
        <div className="lg:col-span-4">
          <div className="grid grid-cols-1 gap-xl lg:grid-cols-3">
            {columns.map((column) => (
          <div className="flex flex-col gap-md" key={column.key}>
            <div className="flex items-center justify-between px-xs">
              <div className="flex items-center gap-sm">
                <h2 className="font-h3 text-h3 text-on-surface">{column.label}</h2>
                <span className="rounded-full bg-surface-container-highest px-2 py-0.5 text-label-sm text-on-surface-variant">
                  {groupedTasks[column.key]?.length || 0}
                </span>
              </div>
              <button className="material-symbols-outlined text-outline transition-colors hover:text-primary" type="button">
                more_horiz
              </button>
            </div>
            <div className="space-y-md">
              {groupedTasks[column.key]?.map((task) => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  onStatusChange={handleStatusChange} 
                  onDelete={handleDeleteTask} 
                  updating={updatingTaskId === task._id} 
                  deleting={deletingTaskId === task._id}
                  currentUserId={user?._id}
                />
              ))}
              {user?.role === "admin" && (
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 py-3 text-label-md text-on-surface-variant transition-all hover:border-primary hover:text-primary"
                  type="button"
                  onClick={() => {
                    setForm((current) => ({ ...current, status: column.key }));
                    setModalOpen(true);
                  }}
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Task
                </button>
              )}
            </div>
          </div>
        ))}
          </div>
        </div>
      </div>

      {modalOpen && user?.role === "admin" ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-gutter">
          <div className="w-full max-w-lg rounded-xl border border-outline-variant bg-white p-xl shadow-2xl">
            <div className="mb-lg flex items-center justify-between">
              <h2 className="font-h2 text-h2 text-on-surface">Add Task</h2>
              <button className="rounded-full p-2 hover:bg-slate-50" type="button" onClick={() => setModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {formError ? <div className="mb-md rounded-lg bg-error-container p-md text-label-md text-on-error-container">{formError}</div> : null}
            <form className="space-y-lg" onSubmit={handleCreateTask}>
              <div>
                <label className="mb-xs block text-label-md text-on-surface-variant" htmlFor="task-title">
                  Title
                </label>
                <input
                  className="w-full rounded-lg border border-outline-variant bg-surface-bright px-md py-sm font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container/20"
                  id="task-title"
                  required
                  placeholder="Enter task title"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                />
              </div>
              <div>
                <label className="mb-xs block text-label-md text-on-surface-variant" htmlFor="task-description">
                  Description
                </label>
                <textarea
                  className="w-full rounded-lg border border-outline-variant bg-surface-bright px-md py-sm font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container/20"
                  id="task-description"
                  rows="3"
                  placeholder="Add task details..."
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
                <div>
                  <label className="mb-xs block text-label-md text-on-surface-variant" htmlFor="task-status">
                    Status
                  </label>
                  <select
                    className="w-full rounded-lg border border-outline-variant bg-surface-bright px-md py-sm font-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container/20"
                    id="task-status"
                    value={form.status}
                    onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  >
                    {columns.map((column) => (
                      <option key={column.key} value={column.key}>
                        {column.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-xs block text-label-md text-on-surface-variant" htmlFor="task-assignee">
                    Assign To
                  </label>
                  <select
                    className="w-full rounded-lg border border-outline-variant bg-surface-bright px-md py-sm font-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container/20"
                    id="task-assignee"
                    value={form.assignedTo}
                    onChange={(event) => {
                      const selectedId = event.target.value;
                      if (selectedId) {
                        const selected = project?.members?.find(m => m._id === selectedId);
                        console.log("📌 Task assigned to:", selected?.name, `(${selected?.role})`);
                      }
                      setForm((current) => ({ ...current, assignedTo: selectedId }));
                    }}
                    required
                    disabled={user?.role === "member" || !project?.members || project.members.length === 0}
                  >
                    <option value="">
                      {user?.role === "admin" 
                        ? project?.members && project.members.length > 0 
                          ? `Select from ${project.members.length} team member${project.members.length === 1 ? "" : "s"}`
                          : "No project members available"
                        : "Assign to me"
                      }
                    </option>
                    {user?.role === "admin" ? (
                      // Show ALL project members
                      (project?.members && project.members.length > 0) ? (
                        project.members.map((member) => (
                          <option key={member._id} value={member._id}>
                            {member.name} {member._id === user?._id ? "(You)" : ""} • {member.role}
                          </option>
                        ))
                      ) : (
                        <option disabled>No members available</option>
                      )
                    ) : (
                      <option value={user?._id}>{user?.name}</option>
                    )}
                  </select>
                  {!project?.members || project.members.length === 0 ? (
                    <p className="mt-xs text-label-xs text-error">⚠ No project members available. Task assignment disabled.</p>
                  ) : null}
                </div>
              </div>
              <div>
                <label className="mb-xs block text-label-md text-on-surface-variant" htmlFor="task-due-date">
                  Due date
                </label>
                <input
                  className="w-full rounded-lg border border-outline-variant bg-surface-bright px-md py-sm font-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container/20"
                  id="task-due-date"
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                />
              </div>
              <button className="w-full rounded-lg bg-primary px-lg py-md font-semibold text-white disabled:opacity-60" type="submit" disabled={saving}>
                {saving ? "Adding..." : "Add Task"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
