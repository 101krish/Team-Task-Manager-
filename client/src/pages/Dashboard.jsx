import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import StateMessage from "../components/StateMessage";
import { useAuth } from "../context/AuthContext";

const statCards = [
  { key: "total", label: "Total Tasks", icon: "task", iconClass: "text-primary" },
  { key: "pending", label: "Pending", icon: "pending", iconClass: "text-tertiary-container" },
  { key: "completed", label: "Completed", icon: "check_circle", iconClass: "text-secondary" },
  { key: "overdue", label: "Overdue", icon: "warning", iconClass: "text-error" }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState(null);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const projectResponse = await api.get("/projects");
        const projectData = projectResponse.data.data;
        const taskResponses = await Promise.all(projectData.map((project) => api.get(`/tasks/${project._id}`)));
        setProjects(projectData);
        
        // All users see all tasks in their projects (already filtered by backend)
        const allTasks = taskResponses.flatMap((response) => response.data.data.tasks);
        setTasks(allTasks);

        // Fetch team info
        try {
          const teamResponse = await api.get("/teams");
          setTeam(teamResponse.data.data.team);
        } catch (err) {
          // Team might not be loaded yet
        }

        // For admins, fetch invite code
        if (user?.role === "admin") {
          try {
            const codeResponse = await api.get("/teams/invite-code");
            setInviteCode(codeResponse.data.data.inviteCode);
          } catch (err) {
            // Invite code might not be available
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user?.role]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: tasks.length,
      completed: tasks.filter((task) => task.status === "done").length,
      pending: tasks.filter((task) => task.status !== "done").length,
      overdue: tasks.filter((task) => task.status !== "done" && task.dueDate && new Date(task.dueDate) < now).length
    };
  }, [tasks]);

  const overdueTasks = tasks.filter((task) => task.status !== "done" && task.dueDate && new Date(task.dueDate) < new Date()).slice(0, 4);

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopyFeedback("Copied!");
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  if (loading) return <StateMessage title="Loading dashboard" message="Fetching project and task activity..." />;
  if (error) return <StateMessage title="Dashboard unavailable" message={error} tone="error" />;

  return (
    <>
      <header className="mb-lg">
        <h1 className="font-h1 text-h1 text-on-surface">Team Overview</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Welcome back, {user?.name}. Here's what's happening across your projects today.</p>
      </header>

      {user?.role === "admin" && inviteCode && (
        <div className="mb-xl rounded-xl border border-outline-variant bg-primary-container/20 p-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mb-xs font-h3 text-h3 text-on-surface">Share Team Access</h3>
              <p className="mb-md text-body-md text-on-surface-variant">
                Share this code with team members so they can join your team
              </p>
              <div className="flex items-center gap-md">
                <code className="rounded-lg bg-white px-lg py-md font-mono text-h2 font-bold text-primary">
                  {inviteCode}
                </code>
                <button
                  onClick={copyInviteCode}
                  className="rounded-lg bg-primary px-md py-md text-white transition-all hover:bg-primary-container"
                >
                  <span className="material-symbols-outlined">content_copy</span>
                </button>
                {copyFeedback && <span className="text-label-sm text-primary">{copyFeedback}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mb-xl grid grid-cols-1 gap-md md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className={`rounded-xl border border-outline-variant bg-white p-lg transition-all hover:shadow-lg ${
              card.key === "overdue" ? "border-l-4 border-l-error bg-error-container/10" : "border-l-4 border-l-primary"
            }`}
          >
            <div className="mb-sm flex items-start justify-between">
              <span className={`text-label-md ${card.key === "overdue" ? "font-semibold text-on-error-container" : "text-on-surface-variant"}`}>
                {card.label}
              </span>
              <span className={`material-symbols-outlined ${card.iconClass}`}>{card.icon}</span>
            </div>
            <div className={`font-h2 text-h2 ${card.key === "overdue" ? "text-error" : ""}`}>{stats[card.key]}</div>
            <div className={`mt-xs text-label-sm ${card.key === "overdue" ? "font-medium text-error" : "text-on-surface-variant"}`}>
              {card.key === "total" ? `${projects.length} active project${projects.length === 1 ? "" : "s"}` : "Calculated from live tasks"}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-xl lg:grid-cols-3">
        <div className="space-y-xl lg:col-span-2">
          <div className="rounded-xl border border-outline-variant bg-white p-lg">
            <div className="mb-lg flex items-center justify-between">
              <h3 className="font-h3 text-h3 text-on-surface">Project Completion</h3>
              <span className="text-label-sm text-on-surface-variant">Live project progress</span>
            </div>
            {projects.length ? (
              <div className="space-y-md">
                {projects.slice(0, 6).map((project) => (
                  <div key={project._id}>
                    <div className="mb-2 flex justify-between text-label-md">
                      <span className="font-semibold text-on-surface">{project.name}</span>
                      <span className="text-on-surface-variant">{project.progress || 0}% ({project.completedTasks || 0}/{project.totalTasks || 0})</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-primary" style={{ width: `${project.progress || 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body-md text-on-surface-variant">No projects yet. Admins can create the first project from Projects.</p>
            )}
          </div>
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-white">
            <div className="flex items-center justify-between border-b border-outline-variant bg-error-container/5 px-lg py-md">
              <h3 className="flex items-center gap-2 font-h3 text-h3 text-error">
                <span className="material-symbols-outlined">priority_high</span>
                Critical Overdue Tasks
              </h3>
            </div>
            {overdueTasks.length ? (
              <div className="divide-y divide-outline-variant">
                {overdueTasks.map((task) => (
                  <div className="flex items-center justify-between p-md" key={task._id}>
                    <div>
                      <p className="font-semibold text-on-surface">{task.title}</p>
                      <p className="text-label-sm text-error">Due {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                    <span className="text-label-sm text-on-surface-variant">{task.assignedTo?.name || "Unassigned"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-lg text-body-md text-on-surface-variant">No overdue tasks. Nice and tidy.</p>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-outline-variant bg-white">
          <div className="border-b border-outline-variant px-lg py-md">
            <h3 className="font-h3 text-h3 text-on-surface">Recent Activity</h3>
          </div>
          <div className="space-y-lg p-lg">
            {tasks.slice(0, 5).map((task) => (
              <div className="flex gap-4" key={task._id}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-fixed">
                  <span className="material-symbols-outlined text-sm text-primary">assignment</span>
                </div>
                <div>
                  <p className="text-body-md text-on-surface">
                    <span className="font-bold">{task.assignedTo?.name || "A team member"}</span> updated{" "}
                    <span className="font-medium text-primary">{task.title}</span>
                  </p>
                  <p className="text-label-sm text-on-surface-variant">{task.status}</p>
                </div>
              </div>
            ))}
            {!tasks.length ? <p className="text-body-md text-on-surface-variant">Task activity will appear here.</p> : null}
          </div>
        </div>
      </div>
    </>
  );
}

