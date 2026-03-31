import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

// ── Step 1: Enter name / email / password ────────────────
function SignupForm({ onOTPSent, loading, setLoading }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await API.post("/auth/signup/request-otp", form);
      onOTPSent(form.email);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card-header">
        <span className="card-eyebrow">Welcome</span>
        <h2 className="title">Create Account</h2>
      </div>

      <div className="divider"><span className="divider-dot" /></div>

      <form onSubmit={handleSubmit} className="form">
        {error && <p className="form-error">{error}</p>}

        <div className="input-group">
          <label className="input-label" htmlFor="name">Full Name</label>
          <input id="name" name="name" placeholder="Your name"
            value={form.name} onChange={handleChange}
            className="input" autoComplete="name" required />
          <span className="input-line" />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="email">Email Address</label>
          <input id="email" name="email" type="email" placeholder="you@example.com"
            value={form.email} onChange={handleChange}
            className="input" autoComplete="email" required />
          <span className="input-line" />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" placeholder="••••••••"
            value={form.password} onChange={handleChange}
            className="input" autoComplete="new-password" minLength={6} required />
          <span className="input-line" />
        </div>

        <div className="button-wrap">
          <button type="submit" className="button" disabled={loading}>
            {loading ? "Sending code…" : "Send Verification Code"}
          </button>
        </div>
      </form>

      <p className="card-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </>
  );
}

// ── Step 2: Enter OTP ────────────────────────────────────
function OTPForm({ email, loading, setLoading }) {
  const [otp, setOtp]     = useState("");
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/signup/verify-otp", { email, otp });
      login(res.data.token, res.data.user);
      navigate("/feed");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setError("");
      setResent(false);
      // Re-trigger OTP — user must go back since we don't have password here
      setError("Please go back and submit the form again to resend your code.");
    } catch {
      setError("Failed to resend. Please go back and try again.");
    }
  };

  return (
    <>
      <div className="card-header">
        <span className="card-eyebrow">Verification</span>
        <h2 className="title">Check Your Email</h2>
      </div>

      <div className="divider"><span className="divider-dot" /></div>

      <p className="otp-hint">
        We sent a 6-digit code to <strong>{email}</strong>.<br />
        It expires in 10 minutes.
      </p>

      <form onSubmit={handleVerify} className="form">
        {error && <p className="form-error">{error}</p>}
        {resent && <p className="form-success">Code resent!</p>}

        <div className="input-group">
          <label className="input-label" htmlFor="otp">Verification Code</label>
          <input
            id="otp"
            name="otp"
            placeholder="000000"
            value={otp}
            onChange={(e) => {
              setError("");
              // Only allow digits, max 6
              const val = e.target.value.replace(/\D/g, "").slice(0, 6);
              setOtp(val);
            }}
            className="input otp-input"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
          />
          <span className="input-line" />
        </div>

        <div className="button-wrap">
          <button type="submit" className="button" disabled={loading || otp.length < 6}>
            {loading ? "Verifying…" : "Verify & Create Account"}
          </button>
        </div>
      </form>

      <p className="card-footer">
        Didn't get the code?{" "}
        <button className="resend-btn" onClick={handleResend}>
          Go back
        </button>
      </p>
    </>
  );
}

// ── Main Signup component ────────────────────────────────
function Signup() {
  const [step, setStep]       = useState("form"); // "form" | "otp"
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleOTPSent = (submittedEmail) => {
    setEmail(submittedEmail);
    setStep("otp");
  };

  return (
    <div className="container">
      <div className="card">
        {step === "form" && (
          <SignupForm
            onOTPSent={handleOTPSent}
            loading={loading}
            setLoading={setLoading}
          />
        )}
        {step === "otp" && (
          <OTPForm
            email={email}
            loading={loading}
            setLoading={setLoading}
          />
        )}
      </div>
    </div>
  );
}

export default Signup;