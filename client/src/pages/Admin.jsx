import { useEffect, useState } from 'react';
import api, { errMsg, inr } from '../api';

const toPaise = r => Math.round(parseFloat(r || 0) * 100);

function Msg({ m }) {
  return m ? <p role={m.err ? 'alert' : 'status'} aria-live="polite" className={`rounded border px-3 py-2 text-sm ${m.err ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-800'}`}>{m.text}</p> : null;
}

function ConfirmDialog({ title, message, busy, onCancel, onConfirm }) {
  if (!title) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
      <section className="w-full max-w-md space-y-4 rounded-lg bg-white p-5 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div>
          <h2 id="confirm-title" className="text-lg font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-slate-600">{message}</p>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" disabled={busy} onClick={onCancel}>Keep it</button>
          <button type="button" className="rounded border border-red-200 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50" disabled={busy} onClick={onConfirm}>
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </section>
    </div>
  );
}

function EventsTab() {
  const blank = { title: '', description: '', venue: '', startsAt: '', capacity: 100, memberPrice: '', nonMemberPrice: '' };
  const [f, setF] = useState(blank); const [events, setEvents] = useState([]); const [m, setM] = useState(null);
  const [notice, setNotice] = useState(null); const [confirmTarget, setConfirmTarget] = useState(null); const [deleting, setDeleting] = useState(false);
  const load = () => api.get('/events').then(r => setEvents(r.data));
  useEffect(() => { load(); }, []);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const create = async e => {
    e.preventDefault();
    try {
      await api.post('/events', { ...f, capacity: +f.capacity, memberPrice: toPaise(f.memberPrice), nonMemberPrice: toPaise(f.nonMemberPrice), startsAt: new Date(f.startsAt).toISOString() });
      setF(blank); setM({ text: 'Event created (draft)' }); load();
    } catch (x) { setM({ err: 1, text: errMsg(x) }); }
  };
  const setStatus = async (id, status) => { await api.put(`/events/${id}`, { status }); load(); };
  const remove = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/events/${confirmTarget.id}`);
      setConfirmTarget(null); setNotice({ text: 'Event deleted' }); load();
    } catch (x) {
      setConfirmTarget(null);
      setNotice({ err: 1, text: x.response?.status === 404 ? 'The backend has not loaded the delete route. Restart the server and try again.' : errMsg(x) });
    } finally { setDeleting(false); }
  };
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={create} className="card space-y-2">
        <h2 className="font-semibold">New event</h2>
        <input className="input" placeholder="Title" required value={f.title} onChange={set('title')} />
        <textarea className="input" placeholder="Description" value={f.description} onChange={set('description')} />
        <input className="input" placeholder="Venue" value={f.venue} onChange={set('venue')} />
        <input className="input" type="datetime-local" required value={f.startsAt} onChange={set('startsAt')} />
        <div className="grid grid-cols-3 gap-2">
          <input className="input" type="number" min="1" placeholder="Seats" required value={f.capacity} onChange={set('capacity')} />
          <input className="input" type="number" min="0" step="0.01" placeholder="Member ₹" required value={f.memberPrice} onChange={set('memberPrice')} />
          <input className="input" type="number" min="0" step="0.01" placeholder="Non-member ₹" required value={f.nonMemberPrice} onChange={set('nonMemberPrice')} />
        </div>
        <button className="btn">Create</button><Msg m={m} />
      </form>
      <div className="space-y-2">
        <h2 className="font-semibold">All events</h2>
        <Msg m={notice} />
        {events.map(e => (
          <div key={e._id} className="card flex items-center justify-between gap-2 text-sm">
            <div><p className="font-medium">{e.title}</p><p className="text-xs text-slate-500">{e.status} · {e.soldCount} sold · {inr(e.memberPrice)}/{inr(e.nonMemberPrice)}</p></div>
            <div className="flex gap-1">
              {e.status === 'draft' && <button className="btn" onClick={() => setStatus(e._id, 'published')}>Publish</button>}
              {e.status === 'published' && <button className="btn-ghost" onClick={() => setStatus(e._id, 'cancelled')}>Cancel</button>}
              <button className="btn-ghost text-red-600" onClick={() => setConfirmTarget({ id: e._id, title: e.title })}>Delete</button>
            </div>
          </div>))}
      </div>
      <ConfirmDialog title={confirmTarget ? `Delete “${confirmTarget.title}”?` : ''} message="Events with ticket orders or tickets cannot be deleted. Cancel those events instead." busy={deleting} onCancel={() => setConfirmTarget(null)} onConfirm={remove} />
    </div>
  );
}

function AnnouncementsTab() {
  const [f, setF] = useState({ title: '', body: '', category: 'general', pinned: false }); const [m, setM] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [notice, setNotice] = useState(null); const [confirmTarget, setConfirmTarget] = useState(null); const [deleting, setDeleting] = useState(false);
  const load = () => api.get('/announcements', { params: { limit: 50 } }).then(r => setAnnouncements(r.data.items));
  useEffect(() => { load(); }, []);
  const send = async e => {
    e.preventDefault();
    try { await api.post('/announcements', f); setF({ title: '', body: '', category: 'general', pinned: false }); setM({ text: 'Published. Emails are being sent in the background.' }); load(); }
    catch (x) { setM({ err: 1, text: errMsg(x) }); }
  };
  const remove = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/announcements/${confirmTarget.id}`);
      setConfirmTarget(null); setNotice({ text: 'Announcement deleted' }); load();
    } catch (x) {
      setConfirmTarget(null);
      setNotice({ err: 1, text: x.response?.status === 404 ? 'The backend has not loaded the delete route. Restart the server and try again.' : errMsg(x) });
    } finally { setDeleting(false); }
  };
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={send} className="card space-y-2">
        <h2 className="font-semibold">New announcement</h2>
        <input className="input" placeholder="Title" required value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
        <textarea className="input h-32" placeholder="Message" required value={f.body} onChange={e => setF({ ...f, body: e.target.value })} />
        <div className="flex items-center gap-3">
          <select className="input w-auto" value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>
            {['general', 'meeting', 'deadline', 'change-of-plan'].map(c => <option key={c}>{c}</option>)}
          </select>
          <label className="text-sm"><input type="checkbox" checked={f.pinned} onChange={e => setF({ ...f, pinned: e.target.checked })} /> Pin</label>
        </div>
        <button className="btn">Publish & email members</button><Msg m={m} />
      </form>
      <div className="space-y-2">
        <h2 className="font-semibold">All announcements</h2>
        <Msg m={notice} />
        {announcements.map(a => (
          <div key={a._id} className="card flex items-center justify-between gap-2 text-sm">
            <div><p className="font-medium">{a.title}</p><p className="text-xs text-slate-500">{a.category} · {new Date(a.createdAt).toLocaleDateString()}</p></div>
            <button className="btn-ghost text-red-600" onClick={() => setConfirmTarget({ id: a._id, title: a.title })}>Delete</button>
          </div>))}
        {!announcements.length && <p className="text-sm text-slate-500">No announcements yet.</p>}
      </div>
      <ConfirmDialog title={confirmTarget ? `Delete “${confirmTarget.title}”?` : ''} message="This removes the announcement from the site. Emails already sent to members cannot be recalled." busy={deleting} onCancel={() => setConfirmTarget(null)} onConfirm={remove} />
    </div>
  );
}

function MembersTab() {
  const [q, setQ] = useState(''); const [users, setUsers] = useState([]);
  const load = () => api.get('/users', { params: { q } }).then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);
  const setRole = async (id, role) => { await api.put(`/users/${id}/role`, { role }); load(); };
  return (
    <div className="space-y-3">
      <form className="flex gap-2" onSubmit={e => { e.preventDefault(); load(); }}>
        <input className="input" placeholder="Search name or email" value={q} onChange={e => setQ(e.target.value)} /><button className="btn">Search</button>
      </form>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Name</th><th>Email</th><th>Membership</th><th>Role</th></tr></thead>
          <tbody>{users.map(u => (
            <tr key={u._id} className="border-t"><td className="p-3">{u.name}</td><td>{u.email}</td><td>{u.membershipStatus}</td>
              <td><select className="rounded border px-1" value={u.role} onChange={e => setRole(u._id, e.target.value)}>
                {['member', 'volunteer', 'treasurer', 'admin'].map(r => <option key={r}>{r}</option>)}</select></td></tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsTab() {
  const [s, setS] = useState(null); const [m, setM] = useState(null);
  useEffect(() => { api.get('/settings').then(r => setS({ duesAmount: r.data.duesAmount / 100, memberDiscountPercent: r.data.memberDiscountPercent, membershipExpiryDate: r.data.membershipExpiryDate.slice(0, 10) })); }, []);
  if (!s) return <p>Loading…</p>;
  const save = async e => {
    e.preventDefault();
    try { await api.put('/settings', { duesAmount: toPaise(s.duesAmount), memberDiscountPercent: +s.memberDiscountPercent, membershipExpiryDate: s.membershipExpiryDate }); setM({ text: 'Saved' }); }
    catch (x) { setM({ err: 1, text: errMsg(x) }); }
  };
  return (
    <form onSubmit={save} className="card mx-auto max-w-sm space-y-2">
      <h2 className="font-semibold">Club settings</h2>
      <label className="block text-sm">Dues (₹)<input className="input mt-1" type="number" min="0" step="0.01" value={s.duesAmount} onChange={e => setS({ ...s, duesAmount: e.target.value })} /></label>
      <label className="block text-sm">Membership expiry date<input className="input mt-1" type="date" value={s.membershipExpiryDate} onChange={e => setS({ ...s, membershipExpiryDate: e.target.value })} /></label>
      <label className="block text-sm">Member merch discount %<input className="input mt-1" type="number" min="0" max="100" value={s.memberDiscountPercent} onChange={e => setS({ ...s, memberDiscountPercent: e.target.value })} /></label>
      <button className="btn">Save</button><Msg m={m} />
    </form>
  );
}

const TABS = { Events: EventsTab, Announcements: AnnouncementsTab, Members: MembersTab, Settings: SettingsTab };
export default function Admin() {
  const [tab, setTab] = useState('Events'); const Tab = TABS[tab];
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Admin Panel</h1>
      <div className="flex gap-2">{Object.keys(TABS).map(t => <button key={t} onClick={() => setTab(t)} className={t === tab ? 'btn' : 'btn-ghost'}>{t}</button>)}</div>
      <Tab />
    </div>
  );
}
