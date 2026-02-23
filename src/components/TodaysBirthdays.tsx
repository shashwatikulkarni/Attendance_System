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

export default function TodaysBirthdays() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const confettiPlayed = useRef(false);

  const today = new Date();

  /* ---------- FETCH LIVE DATA ---------- */
  useEffect(() => {
    const fetchBirthdays = async () => {
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

    fetchBirthdays();
  }, []);

  /* ---------- FILTER TODAY'S BIRTHDAYS (TIMEZONE SAFE) ---------- */
  const todayBirthdays = users.filter(user => {
    const dob = new Date(user.dob);
    return (
      dob.getUTCDate() === today.getDate() &&
      dob.getUTCMonth() === today.getMonth()
    );
  });

  /* ---------- CONFETTI ---------- */
  useEffect(() => {
    if (confettiPlayed.current) return;

    if (todayBirthdays.length > 0) {
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 },
      });
      confettiPlayed.current = true;
    }
  }, [todayBirthdays]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500">Loading birthdays…</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow w-full">
      <h2 className="text-lg font-semibold text-purple-700 mb-6 flex items-center gap-2">
        🎉 Today’s Birthdays
      </h2>

      {todayBirthdays.length === 0 ? (
        <p className="text-gray-500 text-center py-6">
          🎂 No birthdays today
        </p>
      ) : (
        <div className="space-y-4">
          {todayBirthdays.map(user => (
            <div
              key={user._id}
              className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-4"
            >
              {/* Avatar */}
              <div className="h-12 w-12 rounded-full bg-purple-200 flex items-center justify-center text-lg font-bold text-purple-700">
                {user.firstName[0]}
              </div>

              {/* Info */}
              <div>
                <p className="font-semibold text-gray-800">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
