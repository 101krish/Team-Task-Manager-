import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const statusStyles = {
  Active: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  Planning: "bg-indigo-100 text-indigo-800 border border-indigo-200",
  Empty: "bg-slate-100 text-slate-700 border border-slate-200"
};

export default function ProjectCard({ project, featured = false, onEdit, onDelete }) {
  const { user } = useAuth();
  const memberCount = project.members?.length || 0;
  const progress = project.progress || 0;
  const totalTasks = project.totalTasks || 0;
  const completedTasks = project.completedTasks || 0;
  const status = totalTasks ? "Active" : "Planning";
  
  // Check if current user is the project owner
  const isOwner = project.createdBy?._id === user?._id;

  const handleActionClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link
      to={`/task/${project._id}`}
      className={`group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-lg shadow-sm transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02] ${
        featured ? "lg:col-span-2" : ""
      }`}
    >
      <div>
        <div className="mb-md flex items-start justify-between">
          <span className={`rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[status]}`}>
            {status}
          </span>
          {isOwner && (
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={handleActionClick}>
              <button
                className="rounded p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 hover:scale-110"
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
                className="rounded p-2 text-slate-400 transition-all hover:bg-red-50 hover:text-red-600 hover:scale-110"
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
        <h3 className={`${featured ? "font-h2 text-h2" : "font-h3 text-h3"} mb-sm text-indigo-900 group-hover:text-indigo-700`}>{project.name}</h3>
        <p className="mb-xl line-clamp-3 font-body-md text-on-surface-variant">
          {project.description || "No description added yet."}
        </p>
      </div>
      <div className="space-y-lg">
        <div className="flex -space-x-2">
          {(project.members || []).slice(0, 4).map((member) => (
            <div
              key={member._id || member.id}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-primary-container to-primary-fixed text-[10px] font-bold text-primary shadow-sm hover:scale-110 transition-transform"
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
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-500 shadow-sm">
              +{memberCount - 4}
            </div>
          ) : null}
        </div>
        <div>
          <div className="mb-3 flex justify-between items-center">
            <span className="text-label-md font-medium text-on-surface">Progress</span>
            <span className={`text-label-lg font-bold ${progress === 100 ? "text-emerald-600" : progress >= 50 ? "text-blue-600" : "text-amber-600"}`}>
              {progress}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div 
              className={`h-full transition-all duration-300 ${
                progress === 100 ? "bg-emerald-500" : progress >= 50 ? "bg-blue-500" : "bg-amber-500"
              }`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <div className="mt-3 text-label-sm text-on-surface-variant font-medium">
            {totalTasks === 0 ? (
              <span className="text-amber-600">📋 No tasks yet</span>
            ) : (
              <span>{completedTasks}/{totalTasks} tasks completed</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
