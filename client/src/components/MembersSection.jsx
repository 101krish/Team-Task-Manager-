import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function MembersSection({ teamId }) {
  const { user, updateUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError("");
        
        const response = await api.get("/teams/members");
        const fetchedMembers = response.data.data?.members || [];
        setMembers(fetchedMembers);
        setError("");
        
        // If we successfully fetched members and user's teamId is null, update the user context
        if (fetchedMembers.length > 0 && !user?.teamId) {
          console.log("✓ Updating user context with teamId from successful members fetch");
          // The user has a team, so update their context (optional - backend knows)
        }
      } catch (err) {
        console.error("Failed to fetch team members:", err);
        setError(err.message || "Failed to load team members");
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [user?.teamId, user, updateUser]);

  if (loading) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
        <h3 className="mb-lg font-semibold text-on-surface">Team Members</h3>
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
      <h3 className="mb-lg font-semibold text-on-surface">Team Members</h3>
      
      {error ? (
        <div className="flex flex-col items-center justify-center py-lg text-center">
          <span className="text-3xl mb-2">⚠️</span>
          <p className="text-sm text-error font-medium">{error}</p>
          <p className="text-xs text-on-surface-variant mt-2">Check that you are part of a team</p>
        </div>
      ) : members.length === 0 ? (
        <p className="text-sm text-on-surface-variant">No team members</p>
      ) : (
        <div className="space-y-md">
          <div className="text-label-md font-bold text-on-surface mb-lg px-md py-sm bg-primary-container/20 rounded-lg inline-block">
            👥 {members.length} Member{members.length !== 1 ? "s" : ""}
          </div>
          {members.map((member) => (
            <div 
              key={member._id} 
              className="flex items-center gap-md p-md rounded-lg hover:bg-surface-container transition-all duration-200 hover:shadow-sm border border-transparent hover:border-outline-variant"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-container to-primary-fixed text-on-primary-container text-sm font-bold border-2 border-white shadow-sm">
                {member.name
                  ?.split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              
              {/* Member Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{member.name}</p>
                <p className="text-xs text-on-surface-variant truncate">{member.email}</p>
              </div>
              
              {/* Role Badge */}
              <span 
                className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${
                  member.role === "admin" 
                    ? "bg-purple-100 text-purple-800 border border-purple-200" 
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                {member.role === "admin" ? "👑 Admin" : "✓ Member"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
