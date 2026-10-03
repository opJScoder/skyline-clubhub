import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute, { VOLUNTEER_PLUS } from './components/ProtectedRoute';
import Home from './pages/Home';
import { Login, Register } from './pages/AuthPages';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import MyTickets from './pages/MyTickets';
import Membership from './pages/Membership';
import Scanner from './pages/Scanner';
import Admin from './pages/Admin';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/membership" element={<ProtectedRoute><Membership /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
          <Route path="/scanner" element={<ProtectedRoute roles={VOLUNTEER_PLUS}><Scanner /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
