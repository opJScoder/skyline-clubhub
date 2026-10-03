import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { inr } from '../api';

export default function Events() {
  const [events, setEvents] = useState(null);
  useEffect(() => { api.get('/events').then(r => setEvents(r.data)); }, []);
  if (!events) return <p>Loading…</p>;
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Events</h1>
      {events.length === 0 && <p className="text-slate-500">No events yet.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {events.map(e => (
          <Link key={e._id} to={`/events/${e._id}`} className="card hover:border-indigo-300">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold">{e.title}</h2>
              {e.status !== 'published' && <span className="rounded bg-slate-100 px-2 text-xs">{e.status}</span>}
            </div>
            <p className="text-sm text-slate-500">{new Date(e.startsAt).toLocaleString()} · {e.venue}</p>
            <p className="mt-2 text-sm">{e.seatsLeft === 0 ? <span className="text-red-600">Sold out</span> : `${e.seatsLeft} seats left`} · <b>{inr(e.yourPrice)}</b></p>
          </Link>))}
      </div>
    </div>
  );
}
