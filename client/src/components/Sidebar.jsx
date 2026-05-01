import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/projects", label: "Projects", icon: "folder_shared" }
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white pb-4 pt-16 text-sm font-medium tracking-tight text-indigo-900">
      <div className="flex items-center gap-3 px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-sm font-black text-white">TF</div>
        <div>
          <h3 className="text-[13px] font-black leading-tight text-indigo-900">{user?.name || "TaskFlow User"}</h3>
          <p className="text-[11px] uppercase tracking-widest text-slate-500">{user?.role || "member"}</p>
        </div>
      </div>
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 transition-all ${
                isActive
                  ? "rounded-md border-l-4 border-indigo-900 bg-slate-50 text-indigo-900"
                  : "text-slate-500 hover:bg-slate-50 hover:text-indigo-700"
              }`
            }
          >
            <span className="material-symbols-outlined">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4">
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 font-semibold text-white transition-all hover:bg-primary-container active:scale-95"
          type="button"
          onClick={() => navigate("/projects", { state: { openModal: true } })}
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Project
        </button>
      </div>
      <div className="mt-auto space-y-1 px-3">
        <button className="flex w-full items-center gap-3 px-4 py-2 text-slate-500 transition-all hover:text-indigo-700" type="button">
          <span className="material-symbols-outlined">contact_support</span>
          Support
        </button>
        <button
          className="flex w-full items-center gap-3 px-4 py-2 text-slate-500 transition-all hover:text-indigo-700"
          type="button"
          onClick={handleLogout}
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
