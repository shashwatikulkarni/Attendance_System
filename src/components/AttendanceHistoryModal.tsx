"use client";

import { useEffect, useState, useMemo } from "react";
import MyAttendanceCalendar from "@/components/MyAttendanceCalendar";
import { Button } from "@/components/ui/button";
import type { Attendance } from "@/types/attendance";

export default function AttendanceHistoryModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");

  /* ================= FETCH DATA ================= */
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

  /* ================= MONTH FILTER ================= */
  const filteredData = useMemo(() => {
    if (!selectedMonth) return data;

    return data.filter((item) =>
      item.date.startsWith(selectedMonth) // format: YYYY-MM
    );
  }, [data, selectedMonth]);

  /* ================= CSV DOWNLOAD ================= */
  const downloadCSV = () => {
    if (filteredData.length === 0) {
      alert("No records available");
      return;
    }

    const headers = ["Date", "Check In", "Check Out", "Status"];

    const rows = filteredData.map((item) => [
      item.date,
      item.startTime || "-",
      item.endTime || "-",
      item.attendanceType,
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = selectedMonth
      ? `attendance-${selectedMonth}.csv`
      : "attendance-history.csv";

    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl mx-4">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            📅 Attendance History
          </h2>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Month Filter */}
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded-lg px-3 py-1 text-sm"
            />

            {/* CSV Download */}
            <Button
              size="sm"
              variant="outline"
              onClick={downloadCSV}
            >
              Download CSV
            </Button>

            {/* Close */}
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <p className="text-gray-500">Loading attendance…</p>
          ) : (
            <MyAttendanceCalendar data={filteredData} />
          )}
        </div>
      </div>
    </div>
  );
}
