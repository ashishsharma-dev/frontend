import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AdminLogin() {
  const { user, login, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  if (user && user.role === "admin") return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const ok = await login(email, password);
    setBusy(false);
    if (ok) navigate("/admin");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6" data-testid="admin-login-page">
      <div className="w-full max-w-md bg-white border border-sand-300 p-10">
        <div className="eyebrow mb-3">Editorial Access</div>
        <h1 className="font-serif text-4xl text-forest-900 mb-8">Sign in</h1>
        <form onSubmit={submit} className="space-y-4" data-testid="login-form">
          <div>
            <label className="eyebrow block mb-2">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-sand-50 border border-sand-300 px-4 py-3 focus:outline-none focus:border-sage"
              data-testid="login-email" />
          </div>
          <div>
            <label className="eyebrow block mb-2">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-sand-50 border border-sand-300 px-4 py-3 focus:outline-none focus:border-sage"
              data-testid="login-password" />
          </div>
          {error && <div className="text-sm text-red-600" data-testid="login-error">{error}</div>}
          <button disabled={busy} className="btn-primary w-full" data-testid="login-submit">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
