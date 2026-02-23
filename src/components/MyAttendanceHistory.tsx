"use client";

import { useEffect, useState } from "react";
import MyAttendanceCalendar from "@/components/MyAttendanceCalendar";
import { Button } from "@/components/ui/button";
import type { Attendance } from "@/types/attendance";
import { motion } from "framer-motion";

export default function AttendanceHistoryModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/attendance/my-calendar", {
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Dashboard stats
  const total = data.length;
  const present = data.filter(a => a.attendanceType === "Full Day").length;
  const half = data.filter(a => a.attendanceType === "Half Day").length;
  const absent = data.filter(a => a.attendanceType === "Absent").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-6xl mx-2 md:mx-8 border border-border"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-2xl font-bold shadow">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <h2 className="text-2xl font-bold tracking-tight">Attendance Dashboard</h2>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-2xl">✕</Button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 pt-8">
          <div className="rounded-xl bg-gradient-to-br from-primary/90 to-primary/60 text-primary-foreground shadow p-5 flex flex-col items-center">
            <span className="text-3xl font-bold">{total}</span>
            <span className="text-xs font-medium opacity-80 mt-1">Total Days</span>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-green-400/80 to-green-600/80 text-white shadow p-5 flex flex-col items-center">
            <span className="text-3xl font-bold">{present}</span>
            <span className="text-xs font-medium opacity-80 mt-1">Present</span>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-yellow-300/80 to-yellow-500/80 text-yellow-900 shadow p-5 flex flex-col items-center">
            <span className="text-3xl font-bold">{half}</span>
            <span className="text-xs font-medium opacity-80 mt-1">Half Day</span>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-red-400/80 to-red-600/80 text-white shadow p-5 flex flex-col items-center">
            <span className="text-3xl font-bold">{absent}</span>
            <span className="text-xs font-medium opacity-80 mt-1">Absent</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground text-lg">Loading attendance…</p>
            </div>
          ) : (
            <MyAttendanceCalendar data={data} />
          )}
        </div>
      </motion.div>
    </div>
  );
}
