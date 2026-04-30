import { useEffect, useState } from "react";
import ProjectCard from "../components/ProjectCard";
import StateMessage from "../components/StateMessage";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const initialForm = { name: "", description: "", members: [] };

export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [teamProjectId, setTeamProjectId] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamSaving, setTeamSaving] = useState(false);
  const [teamError, setTeamError] = useState("");

  const loadProjects = async () => {
    try {
      setLoading(true);
      const [projectResponse, userResponse] = await Promise.all([api.get("/projects"), api.get("/users")]);
      setProjects(projectResponse.data.data);
      setUsers(userResponse.data.data);
      if (!teamProjectId && projectResponse.data.data[0]) {
        setTeamProjectId(projectResponse.data.data[0]._id);
        setTeamMembers((projectResponse.data.data[0].members || []).map((member) => member._id));
      }
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      const response = await api.post("/projects", form);
      setProjects((current) => [response.data.data, ...current]);
      setForm(initialForm);
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleFormMember = (userId) => {
    setForm((current) => ({
      ...current,
      members: current.members.includes(userId) ? current.members.filter((id) => id !== userId) : [...current.members, userId]
    }));
  };

  const selectTeamProject = (projectId) => {
    const project = projects.find((item) => item._id === projectId);
    setTeamProjectId(projectId);
    setTeamMembers((project?.members || []).map((member) => member._id));
    setTeamError("");
  };

  const toggleTeamMember = (userId) => {
    setTeamMembers((current) => (current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]));
  };

  const handleTeamSave = async () => {
    if (!teamProjectId) return;
    setTeamSaving(true);
    setTeamError("");

    try {
      const response = await api.put(`/projects/${teamProjectId}/members`, { members: teamMembers });
      setProjects((current) => current.map((project) => (project._id === teamProjectId ? response.data.data : project)));
      setTeamMembers((response.data.data.members || []).map((member) => member._id));
    } catch (err) {
      setTeamError(err.message);
    } finally {
      setTeamSaving(false);
    }
  };

  return (
    <>
      <header className="mb-xl flex items-end justify-between">
        <div>
          <h1 className="mb-2 font-h1 text-h1 text-on-surface">Projects Overview</h1>
          <p className="font-body-lg text-on-surface-variant">Manage and track progress across your team's active workstreams.</p>
        </div>
        <div className="flex gap-md">
          <button className="flex items-center gap-2 rounded-lg border border-outline px-md py-sm font-semibold text-label-md text-on-surface transition-colors hover:bg-surface-container" type="button">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Filter
          </button>
          <button
            className="flex items-center gap-2 rounded-lg bg-primary px-lg py-sm font-semibold text-label-md text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={!isAdmin}
            onClick={() => setModalOpen(true)}
            title={isAdmin ? "Create New Project" : "Only admins can create projects"}
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Create New Project
          </button>
        </div>
      </header>

      {!isAdmin ? (
        <div className="mb-lg rounded-xl border border-outline-variant bg-surface-container-low p-md text-label-md text-on-surface-variant">
          You can view projects and update tasks. Project creation is limited to admins.
        </div>
      ) : null}

      {loading ? <StateMessage title="Loading projects" message="Fetching your workspace projects..." /> : null}
      {error ? <StateMessage title="Projects unavailable" message={error} tone="error" /> : null}
      {!loading && !error && !projects.length ? (
        <StateMessage title="No projects yet" message={isAdmin ? "Create the first project to start organizing tasks." : "Ask an admin to add you to a project."} />
      ) : null}

      {!loading && !error && projects.length ? (
        <div className="grid grid-cols-1 gap-xl md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={project._id} project={project} featured={index === 0} />
          ))}
        </div>
      ) : null}

      <section className="mt-xl grid grid-cols-1 gap-xl lg:grid-cols-3">
        <div className="space-y-md lg:col-span-2">
          <h2 className="font-h2 text-h2 text-indigo-900">Team Workload</h2>
          <div className="rounded-xl border border-slate-200 bg-white p-lg">
            <div className="mb-lg flex items-center justify-between">
              <span className="font-semibold text-on-surface">Active Assignments</span>
              <span className="text-label-md text-on-surface-variant">Live membership</span>
            </div>
            {projects.flatMap((project) => project.members || []).slice(0, 4).length ? (
              <div className="space-y-md">
                {projects
                  .flatMap((project) => project.members || [])
                  .slice(0, 4)
                  .map((member) => (
                    <div className="flex items-center gap-md" key={`${member._id}-${member.email}`}>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-fixed text-[10px] font-bold text-primary">
                        {member.name
                          ?.split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex justify-between">
                          <span className="text-label-md font-bold text-on-surface">{member.name}</span>
                          <span className="text-label-sm text-slate-500">{member.role}</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-slate-100">
                          <div className="h-full w-3/5 rounded-full bg-indigo-600" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-body-md text-on-surface-variant">Team workload appears once projects have members.</p>
            )}
          </div>
        </div>
        <div className="space-y-md">
          <h2 className="font-h2 text-h2 text-indigo-900">Team Management</h2>
          <div className="rounded-xl border border-slate-200 bg-white p-lg">
            {isAdmin && projects.length ? (
              <div className="space-y-md">
                {teamError ? <div className="rounded-lg bg-error-container p-sm text-label-md text-on-error-container">{teamError}</div> : null}
                <label className="block text-label-md text-on-surface-variant" htmlFor="team-project">
                  Project
                </label>
                <select
                  className="w-full rounded-lg border border-outline-variant bg-surface-bright px-md py-sm font-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container/20"
                  id="team-project"
                  value={teamProjectId}
                  onChange={(event) => selectTeamProject(event.target.value)}
                >
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <div className="max-h-64 space-y-sm overflow-auto rounded-lg border border-outline-variant p-sm">
                  {users.map((user) => (
                    <label className="flex cursor-pointer items-center justify-between rounded-lg px-sm py-xs hover:bg-surface-container" key={user._id}>
                      <span>
                        <span className="block text-label-md font-semibold text-on-surface">{user.name}</span>
                        <span className="text-label-sm text-on-surface-variant">{user.email}</span>
                      </span>
                      <input
                        className="rounded border-outline-variant text-primary focus:ring-primary"
                        type="checkbox"
                        checked={teamMembers.includes(user._id)}
                        onChange={() => toggleTeamMember(user._id)}
                      />
                    </label>
                  ))}
                </div>
                <button className="w-full rounded-lg bg-primary px-lg py-md font-semibold text-white disabled:opacity-60" type="button" onClick={handleTeamSave} disabled={teamSaving}>
                  {teamSaving ? "Saving..." : "Save Team"}
                </button>
              </div>
            ) : (
              <p className="text-body-md text-on-surface-variant">
                {isAdmin ? "Create a project to manage its team." : "Admins can add and remove project members here."}
              </p>
            )}
          </div>
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-gutter">
          <div className="w-full max-w-lg rounded-xl border border-outline-variant bg-white p-xl shadow-2xl">
            <div className="mb-lg flex items-center justify-between">
              <h2 className="font-h2 text-h2 text-on-surface">Create New Project</h2>
              <button className="rounded-full p-2 hover:bg-slate-50" type="button" onClick={() => setModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {formError ? <div className="mb-md rounded-lg bg-error-container p-md text-label-md text-on-error-container">{formError}</div> : null}
            <form className="space-y-lg" onSubmit={handleCreate}>
              <div>
                <label className="mb-xs block text-label-md text-on-surface-variant" htmlFor="project-name">
                  Project name
                </label>
                <input
                  className="w-full rounded-lg border border-outline-variant bg-surface-bright px-md py-sm font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container/20"
                  id="project-name"
                  required
                  placeholder="Enter project name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
              </div>
              <div>
                <label className="mb-xs block text-label-md text-on-surface-variant" htmlFor="project-description">
                  Description
                </label>
                <textarea
                  className="w-full rounded-lg border border-outline-variant bg-surface-bright px-md py-sm font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container/20"
                  id="project-description"
                  rows="4"
                  placeholder="Add project details..."
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                />
              </div>
              <div>
                <span className="mb-xs block text-label-md text-on-surface-variant">Members</span>
                <div className="max-h-48 space-y-sm overflow-auto rounded-lg border border-outline-variant p-sm">
                  {users.map((user) => (
                    <label className="flex cursor-pointer items-center justify-between rounded-lg px-sm py-xs hover:bg-surface-container" key={user._id}>
                      <span>
                        <span className="block text-label-md font-semibold text-on-surface">{user.name}</span>
                        <span className="text-label-sm text-on-surface-variant">{user.email}</span>
                      </span>
                      <input
                        className="rounded border-outline-variant text-primary focus:ring-primary"
                        type="checkbox"
                        checked={form.members.includes(user._id)}
                        onChange={() => toggleFormMember(user._id)}
                      />
                    </label>
                  ))}
                  {!users.length ? <p className="text-label-md text-on-surface-variant">No users found yet.</p> : null}
                </div>
              </div>
              <button className="w-full rounded-lg bg-primary px-lg py-md font-semibold text-white disabled:opacity-60" type="submit" disabled={saving}>
                {saving ? "Creating..." : "Create Project"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
