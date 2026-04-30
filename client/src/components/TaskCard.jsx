const statusLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done"
};

const nextStatuses = {
  todo: ["in-progress", "done"],
  "in-progress": ["todo", "done"],
  done: ["todo", "in-progress"]
};

const priorityStyles = {
  done: "bg-secondary-container text-on-secondary-container",
  overdue: "bg-error-container text-on-error-container",
  normal: "bg-surface-container-highest text-on-surface-variant"
};

export default function TaskCard({ task, onStatusChange, updating }) {
  const isDone = task.status === "done";
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isDone;
  const initials = task.assignedTo?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const badgeStyle = isDone ? priorityStyles.done : isOverdue ? priorityStyles.overdue : priorityStyles.normal;
  const badgeLabel = isDone ? "Complete" : isOverdue ? "Overdue" : "Active";

  return (
    <div className={`group rounded-lg border border-slate-200 bg-white p-lg transition-all hover:border-l-2 hover:border-l-primary hover:shadow-lg ${isDone ? "opacity-80" : ""}`}>
      <div className="mb-md flex items-start justify-between">
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>{badgeLabel}</span>
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
          <span className="text-label-sm">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
        </div>
        <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-primary-fixed text-[10px] font-bold text-primary">
          {initials || "U"}
        </div>
      </div>
      <div className="flex flex-wrap gap-sm">
        {nextStatuses[task.status].map((status) => (
          <button
            key={status}
            className="rounded-lg border border-outline-variant px-3 py-1 text-label-sm font-semibold text-on-surface-variant transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
            type="button"
            disabled={updating}
            onClick={() => onStatusChange(task._id, status)}
          >
            {updating ? "Updating..." : `Move to ${statusLabels[status]}`}
          </button>
        ))}
      </div>
    </div>
  );
}
