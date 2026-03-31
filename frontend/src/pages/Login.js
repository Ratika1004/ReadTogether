import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", form);
      login(res.data.token, res.data.user);
      navigate("/feed");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <span className="card-eyebrow">Welcome Back</span>
          <h2 className="title">Sign In</h2>
        </div>

        <div className="divider">
          <span className="divider-dot" />
        </div>

        <form onSubmit={handleSubmit} className="form">
          {error && <p className="form-error">{error}</p>}

          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="input"
              autoComplete="email"
              required
            />
            <span className="input-line" />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="input"
              autoComplete="current-password"
              required
            />
            <span className="input-line" />
          </div>

          <div className="button-wrap">
            <button type="submit" className="button" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </div>
        </form>

        <p className="card-footer">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;