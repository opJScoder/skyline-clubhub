import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RANK = { member: 0, volunteer: 1, treasurer: 2, admin: 3 };

// roles: explicit allow-list. The server enforces the same rules; this only hides UI.
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-6">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <p className="p-6">You don't have access to this page.</p>;
  return children;
}
export const VOLUNTEER_PLUS = ['volunteer', 'treasurer', 'admin'];
export { RANK };
