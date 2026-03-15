import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authApi } from "../api/client";
import logo from "../assets/logo.png";

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isRegister = mode === "register";

  const handleChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const payload = isRegister
        ? {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
          }
        : {
            email: form.email.trim(),
            password: form.password,
          };

      const response = isRegister
        ? await authApi.register(payload)
        : await authApi.login(payload);

      if (isRegister) {
        if (response?.data?.token) {
          onAuthenticated(response.data);
          return;
        }

        setNotice(
          response?.data?.message ||
            "Registration submitted. Wait for admin approval before login.",
        );
        setMode("login");
        setForm({ name: "", email: form.email.trim(), password: "" });
        return;
      }

      onAuthenticated(response.data);
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand-row">
          <img src={logo} alt="DRT logo" className="auth-logo-image" />
          <h1 className="auth-title">FleetPulse DRT</h1>
        </div>
        <p className="auth-subtitle">
          Sign in to access fleet maintenance intelligence.
        </p>

        <div className="auth-tabs">
          <button
            className={`btn ${!isRegister ? "btn-primary" : "btn-secondary"}`}
            onClick={() => {
              setMode("login");
              setError("");
              setNotice("");
            }}
            type="button"
          >
            Login
          </button>
          <button
            className={`btn ${isRegister ? "btn-primary" : "btn-secondary"}`}
            onClick={() => {
              setMode("register");
              setError("");
              setNotice("");
            }}
            type="button"
          >
            Register
          </button>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          {isRegister ? (
            <div className="form-field">
              <label className="form-label" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className="form-control"
                value={form.name}
                onChange={handleChange("name")}
                required
              />
            </div>
          ) : null}

          <div className="form-field">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={handleChange("email")}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={form.password}
                onChange={handleChange("password")}
                minLength={6}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error ? <div className="auth-error">{error}</div> : null}
          {notice ? <div className="auth-notice">{notice}</div> : null}

          <div className="form-actions">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isRegister
                  ? "Create Account"
                  : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
