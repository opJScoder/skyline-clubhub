import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const badge = {
  meeting: "bg-blue-100 text-blue-700",
  deadline: "bg-red-100 text-red-700",
  "change-of-plan": "bg-amber-100 text-amber-700",
  general: "bg-slate-100 text-slate-600",
};

export default function Home() {
  const [data, setData] = useState({ items: [], pages: 1 });
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState([]);
  useEffect(() => {
    api
      .get("/announcements", { params: { page } })
      .then((r) => setData(r.data))
      .catch(() => {});
  }, [page]);
  useEffect(() => {
    api
      .get("/events")
      .then((r) =>
        setEvents(r.data.filter((e) => e.status === "published").slice(0, 3)),
      )
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">
              Skyline Student Association
            </p>
            <h1 className="max-w-xl text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Your club life, in one place.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Find what is happening, save your spot, and stay close to the
              people building the next great campus moment.
            </p>
          </div>
          <Link to="/events" className="btn shrink-0">
            Explore events{" "}
            <span className="ml-2" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </section>
      <div className="grid gap-6 md:grid-cols-3">
        <section className="space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Announcements</h2>
            <span className="text-xs font-medium uppercase tracking-wider text-sky-600">
              Stay in the loop
            </span>
          </div>
          {data.items.length === 0 && (
            <p className="text-slate-500">No announcements yet.</p>
          )}
          {data.items.map((a) => (
            <article key={a._id} className="card">
              <div className="mb-1 flex items-center gap-2">
                {a.pinned && <span title="Pinned">📌</span>}
                <span
                  className={`rounded px-2 py-0.5 text-xs ${badge[a.category]}`}
                >
                  {a.category}
                </span>
                <span className="ml-auto text-xs text-slate-400">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </div>
              <h3 className="font-semibold">{a.title}</h3>
              <p className="whitespace-pre-line text-sm text-slate-600">
                {a.body}
              </p>
              {a.authorId?.name && (
                <p className="mt-2 text-xs text-slate-400">
                  — {a.authorId.name}
                </p>
              )}
            </article>
          ))}
          {data.pages > 1 && (
            <div className="flex gap-2">
              <button
                className="btn-ghost"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </button>
              <button
                className="btn-ghost"
                disabled={page >= data.pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>
        <aside className="space-y-3">
          <h2 className="text-lg font-semibold">Upcoming events</h2>
          {events.length === 0 && (
            <p className="text-slate-500">Nothing scheduled.</p>
          )}
          {events.map((e) => (
            <Link
              key={e._id}
              to={`/events/${e._id}`}
              className="card block hover:border-indigo-300"
            >
              <p className="font-medium">{e.title}</p>
              <p className="text-xs text-slate-500">
                {new Date(e.startsAt).toLocaleString()} · {e.seatsLeft} seats
                left
              </p>
            </Link>
          ))}
        </aside>
      </div>
    </div>
  );
}
