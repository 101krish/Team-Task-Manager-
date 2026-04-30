import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const placeholderByPath = {
  "/projects": "Search projects..."
};

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-slate-200 bg-white px-6 py-3 text-slate-700">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold text-indigo-900">TaskFlow</span>
        <div className="hidden w-80 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 md:flex">
          <span className="material-symbols-outlined text-slate-400">search</span>
          <input
            className="w-full border-none bg-transparent text-label-md focus:ring-0"
            placeholder={placeholderByPath[location.pathname] || "Search tasks..."}
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 transition-colors hover:bg-slate-50" type="button" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="rounded-full p-2 transition-colors hover:bg-slate-50" type="button" aria-label="Help">
          <span className="material-symbols-outlined">help</span>
        </button>
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-primary text-xs font-bold text-white">
          {initials || "TF"}
        </div>
      </div>
    </header>
  );
}
