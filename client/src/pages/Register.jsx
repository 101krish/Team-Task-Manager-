import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/setup");
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
            <p className="font-body-lg text-body-lg text-on-surface-variant">Create your workspace account</p>
          </div>
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-xl shadow-[0_15px_30px_-15px_rgba(21,21,125,0.12)]">
            <h2 className="mb-lg font-h2 text-h2 text-on-surface">Create account</h2>
            {error ? <div className="mb-md rounded-lg bg-error-container p-md text-label-md text-on-error-container">{error}</div> : null}
            <form className="space-y-lg" onSubmit={handleSubmit}>
              {[
                { name: "name", label: "Full Name", icon: "person", type: "text", placeholder: "Alex Morgan" },
                { name: "email", label: "Email Address", icon: "mail", type: "email", placeholder: "name@company.com" },
                { name: "password", label: "Password", icon: "lock", type: "password", placeholder: "••••••••" }
              ].map((field) => (
                <div className="space-y-xs" key={field.name}>
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor={field.name}>
                    {field.label}
                  </label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-md text-outline group-focus-within:text-primary">
                      <span className="material-symbols-outlined">{field.icon}</span>
                    </div>
                    <input
                      className="block w-full rounded-lg border border-outline-variant bg-surface-bright py-md pl-[44px] pr-md font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container/20"
                      id={field.name}
                      name={field.name}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required
                      type={field.type}
                      value={form[field.name]}
                    />
                  </div>
                </div>
              ))}
              <p className="rounded-lg bg-surface-container p-md text-label-md text-on-surface-variant">
                The first registered account becomes admin. Later signups are members and can be added to projects by an admin.
              </p>
              <button
                className="flex w-full items-center justify-center gap-sm rounded-lg bg-primary px-lg py-md font-h3 text-label-md text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Account"}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>
            <div className="mt-xl border-t border-outline-variant pt-lg text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Already have an account?{" "}
                <Link className="font-label-md text-primary decoration-2 underline-offset-4 hover:underline" to="/login">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
