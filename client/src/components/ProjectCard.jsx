import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const statusStyles = {
  Active: "bg-emerald-100 text-emerald-800",
  Planning: "bg-indigo-100 text-indigo-800",
  Empty: "bg-slate-100 text-slate-700"
};

export default function ProjectCard({ project, featured = false, onEdit, onDelete }) {
  const { user } = useAuth();
  const memberCount = project.members?.length || 0;
  const progress = project.progress || 0;
  const status = project.totalTasks ? "Active" : "Planning";
  
  // Check if current user is the project owner
  const isOwner = project.createdBy?._id === user?._id;

  const handleActionClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link
      to={`/task/${project._id}`}
      className={`group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-lg shadow-sm transition-all hover:border-indigo-900 hover:shadow-md ${
        featured ? "lg:col-span-2" : ""
      }`}
    >
      <div>
        <div className="mb-md flex items-start justify-between">
          <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[status] || statusStyles.Empty}`}>
            {status}
          </span>
          {isOwner && (
            <div className="flex gap-1" onClick={handleActionClick}>
              <button
                className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit?.();
                }}
                title="Edit project members"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
              <button
                className="rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete?.();
                }}
                title="Delete project"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          )}
          {!isOwner && (
            <span className="material-symbols-outlined text-slate-400 transition-colors group-hover:text-slate-600">folder_shared</span>
          )}
        </div>
        <h3 className={`${featured ? "font-h2 text-h2" : "font-h3 text-h3"} mb-sm text-indigo-900`}>{project.name}</h3>
        <p className="mb-xl line-clamp-3 font-body-md text-on-surface-variant">
          {project.description || "No description added yet."}
        </p>
      </div>
      <div className="space-y-lg">
        <div className="flex -space-x-2">
          {(project.members || []).slice(0, 4).map((member) => (
            <div
              key={member._id || member.id}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary-fixed text-[10px] font-bold text-primary"
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
          {memberCount > 4 ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-500">
              +{memberCount - 4}
            </div>
          ) : null}
        </div>
        <div>
          <div className="mb-2 flex justify-between text-label-md text-on-surface">
            <span>Progress</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-secondary" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 text-label-sm text-on-surface-variant">
            {project.completedTasks || 0}/{project.totalTasks || 0} tasks completed
          </div>
        </div>
      </div>
    </Link>
  );
}
