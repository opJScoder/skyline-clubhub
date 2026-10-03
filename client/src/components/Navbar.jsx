import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const link = ({ isActive }) => `text-sm ${isActive ? 'font-semibold text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`;
  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-3">
        <Link to="/" className="mr-4 text-lg font-bold text-indigo-700">🎒 Skyline ClubHub</Link>
        <NavLink to="/" end className={link}>Home</NavLink>
        <NavLink to="/events" className={link}>Events</NavLink>
        {user && <NavLink to="/membership" className={link}>Membership</NavLink>}
        {user && <NavLink to="/tickets" className={link}>My Tickets</NavLink>}
        {user && ['volunteer', 'treasurer', 'admin'].includes(user.role) && <NavLink to="/scanner" className={link}>Scanner</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin" className={link}>Admin</NavLink>}
        <div className="ml-auto flex items-center gap-3 text-sm">
          {user ? (<><span className="text-slate-500">{user.name} · {user.role}</span><button className="btn-ghost" onClick={logout}>Log out</button></>)
                : (<><Link to="/login" className="btn-ghost">Log in</Link><Link to="/register" className="btn">Sign up</Link></>)}
        </div>
      </nav>
    </header>
  );
}
