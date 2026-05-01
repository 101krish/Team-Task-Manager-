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
        setError("");
        
        // Load projects
        let projectData = [];
        try {
          const projectResponse = await api.get("/projects");
          projectData = projectResponse.data.data || [];
          setProjects(projectData);
        } catch (err) {
          console.error("Failed to load projects:", err);
          setError("Failed to load projects. Please refresh the page.");
          setProjects([]);
          setTasks([]);
          setLoading(false);
          return;
        }

        // Load tasks for all projects - use Promise.allSettled to handle individual failures
        if (projectData.length > 0) {
          try {
            const taskResponses = await Promise.allSettled(
              projectData.map((project) => api.get(`/tasks/${project._id}`))
            );
            
            const allTasks = taskResponses
              .filter((result) => result.status === "fulfilled")
              .flatMap((result) => result.value.data.data.tasks || []);
            
            setTasks(allTasks);
          } catch (err) {
            console.error("Error loading tasks:", err);
            setTasks([]);
          }
        } else {
          setTasks([]);
        }

        // Fetch team info - non-blocking
        try {
          const teamResponse = await api.get("/teams");
          setTeam(teamResponse.data.data?.team || null);
        } catch (err) {
          console.error("Failed to load team info:", err);
          setTeam(null);
        }

        // For admins, fetch invite code - non-blocking
        if (user?.role === "admin") {
          try {
            const codeResponse = await api.get("/teams/invite-code");
            setInviteCode(codeResponse.data.data?.inviteCode || "");
          } catch (err) {
            console.error("Failed to load invite code:", err);
            setInviteCode("");
          }
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError(err.message || "Failed to load dashboard");
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
            className={`flex flex-col justify-between rounded-xl border-2 bg-white p-lg transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer h-full ${
              card.key === "overdue" 
                ? "border-error bg-error-container/5" 
                : card.key === "completed"
                ? "border-emerald-200"
                : card.key === "pending"
                ? "border-amber-200"
                : "border-primary"
            }`}
          >
            <div className="mb-md flex items-start justify-between">
              <span className={`text-label-md font-semibold ${
                card.key === "overdue" ? "text-error" : "text-on-surface-variant"
              }`}>
                {card.label}
              </span>
              <span className={`material-symbols-outlined text-2xl flex-shrink-0 ${
                card.key === "overdue" ? "text-error" : 
                card.key === "completed" ? "text-emerald-600" :
                card.key === "pending" ? "text-amber-600" :
                "text-primary"
              }`}>
                {card.icon}
              </span>
            </div>
            <div className={`font-h1 text-h1 ${
              card.key === "overdue" ? "text-error" : 
              card.key === "completed" ? "text-emerald-600" :
              card.key === "pending" ? "text-amber-600" :
              "text-primary"
            }`}>
              {stats[card.key]}
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
              <div className="space-y-lg">
                {projects.slice(0, 6).map((project) => (
                  <div key={project._id} className="hover:bg-slate-50 p-md rounded-lg transition-colors">
                    <div className="mb-3 flex justify-between items-center">
                      <span className="font-semibold text-on-surface text-label-lg">{project.name}</span>
                      <span className={`text-label-md font-bold ${
                        project.progress === 100 ? "text-emerald-600" :
                        project.progress >= 50 ? "text-blue-600" :
                        "text-amber-600"
                      }`}>
                        {project.progress}%
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          project.progress === 100 ? "bg-emerald-500" :
                          project.progress >= 50 ? "bg-blue-500" :
                          "bg-amber-500"
                        }`} 
                        style={{ width: `${project.progress || 0}%` }} 
                      />
                    </div>
                    <div className="mt-2 text-label-sm text-on-surface-variant">
                      {project.totalTasks === 0 ? (
                        "No tasks yet"
                      ) : (
                        <>{project.completedTasks || 0}/{project.totalTasks || 0} tasks completed</>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body-md text-on-surface-variant">No projects yet. Admins can create the first project from Projects.</p>
            )}
          </div>
          <div className="overflow-hidden rounded-xl border border-error-container bg-error-container/5">
            <div className="flex items-center justify-between border-b border-error-container/20 bg-error-container/10 px-lg py-md">
              <h3 className="flex items-center gap-2 font-h3 text-h3 text-error">
                <span className="material-symbols-outlined">priority_high</span>
                Critical Overdue Tasks
              </h3>
              {overdueTasks.length > 0 && (
                <span className="text-label-sm font-bold px-3 py-1 rounded-full bg-error text-white">
                  {overdueTasks.length}
                </span>
              )}
            </div>
            {overdueTasks.length ? (
              <div className="divide-y divide-outline-variant">
                {overdueTasks.map((task) => (
                  <div className="flex items-center justify-between p-lg hover:bg-error-container/5 transition-colors" key={task._id}>
                    <div>
                      <p className="font-semibold text-on-surface">{task.title}</p>
                      <p className="text-label-sm text-error font-medium">
                        <span className="material-symbols-outlined text-sm inline mr-1">calendar_today</span>
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-label-sm font-medium text-on-surface-variant">{task.assignedTo?.name || "Unassigned"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-lg text-body-md text-on-surface-variant">✓ No overdue tasks. Nice and tidy!</p>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-outline-variant bg-white">
          <div className="border-b border-outline-variant px-lg py-md">
            <h3 className="font-h3 text-h3 text-on-surface">Recent Activity</h3>
          </div>
          <div className="p-lg">
            {tasks.length === 0 ? (
              <div className="py-lg text-center">
                <div className="mb-md text-3xl">📭</div>
                <p className="text-body-md text-on-surface-variant">No recent activity yet</p>
                <p className="text-label-sm text-on-surface-variant mt-2">Tasks will appear here as you create them</p>
              </div>
            ) : (
              <div className="space-y-lg">
                {tasks.slice(0, 5).map((task) => (
                  <div className="flex gap-4 pb-lg border-b border-outline-variant last:border-b-0 last:pb-0" key={task._id}>
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                      task.status === "done" ? "bg-emerald-100" : task.status === "in-progress" ? "bg-blue-100" : "bg-amber-100"
                    }`}>
                      <span className={`material-symbols-outlined text-sm ${
                        task.status === "done" ? "text-emerald-700" : task.status === "in-progress" ? "text-blue-700" : "text-amber-700"
                      }`}>
                        {task.status === "done" ? "check_circle" : task.status === "in-progress" ? "schedule" : "assignment"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-md text-on-surface">
                        <span className="font-bold">{task.assignedTo?.name || "A team member"}</span> has a task{" "}
                        <span className="font-medium text-primary">{task.title}</span>
                      </p>
                      <p className="text-label-sm text-on-surface-variant mt-1">
                        Status: <span className="font-semibold">{task.status === "in-progress" ? "In Progress" : task.status === "done" ? "Completed" : "To Do"}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

