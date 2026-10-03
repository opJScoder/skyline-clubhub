import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute, { VOLUNTEER_PLUS } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import { Login, Register } from "./pages/AuthPages";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import MyTickets from "./pages/MyTickets";
import Membership from "./pages/Membership";
import Scanner from "./pages/Scanner";
import Admin from "./pages/Admin";
import { useAuth } from "./context/AuthContext";

function SplashScreen() {
  return (
    <div
      className="splash-screen"
      role="status"
      aria-label="Loading Skyline ClubHub"
    >
      <div className="splash-mark">S</div>
      <p className="splash-name">Skyline ClubHub</p>
      <div className="splash-loader" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export default function App() {
  const { loading } = useAuth();
  const location = useLocation();
  const [booted, setBooted] = useState(false);
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("clubhub-theme") === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("clubhub-theme", theme);
  }, [theme]);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooted(true), 650);
    return () => window.clearTimeout(timer);
  }, []);

  if (loading || !booted) return <SplashScreen />;

  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  return (
    <div className="app-shell min-h-screen text-slate-800 transition-colors dark:text-slate-100">
      {!isAuthPage && (
        <Navbar
          theme={theme}
          onToggleTheme={() =>
            setTheme((current) => (current === "dark" ? "light" : "dark"))
          }
        />
      )}
      <main
        className={
          isAuthPage
            ? "min-h-screen"
            : "page-enter mx-auto max-w-6xl px-4 py-6 sm:px-6"
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route
            path="/membership"
            element={
              <ProtectedRoute>
                <Membership />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <MyTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scanner"
            element={
              <ProtectedRoute roles={VOLUNTEER_PLUS}>
                <Scanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}
