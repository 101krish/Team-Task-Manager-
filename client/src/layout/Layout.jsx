import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface">
      <Navbar />
      <Sidebar />
      <main className="ml-64 min-h-[calc(100vh-57px)] p-xl">
        <div className="mx-auto max-w-[1440px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
