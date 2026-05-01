import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Layout() {
  const { user, updateUser } = useAuth();

  // Refresh user's team info on mount (after joining/creating team)
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        // Try to get the user's team to check if they have one
        const teamResponse = await api.get("/teams");
        if (teamResponse.data.data?.team && !user?.teamId) {
          // User has a team but it's not in their context - update it
          const updatedUser = {
            ...user,
            teamId: teamResponse.data.data.team._id
          };
          updateUser(updatedUser);
          console.log("✓ Updated user context with team info");
        }
      } catch (err) {
        // User may not have a team yet, that's okay
        console.debug("Team info not available on layout mount");
      }
    };

    if (user?.id) {
      refreshUserData();
    }
  }, []);

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
