import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(135deg,#f8f9ff_0%,#e5eeff_100%)] font-body-md text-on-background">
      <main className="flex flex-grow items-center justify-center p-gutter">
        <div className="w-full max-w-md">
          <div className="mb-xl text-center">
            <div className="mb-md inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container text-on-primary">
              <span className="material-symbols-outlined">task_alt</span>
            </div>
            <h1 className="mb-xs font-h1 text-h1 text-primary">TaskFlow</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Streamline your team's productivity</p>
          </div>
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-xl shadow-[0_15px_30px_-15px_rgba(21,21,125,0.12)]">
            <h2 className="mb-lg font-h2 text-h2 text-on-surface">Welcome back</h2>
            {error ? <div className="mb-md rounded-lg bg-error-container p-md text-label-md text-on-error-container">{error}</div> : null}
            <form className="space-y-lg" onSubmit={handleSubmit}>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">
                  Email Address
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-md text-outline group-focus-within:text-primary">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <input
                    className="block w-full rounded-lg border border-outline-variant bg-surface-bright py-md pl-[44px] pr-md font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container/20"
                    id="email"
                    name="email"
                    onChange={handleChange}
                    placeholder="name@company.com"
                    required
                    type="email"
                    value={form.email}
                  />
                </div>
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">
                  Password
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-md text-outline group-focus-within:text-primary">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                  <input
                    className="block w-full rounded-lg border border-outline-variant bg-surface-bright py-md pl-[44px] pr-md font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container/20"
                    id="password"
                    name="password"
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    type="password"
                    value={form.password}
                  />
                </div>
              </div>
              <button
                className="flex w-full items-center justify-center gap-sm rounded-lg bg-primary px-lg py-md font-h3 text-label-md text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>
            <div className="mt-xl border-t border-outline-variant pt-lg text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Don't have an account?{" "}
                <Link className="font-label-md text-primary decoration-2 underline-offset-4 hover:underline" to="/register">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
