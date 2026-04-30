import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const placeholderByPath = {
  "/projects": "Search projects..."
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/login");
  };

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
        <div className="group relative">
          <button 
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-primary text-xs font-bold text-white hover:bg-primary-container transition-colors" 
            type="button" 
            title={user?.email}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {initials || "TF"}
          </button>
          <div className={`absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg ${dropdownOpen ? 'block' : 'hidden'}`}>
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <p className="mt-1 text-xs font-medium text-primary uppercase tracking-widest">{user?.role}</p>
            </div>
            <button
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              type="button"
              onClick={handleLogout}
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
