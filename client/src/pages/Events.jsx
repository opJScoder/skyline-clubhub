import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { inr } from "../api";

export default function Events() {
  const [events, setEvents] = useState(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("upcoming");
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/events")
      .then((r) => setEvents(r.data))
      .catch(() =>
        setError(
          "Events are taking a little longer to load. Please try again.",
        ),
      );
  }, []);
  if (!events && !error)
    return (
      <div className="space-y-5">
        <div className="h-8 w-40 animate-pulse rounded bg-sky-100" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-48 animate-pulse rounded-xl bg-sky-50" />
          <div className="h-48 animate-pulse rounded-xl bg-sky-50" />
        </div>
      </div>
    );
  const now = Date.now();
  const visible = (events || []).filter((e) => {
    const matchesQuery = `${e.title} ${e.venue}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesView =
      view === "all" ||
      (view === "sold"
        ? e.seatsLeft === 0
        : e.status === "published" && new Date(e.startsAt).getTime() >= now);
    return matchesQuery && matchesView;
  });
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
            Find your next thing
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Events on campus
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Small rooms, big nights, and a few good reasons to leave your desk.
          </p>
        </div>
        <label className="relative w-full sm:w-64">
          <span className="sr-only">Search events</span>
          <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">
            ⌕
          </span>
          <input
            className="input pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events or venues"
          />
        </label>
      </section>
      <div className="flex flex-wrap items-center gap-2 border-b border-sky-100 pb-3 dark:border-slate-800">
        {[
          ["upcoming", "Upcoming"],
          ["all", "All events"],
          ["sold", "Sold out"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            className={view === key ? "btn" : "btn-ghost"}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">
          {visible.length} {visible.length === 1 ? "event" : "events"}
        </span>
      </div>
      {error && (
        <div className="card border-red-100 bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}
      {!error && visible.length === 0 && (
        <div className="card py-12 text-center">
          <p className="text-2xl">✦</p>
          <h2 className="mt-3 font-semibold">Nothing matches that search.</h2>
          <p className="mt-1 text-sm text-slate-500">
            Try another name or check back soon for the next campus moment.
          </p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map((e) => {
          const date = new Date(e.startsAt);
          const price = e.yourPrice ?? e.memberPrice ?? e.nonMemberPrice;
          return (
            <Link
              key={e._id}
              to={`/events/${e._id}`}
              className="card group block"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sky-50 text-center text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  <b className="text-lg leading-none">{date.getDate()}</b>
                  <span className="text-[9px] font-bold uppercase">
                    {date.toLocaleString("en", { month: "short" })}
                  </span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${e.seatsLeft === 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}
                >
                  {e.seatsLeft === 0 ? "Sold out" : `${e.seatsLeft} seats left`}
                </span>
              </div>
              <h2 className="text-lg font-semibold transition-colors group-hover:text-sky-700">
                {e.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {date.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}{" "}
                · {e.venue || "Skyline campus"}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-sky-50 pt-4 text-sm dark:border-slate-800">
                <span className="font-medium text-sky-700 dark:text-sky-300">
                  {inr(price)}{" "}
                  <span className="font-normal text-slate-400">
                    student price
                  </span>
                </span>
                <span className="font-semibold text-slate-400 transition-transform group-hover:translate-x-1">
                  View event →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
