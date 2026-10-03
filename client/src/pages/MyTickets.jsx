import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import api from '../api';

function Ticket({ t }) {
  const [src, setSrc] = useState('');
  useEffect(() => { QRCode.toDataURL(t.ticketCode, { width: 200, margin: 1 }).then(setSrc); }, [t.ticketCode]);
  return (
    <div className="card flex items-center gap-4">
      {src && <img src={src} alt="Ticket QR" className="h-32 w-32" />}
      <div>
        <p className="font-semibold">{t.eventId?.title}</p>
        <p className="text-sm text-slate-500">{t.eventId && new Date(t.eventId.startsAt).toLocaleString()} · {t.eventId?.venue}</p>
        <p className="mt-1 font-mono text-xs text-slate-400">{t.ticketCode}</p>
        <p className={`mt-1 text-sm ${t.checkedIn ? 'text-slate-400' : 'text-green-600'}`}>{t.checkedIn ? 'Used' : 'Valid'}</p>
      </div>
    </div>
  );
}

export default function MyTickets() {
  const [tickets, setTickets] = useState(null);
  useEffect(() => { api.get('/tickets/mine').then(r => setTickets(r.data)); }, []);
  if (!tickets) return <p>Loading…</p>;
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">My Tickets</h1>
      {tickets.length === 0 && <p className="text-slate-500">No tickets yet.</p>}
      {tickets.map(t => <Ticket key={t._id} t={t} />)}
    </div>
  );
}
