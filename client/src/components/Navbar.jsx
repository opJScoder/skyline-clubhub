import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ThemeIcon({ theme }) {
  return theme === "dark" ? (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.7 6.7 0 0 0 21 12.8Z"
      />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="3.5" />
      <path
        strokeLinecap="round"
        d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
      />
    </svg>
  );
}

export default function Navbar({ theme, onToggleTheme }) {
  const { user, logout } = useAuth();
  const link = ({ isActive }) =>
    `text-sm transition-colors ${isActive ? "font-semibold text-indigo-700 dark:text-indigo-300" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`;
  return (
    <header className="border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-3">
        <Link
          to="/"
          className="mr-4 flex items-center gap-2 text-lg font-bold tracking-tight text-indigo-700 dark:text-indigo-300"
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-600 text-sm text-white shadow-lg shadow-indigo-600/20">
            S
          </span>{" "}
          Skyline ClubHub
        </Link>
        <NavLink to="/" end className={link}>
          Home
        </NavLink>
        <NavLink to="/events" className={link}>
          Events
        </NavLink>
        {user && (
          <NavLink to="/membership" className={link}>
            Membership
          </NavLink>
        )}
        {user && (
          <NavLink to="/tickets" className={link}>
            My Tickets
          </NavLink>
        )}
        {user && ["volunteer", "treasurer", "admin"].includes(user.role) && (
          <NavLink to="/scanner" className={link}>
            Scanner
          </NavLink>
        )}
        {user?.role === "admin" && (
          <NavLink to="/admin" className={link}>
            Admin
          </NavLink>
        )}
        <div className="ml-auto flex items-center gap-3 text-sm">
          <button
            className="theme-toggle"
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            <ThemeIcon theme={theme} />
          </button>
          {user ? (
            <>
              <span className="hidden text-slate-500 dark:text-slate-400 sm:inline">
                {user.name} · {user.role}
              </span>
              <button className="btn-ghost" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
