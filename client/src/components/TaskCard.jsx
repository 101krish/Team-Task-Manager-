const statusLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done"
};

const statusIcons = {
  todo: "assignment",
  "in-progress": "schedule",
  done: "check_circle"
};

const nextStatuses = {
  todo: ["in-progress", "done"],
  "in-progress": ["todo", "done"],
  done: ["todo", "in-progress"]
};

const priorityStyles = {
  done: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  normal: "bg-blue-100 text-blue-800"
};

export default function TaskCard({ task, onStatusChange, onDelete, updating, deleting, currentUserId }) {
  const isDone = task.status === "done";
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isDone;
  const isAssignedToCurrentUser = task.assignedTo?._id === currentUserId;
  const initials = task.assignedTo?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const badgeStyle = isDone ? priorityStyles.done : isOverdue ? priorityStyles.overdue : priorityStyles.normal;
  const badgeLabel = isDone ? "Complete" : isOverdue ? "Overdue" : "Active";

  return (
    <div className={`group rounded-lg border-2 transition-all hover:border-l-4 hover:border-l-primary hover:shadow-lg ${isDone ? "opacity-80 border-slate-200 bg-white" : isAssignedToCurrentUser ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-white"}`}>
      <div className="p-lg">
        <div className="mb-md flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-sm ${isDone ? "text-green-600" : isOverdue ? "text-red-600" : "text-blue-600"}`}>
              {statusIcons[task.status]}
            </span>
            <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
              {badgeLabel}
            </span>
            {isAssignedToCurrentUser && !isDone && (
              <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
                Assigned to you
              </span>
            )}
          </div>
          <span className="material-symbols-outlined text-[20px] text-outline-variant transition-colors group-hover:text-outline">
            {isDone ? "check_circle" : "drag_indicator"}
          </span>
        </div>
        <h3 className={`mb-sm text-[16px] font-semibold leading-snug text-on-surface ${isDone ? "line-through text-slate-400" : ""}`}>
          {task.title}
        </h3>
        {task.description ? <p className="mb-lg line-clamp-2 text-body-md text-on-surface-variant">{task.description}</p> : null}
        <div className="mb-md flex items-center justify-between">
          <div className="flex items-center gap-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            <span className={`text-label-sm ${isOverdue ? "font-semibold text-red-600" : ""}`}>
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
            </span>
          </div>
          {task.assignedTo ? (
            <div className={`flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 text-[10px] font-bold ${isAssignedToCurrentUser ? "border-indigo-400 bg-indigo-100 text-indigo-700" : "border-slate-100 bg-primary-fixed text-primary"}`} title={task.assignedTo.name}>
              {initials || "U"}
            </div>
          ) : (
            <span className="text-label-sm text-on-surface-variant">Unassigned</span>
          )}
        </div>
        <div className="flex flex-wrap gap-sm">
          {nextStatuses[task.status].map((status) => (
            <button
              key={status}
              className="rounded-lg border border-outline-variant px-3 py-1 text-label-sm font-semibold text-on-surface-variant transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
              type="button"
              disabled={updating || deleting}
              onClick={() => onStatusChange(task._id, status)}
              title={`Move to ${statusLabels[status]}`}
            >
              {updating ? (
                <>
                  <span className="material-symbols-outlined text-xs">hourglass_empty</span>
                </>
              ) : (
                `${statusLabels[status]}`
              )}
            </button>
          ))}
          {onDelete && (
            <button
              className="rounded-lg border border-red-200 px-3 py-1 text-label-sm font-semibold text-red-600 transition-colors hover:border-red-400 hover:bg-red-50 disabled:opacity-60"
              type="button"
              disabled={updating || deleting}
              onClick={() => onDelete(task._id)}
              title="Delete task"
            >
              {deleting ? (
                <span className="material-symbols-outlined text-xs">hourglass_empty</span>
              ) : (
                "Delete"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
