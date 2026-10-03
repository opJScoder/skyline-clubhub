import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errMsg } from "../api";

const icons = {
  user: "M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  mail: "M4 5h16v14H4zM4 7l8 5 8-5",
  lock: "M6 10h12v10H6zM8 10V7a4 4 0 0 1 8 0v3",
  phone:
    "M6 3h3l2 5-2 2a13 13 0 0 0 5 5l2-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z",
};

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  icon,
  required = true,
  hint,
}) {
  const [visible, setVisible] = useState(false);
  const inputType = type === "password" && visible ? "text" : type;
  return (
    <label className="auth-field">
      <span>
        {label}
      </span>
      <div className="auth-input-wrap">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="auth-input-icon"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={icons[icon]} />
        </svg>
        <input
          className="auth-input"
          name={name}
          type={inputType}
          value={value || ""}
          required={required}
          onChange={onChange}
        />
        {type === "password" && (
          <button
            type="button"
            className="auth-visibility"
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {hint && <small>{hint}</small>}
    </label>
  );
}

function SkylineMark() {
  return <span className="auth-logo-mark">S</span>;
}

function AuthLayout({ mode, children }) {
  const login = mode === "login";
  return (
    <div className="auth-page">
      <section className="auth-form-side">
        <Link to="/" className="auth-brand">
          <SkylineMark /> Skyline ClubHub
        </Link>
        <div className="auth-form-content">
          <div className="auth-eyebrow">
            <span /> {login ? "Welcome back" : "Join the club"}
          </div>
          <h1>
            {login
              ? "Pick up where you left off."
              : "Make campus feel smaller."}
          </h1>
          <p className="auth-subtitle">
            {login
              ? "Your events, membership, and campus community are waiting."
              : "Create your free account and find your people, your events, and your next story."}
          </p>
          {children}
        </div>
        <p className="auth-legal">
          Skyline Student Association <span>•</span> Made for campus life
        </p>
      </section>
      <section className="auth-visual-side">
        <div className="auth-grid-pattern" />
        <div className="auth-visual-copy">
          <p className="auth-visual-kicker">THE CLUBHOUSE FOR CAMPUS</p>
          <h2>Show up for the moments that matter.</h2>
          <p>
            One calm space for busy clubs, bright ideas, and the people who make
            university memorable.
          </p>
        </div>
        <div className="auth-activity-card">
          <div className="auth-activity-top">
            <span className="auth-live-dot" /> Live around Skyline{" "}
            <span className="auth-activity-time">Today</span>
          </div>
          <div className="auth-activity-row">
            <span className="auth-event-icon">✦</span>
            <span>
              <strong>Open Mic Night</strong>
              <small>42 students going</small>
            </span>
            <span className="auth-arrow">↗</span>
          </div>
          <div className="auth-activity-row">
            <span className="auth-event-icon warm">◒</span>
            <span>
              <strong>Design Society</strong>
              <small>Workshop at 6:30 PM</small>
            </span>
            <span className="auth-arrow">↗</span>
          </div>
        </div>
        <div className="auth-student-note">
          <span>“</span>
          <p>Found my people in week two.</p>
          <small>— Ananya, Design Society</small>
        </div>
      </section>
    </div>
  );
}

function Form({ mode }) {
  const login = mode === "login";
  const { login: signIn, register } = useAuth();
  const nav = useNavigate();
  const [values, setValues] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (name) => (event) =>
    setValues((current) => ({ ...current, [name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await (login ? signIn(values.email, values.password) : register(values));
      nav("/");
    } catch (requestError) {
      setError(errMsg(requestError));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="auth-form" onSubmit={submit}>
      {!login && (
        <Field
          label="Full name"
          name="name"
          icon="user"
          value={values.name}
          onChange={set("name")}
        />
      )}
      <Field
        label="Email address"
        name="email"
        type="email"
        icon="mail"
        value={values.email}
        onChange={set("email")}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        icon="lock"
        value={values.password}
        onChange={set("password")}
        hint={!login ? "Use at least 8 characters" : undefined}
      />
      {!login && (
        <div className="auth-two-fields">
          <Field
            label="Phone"
            name="phone"
            icon="phone"
            required={false}
            value={values.phone}
            onChange={set("phone")}
          />
          <Field
            label="Student ID"
            name="studentId"
            icon="user"
            required={false}
            value={values.studentId}
            onChange={set("studentId")}
          />
        </div>
      )}
      {error && <p className="auth-error">{error}</p>}
      <button className="auth-submit" type="submit" disabled={busy}>
        {busy
          ? "One moment..."
          : login
            ? "Log in to ClubHub"
            : "Create my account"}
        <span>↗</span>
      </button>
      <p className="auth-switch">
        {login ? "New to Skyline?" : "Already have an account?"}{" "}
        <Link to={login ? "/register" : "/login"}>
          {login ? "Create an account" : "Log in"}
        </Link>
      </p>
    </form>
  );
}

export function Login() {
  return (
    <AuthLayout mode="login">
      <Form mode="login" />
    </AuthLayout>
  );
}
export function Register() {
  return (
    <AuthLayout mode="register">
      <Form mode="register" />
    </AuthLayout>
  );
}
