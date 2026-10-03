import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { errMsg, inr } from '../api';
import { useAuth } from '../context/AuthContext';
import { pay } from '../payments';

export default function EventDetail() {
  const { id } = useParams(); const nav = useNavigate();
  const { user, isActiveMember } = useAuth();
  const [ev, setEv] = useState(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const load = () => api.get(`/events/${id}`).then(r => setEv(r.data)).catch(() => setMsg('Event not found'));
  useEffect(() => { load(); }, [id, user]);

  const buy = async () => {
    if (!user) return nav('/login');
    setBusy(true); setMsg('');
    try {
      const { data: order } = await api.post(`/events/${id}/tickets/order`, { quantity: qty });
      const ok = await pay(order, ev.title, user);
      setMsg(ok ? 'Payment received! Your tickets will appear in "My Tickets" in a moment.' : 'Payment cancelled — seats are held for 10 minutes.');
      if (ok) setTimeout(() => nav('/tickets'), 1200);
    } catch (e) { setMsg(errMsg(e)); } finally { setBusy(false); load(); }
  };

  if (!ev) return <p>{msg || 'Loading…'}</p>;
  const canBuy = ev.status === 'published' && ev.seatsLeft > 0;
  return (
    <div className="card mx-auto max-w-xl space-y-3">
      <h1 className="text-xl font-semibold">{ev.title}</h1>
      <p className="text-sm text-slate-500">{new Date(ev.startsAt).toLocaleString()} · {ev.venue}</p>
      <p className="whitespace-pre-line text-sm">{ev.description}</p>
      <div className="rounded-lg bg-slate-50 p-3 text-sm">
        <p>Member price: <b>{inr(ev.memberPrice)}</b> · Non-member: <b>{inr(ev.nonMemberPrice)}</b></p>
        <p className="text-slate-500">{user ? (isActiveMember ? 'Member pricing applies to you.' : 'You pay the non-member price. Activate membership to save.') : 'Log in to buy tickets.'}</p>
        <p className="mt-1">{ev.seatsLeft === 0 ? <span className="text-red-600">Sold out</span> : `${ev.seatsLeft} seats left`}</p>
      </div>
      {canBuy && (
        <div className="flex items-center gap-3">
          <input type="number" min="1" max={Math.min(10, ev.seatsLeft)} value={qty} onChange={e => setQty(Math.max(1, +e.target.value || 1))} className="input w-20" />
          <button className="btn" disabled={busy} onClick={buy}>{busy ? 'Working…' : `Buy · ${inr(ev.yourPrice * qty)}`}</button>
        </div>)}
      {msg && <p className="text-sm text-indigo-700">{msg}</p>}
    </div>
  );
}
