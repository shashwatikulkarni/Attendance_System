"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  dob: string;
  role: string;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function BirthdayCalendarDashboard() {
  const today = new Date();

  const [users, setUsers] = useState<User[]>([]);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [loading, setLoading] = useState(true);

  const confettiPlayed = useRef(false);

  /* ---------- FETCH ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/birthdays", {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ---------- BIRTHDAY MAP ---------- */
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const birthdaysByDate: Record<number, User[]> = {};
  users.forEach(u => {
    const d = new Date(u.dob);
    if (d.getUTCMonth() === month) {
      birthdaysByDate[d.getUTCDate()] ??= [];
      birthdaysByDate[d.getUTCDate()].push(u);
    }
  });

  const todayBirthdays = users.filter(u => {
    const d = new Date(u.dob);
    return (
      d.getUTCDate() === today.getDate() &&
      d.getUTCMonth() === today.getMonth()
    );
  });

  /* ---------- CONFETTI ---------- */
  useEffect(() => {
    if (confettiPlayed.current) return;
    if (todayBirthdays.length > 0) {
      confetti({ particleCount: 250, spread: 100, origin: { y: 0.6 } });
      confettiPlayed.current = true;
    }
  }, [todayBirthdays]);

  if (loading) {
    return <div className="text-gray-500">Loading birthdays…</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow p-8 w-full">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold flex gap-2">
          🎂 Birthday Calendar
        </h2>

        <div className="flex gap-4">
          <select
            value={year}
            onChange={e => setYear(+e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            {[year - 1, year, year + 1].map(y => (
              <option key={y}>{y}</option>
            ))}
          </select>

          <select
            value={month}
            onChange={e => setMonth(+e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 2xl:grid-cols-[3fr_1.2fr] gap-10">

        {/* CALENDAR */}
        <div>
          <div className="grid grid-cols-7 text-center font-semibold text-gray-500 mb-4">
            {DAYS.map(d => <div key={d}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-5">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={i} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = i + 1;
              const isToday =
                date === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

              return (
                <div
                  key={date}
                  className={`rounded-2xl border p-4 min-h-[120px] ${
                    isToday
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="font-semibold text-gray-700 text-right">
                    {date}
                  </div>

                  <div className="space-y-2 mt-3">
                    {(birthdaysByDate[date] || []).map(u => (
                      <div
                        key={u._id}
                        className="bg-purple-100 text-purple-800 rounded-lg px-3 py-1 text-sm"
                      >
                        🎉 {u.firstName}
                        <div className="text-xs text-gray-500">
                          {u.role}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TODAY PANEL */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 h-fit">
          <h3 className="font-semibold text-lg text-purple-700 mb-6">
            🎉 Today’s Birthdays
          </h3>

          {todayBirthdays.length === 0 ? (
            <p className="text-gray-500 text-center">
              No birthdays today 🎂
            </p>
          ) : (
            <div className="space-y-4">
              {todayBirthdays.map(u => (
                <div
                  key={u._id}
                  className="bg-white rounded-xl p-4 shadow flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-full bg-purple-200 flex items-center justify-center text-lg font-bold text-purple-700">
                    {u.firstName[0]}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {u.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
