import { useEffect, useState } from "react";
import api from "../services/api";

export default function MembersSection({ teamId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/teams/members");
        setMembers(response.data.data.members);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load team members");
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchMembers();
    }
  }, [teamId]);

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-md">
      <h3 className="mb-md font-semibold text-on-surface">Team Members</h3>
      
      {error ? (
        <p className="text-sm text-error">{error}</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-on-surface-variant">No team members</p>
      ) : (
        <div className="space-y-sm">
          <div className="text-xs text-on-surface-variant mb-md">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </div>
          {members.map((member) => (
            <div key={member._id} className="flex items-center gap-2 p-sm rounded-md hover:bg-surface-container transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-on-primary-container text-xs font-bold">
                {member.name
                  ?.split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface truncate">{member.name}</p>
                <p className="text-xs text-on-surface-variant truncate">{member.email}</p>
              </div>
              <span className="text-xs font-semibold text-primary px-2 py-1 rounded-full bg-primary-container">
                {member.role === "admin" ? "Admin" : "Member"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
