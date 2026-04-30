import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function ChooseSetup() {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("choice"); // choice, create, join
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user || user.hasCompletedSetup) {
    navigate("/");
    return null;
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setError("Team name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/teams/create", { teamName }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local user state
      updateUser({ ...user, role: "admin", hasCompletedSetup: true });
      setTimeout(() => navigate("/"), 500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setError("Invite code is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/teams/join", { inviteCode }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local user state
      updateUser({ ...user, role: "member", hasCompletedSetup: true });
      setTimeout(() => navigate("/"), 500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(135deg,#f8f9ff_0%,#e5eeff_100%)] font-body-md text-on-background">
      <main className="flex flex-grow items-center justify-center p-gutter">
        <div className="w-full max-w-md">
          {step === "choice" && (
            <>
              <div className="mb-xl text-center">
                <div className="mb-md inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container text-on-primary">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <h1 className="mb-xs font-h1 text-h1 text-primary">Choose Setup</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Welcome, {user?.name}! How would you like to get started?
                </p>
              </div>

              <div className="space-y-md rounded-xl border border-outline-variant bg-surface-container-lowest p-xl shadow-[0_15px_30px_-15px_rgba(21,21,125,0.12)]">
                <button
                  onClick={() => setStep("create")}
                  className="w-full flex items-center justify-between rounded-lg border-2 border-primary bg-primary-container px-lg py-md text-on-primary-container transition-all hover:bg-primary hover:text-on-primary"
                >
                  <div className="text-left">
                    <p className="font-semibold">Create Team</p>
                    <p className="text-sm text-on-primary-container/80">Become an admin and lead your team</p>
                  </div>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>

                <div className="relative flex items-center gap-md">
                  <div className="flex-1 border-t border-outline-variant"></div>
                  <span className="text-label-sm text-on-surface-variant">or</span>
                  <div className="flex-1 border-t border-outline-variant"></div>
                </div>

                <button
                  onClick={() => setStep("join")}
                  className="w-full flex items-center justify-between rounded-lg border-2 border-outline px-lg py-md text-on-surface transition-all hover:bg-slate-50"
                >
                  <div className="text-left">
                    <p className="font-semibold">Join Team</p>
                    <p className="text-sm text-on-surface-variant">Enter an invite code to join an existing team</p>
                  </div>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </>
          )}

          {step === "create" && (
            <>
              <div className="mb-xl text-center">
                <button
                  onClick={() => setStep("choice")}
                  className="mb-md inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-200"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
                </button>
                <div className="mb-md inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container text-on-primary">
                  <span className="material-symbols-outlined">business</span>
                </div>
                <h1 className="mb-xs font-h1 text-h1 text-primary">Create Team</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">Start managing your projects</p>
              </div>

              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-xl shadow-[0_15px_30px_-15px_rgba(21,21,125,0.12)]">
                {error && (
                  <div className="mb-md rounded-lg bg-error-container p-md text-label-md text-on-error-container">
                    {error}
                  </div>
                )}
                <form className="space-y-lg" onSubmit={handleCreateTeam}>
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="team-name">
                      Team Name
                    </label>
                    <input
                      id="team-name"
                      type="text"
                      placeholder="Enter team name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full rounded-lg border border-outline-variant bg-surface-bright px-md py-sm font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-primary px-lg py-md font-semibold text-white transition-all disabled:opacity-60 hover:bg-primary-container"
                  >
                    {loading ? "Creating..." : "Create Team"}
                  </button>
                </form>
              </div>
            </>
          )}

          {step === "join" && (
            <>
              <div className="mb-xl text-center">
                <button
                  onClick={() => setStep("choice")}
                  className="mb-md inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-200"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
                </button>
                <div className="mb-md inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container text-on-primary">
                  <span className="material-symbols-outlined">person_add</span>
                </div>
                <h1 className="mb-xs font-h1 text-h1 text-primary">Join Team</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">Enter your invite code to join</p>
              </div>

              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-xl shadow-[0_15px_30px_-15px_rgba(21,21,125,0.12)]">
                {error && (
                  <div className="mb-md rounded-lg bg-error-container p-md text-label-md text-on-error-container">
                    {error}
                  </div>
                )}
                <form className="space-y-lg" onSubmit={handleJoinTeam}>
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="invite-code">
                      Invite Code
                    </label>
                    <input
                      id="invite-code"
                      type="text"
                      placeholder="E.g., ABC123"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      className="w-full rounded-lg border border-outline-variant bg-surface-bright px-md py-sm font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container/20 uppercase"
                      maxLength="6"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-primary px-lg py-md font-semibold text-white transition-all disabled:opacity-60 hover:bg-primary-container"
                  >
                    {loading ? "Joining..." : "Join Team"}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
