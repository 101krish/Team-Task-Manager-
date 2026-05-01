import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import StateMessage from "../components/StateMessage";
import MembersSection from "../components/MembersSection";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const initialForm = { name: "", description: "", members: [] };

const filterOptions = [
  { id: "all", label: "All Projects", icon: "folder", description: "View all projects" },
  { id: "my", label: "My Projects", icon: "person", description: "Projects you're a member of" },
  { id: "completed", label: "Completed Projects", icon: "check_circle", description: "100% done" },
  { id: "in-progress", label: "In Progress", icon: "schedule", description: "Tasks pending" }
];

export default function Projects() {
  const { user } = useAuth();
  const location = useLocation();
  const filterRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // Auto-open modal if navigated from sidebar
  useEffect(() => {
    if (location.state?.openModal) {
      setModalOpen(true);
    }
  }, [location.state]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };

    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterOpen]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get("/projects");
      setProjects(response.data.data);
      applyFilter("all", response.data.data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (filterId, projectList = projects) => {
    setActiveFilter(filterId);
    setFilterOpen(false);
    
    let filtered = projectList;

    switch (filterId) {
      case "my":
        // Filter: Projects where current user is a member or creator
        filtered = projectList.filter((p) => {
          const isMember = p.members?.some((m) => m._id === user?._id);
          const isCreator = p.createdBy?._id === user?._id;
          return isMember || isCreator;
        });
        break;

      case "completed":
        // Filter: Projects where all tasks are completed (100% progress and has tasks)
        filtered = projectList.filter((p) => {
          return p.totalTasks > 0 && p.progress === 100;
        });
        break;

      case "in-progress":
        // Filter: Projects with at least one incomplete task (0 < progress < 100)
        filtered = projectList.filter((p) => {
          return p.totalTasks > 0 && p.progress > 0 && p.progress < 100;
        });
        break;

      case "all":
      default:
        // Show all projects
        filtered = projectList;
        break;
    }

    setFilteredProjects(filtered);
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
      const updatedProjects = [response.data.data, ...projects];
      setProjects(updatedProjects);
      applyFilter(activeFilter, updatedProjects);
      setForm(initialForm);
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (projectId) => {
    if (!memberEmail.trim()) {
      setMemberError("Email is required");
      return;
    }

    setMemberLoading(true);
    setMemberError("");

    try {
      const response = await api.post(`/projects/${projectId}/members/add`, { email: memberEmail });
      const updatedProjects = projects.map((project) =>
        project._id === projectId ? response.data.data : project
      );
      setProjects(updatedProjects);
      applyFilter(activeFilter, updatedProjects);
      setMemberEmail("");
      setSelectedProject(null);
    } catch (err) {
      setMemberError(err.message);
    } finally {
      setMemberLoading(false);
    }
  };

  const handleRemoveMember = async (projectId, memberId) => {
    setMemberLoading(true);
    setMemberError("");

    try {
      const response = await api.delete(`/projects/${projectId}/members/${memberId}`);
      const updatedProjects = projects.map((project) =>
        project._id === projectId ? response.data.data : project
      );
      setProjects(updatedProjects);
      applyFilter(activeFilter, updatedProjects);
    } catch (err) {
      setMemberError(err.message);
    } finally {
      setMemberLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    setLoading(true);
    try {
      await api.delete(`/projects/${projectId}`);
      const updatedProjects = projects.filter((p) => p._id !== projectId);
      setProjects(updatedProjects);
      applyFilter(activeFilter, updatedProjects);
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="mb-xl flex items-end justify-between">
        <div>
          <h1 className="mb-2 font-h1 text-h1 text-on-surface">Projects Overview</h1>
          <p className="font-body-lg text-on-surface-variant">Manage and track progress across your team's active workstreams.</p>
        </div>
        <div className="flex gap-md items-center">
          {/* Filter Button - Matches Create Button Style */}
          <div className="relative" ref={filterRef}>
            <button 
              className="flex items-center gap-2 rounded-lg border-2 border-outline px-lg py-sm font-semibold text-label-md text-on-surface transition-all hover:border-primary hover:bg-surface-container active:scale-95"
              type="button"
              onClick={() => setFilterOpen(!filterOpen)}
              title={`Current filter: ${filterOptions.find(f => f.id === activeFilter)?.label}`}
            >
              <span className="material-symbols-outlined text-sm">filter_list</span>
              <span className="hidden sm:inline">Filter</span>
              <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${filterOpen ? "rotate-180" : ""}`}>
                expand_more
              </span>
            </button>
            
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border-2 border-outline-variant bg-white shadow-xl z-50 overflow-hidden animate-in fade-in-50 duration-200">
                <div className="p-1">
                  <div className="px-4 py-3 border-b border-outline-variant">
                    <p className="text-label-sm font-semibold text-on-surface-variant">FILTER PROJECTS</p>
                  </div>
                  
                  {filterOptions.map((option) => (
                    <button
                      key={option.id}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left text-label-md font-medium transition-all rounded-lg my-0.5 ${
                        activeFilter === option.id
                          ? "bg-primary-container text-primary shadow-sm"
                          : "text-on-surface hover:bg-surface-container"
                      }`}
                      onClick={() => applyFilter(option.id)}
                    >
                      <span className="material-symbols-outlined text-sm">{option.icon}</span>
                      <div className="flex-1">
                        <div>{option.label}</div>
                        <div className="text-label-sm text-on-surface-variant mt-0.5">
                          {option.description}
                        </div>
                      </div>
                      {activeFilter === option.id && (
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Create Project Button */}
          {user?.role === "admin" && (
            <button
              className="flex items-center gap-2 rounded-lg bg-primary px-lg py-sm font-semibold text-label-md text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95"
              type="button"
              onClick={() => setModalOpen(true)}
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span className="hidden sm:inline">Create New Project</span>
              <span className="sm:hidden">Create</span>
            </button>
          )}
        </div>
      </header>

      {loading ? <StateMessage title="Loading projects" message="Fetching your workspace projects..." /> : null}
      {error ? <StateMessage title="Projects unavailable" message={error} tone="error" /> : null}
      {!loading && !error && !projects.length ? (
        <StateMessage title="No projects yet" message="Create the first project to start organizing tasks." />
      ) : null}

      {!loading && !error && projects.length ? (
        <>
          {filteredProjects.length === 0 ? (
            <StateMessage 
              title="No projects match this filter" 
              message={`Try adjusting your filter. Total projects: ${projects.length}`} 
            />
          ) : (
            <div className="grid grid-cols-1 gap-xl lg:grid-cols-4">
              <div className="lg:col-span-1">
                <MembersSection teamId={user?.teamId} />
              </div>
              <div className="lg:col-span-3">
                <div className="mb-lg flex items-center justify-between">
                  <div>
                    <p className="text-label-md text-on-surface-variant font-medium">
                      Showing <span className="font-bold text-on-surface text-label-lg">{filteredProjects.length}</span> of <span className="font-bold text-on-surface text-label-lg">{projects.length}</span> projects
                    </p>
                    {activeFilter !== "all" && (
                      <p className="text-label-sm text-primary mt-1 font-semibold">
                        ✓ Filter: {filterOptions.find(f => f.id === activeFilter)?.label}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-xl md:grid-cols-2">
                  {filteredProjects.map((project, index) => (
                    <ProjectCard key={project._id} project={project} featured={index === 0} onEdit={() => setSelectedProject(project)} onDelete={() => setDeleteConfirm(project._id)} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}

      {selectedProject && selectedProject.isOwner && (
        <section className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-gutter">
          <div className="w-full max-w-lg rounded-xl border border-outline-variant bg-white p-xl shadow-2xl">
            <div className="mb-lg flex items-center justify-between">
              <h2 className="font-h2 text-h2 text-on-surface">Manage Members</h2>
              <button className="rounded-full p-2 hover:bg-slate-50" type="button" onClick={() => setSelectedProject(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {memberError ? <div className="mb-md rounded-lg bg-error-container p-md text-label-md text-on-error-container">{memberError}</div> : null}

            <div className="mb-lg space-y-md">
              <div>
                <label className="mb-xs block text-label-md text-on-surface-variant" htmlFor="member-email">
                  Add member by email
                </label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-outline-variant bg-surface-bright px-md py-sm font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container/20"
                    id="member-email"
                    type="email"
                    placeholder="user@example.com"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                  />
                  <button
                    className="rounded-lg bg-primary px-lg py-sm font-semibold text-white disabled:opacity-60"
                    type="button"
                    onClick={() => handleAddMember(selectedProject._id)}
                    disabled={memberLoading}
                  >
                    {memberLoading ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-label-md font-semibold text-on-surface mb-2">Current Members</span>
                <div className="space-y-sm max-h-64 overflow-auto">
                  {selectedProject.members?.map((member) => (
                    <div className="flex items-center justify-between rounded-lg border border-outline-variant p-2" key={member._id}>
                      <div>
                        <div className="text-label-md font-semibold text-on-surface">{member.name}</div>
                        <div className="text-label-sm text-on-surface-variant">{member.email}</div>
                      </div>
                      {member._id !== selectedProject.createdBy._id && (
                        <button
                          className="rounded px-2 py-1 text-label-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                          type="button"
                          onClick={() => handleRemoveMember(selectedProject._id, member._id)}
                          disabled={memberLoading}
                        >
                          Remove
                        </button>
                      )}
                      {member._id === selectedProject.createdBy._id && (
                        <span className="text-label-sm text-on-surface-variant">Owner</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-gutter">
          <div className="w-full max-w-sm rounded-xl border border-outline-variant bg-white p-xl shadow-2xl">
            <h2 className="mb-md font-h2 text-h2 text-on-surface">Delete Project?</h2>
            <p className="mb-lg text-body-md text-on-surface-variant">This action cannot be undone. All tasks will be deleted.</p>
            <div className="flex gap-2">
              <button
                className="flex-1 rounded-lg border border-outline px-lg py-md font-semibold text-on-surface"
                type="button"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-lg bg-red-600 px-lg py-md font-semibold text-white disabled:opacity-60"
                type="button"
                onClick={() => handleDeleteProject(deleteConfirm)}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

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
