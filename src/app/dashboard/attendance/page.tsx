"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import AttendanceTable from "@/components/AttendanceTable";
import AttendanceHistoryModal from "@/components/AttendanceHistoryModal";
import { History } from "lucide-react";

type Role =
  | "superAdmin"
  | "HR"
  | "CXO/HR"
  | "techManager"
  | "employee"
  | "intern";

export default function AttendancePage() {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:30");
  const [endTime, setEndTime] = useState("18:30");
  const [submitting, setSubmitting] = useState(false);

  /* ================= LOAD ROLE ================= */
  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        setRole(data.role);
      }

      setLoading(false);
    };

    load();
  }, []);

  /* ================= HELPERS ================= */
  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const formatDate = (d: Date) =>
    d.toISOString().split("T")[0];

  /* ================= MARK ATTENDANCE ================= */
  const markAttendance = async () => {
    if (!date) return alert("Select a date");

    const today = new Date();
    const selectedDate = new Date(date);

    if (selectedDate > today)
      return alert("Cannot mark attendance for future date.");

    const nowMinutes =
      today.getHours() * 60 + today.getMinutes();

    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);

    if (startMinutes >= endMinutes)
      return alert("Check-out must be after Check-in.");

    const isToday =
      selectedDate.toDateString() ===
      today.toDateString();

    if (isToday) {
      if (startMinutes > nowMinutes)
        return alert("Check-in cannot be in the future.");

      if (endMinutes > nowMinutes)
        return alert("Check-out cannot be in the future.");
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/attendance", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formatDate(selectedDate),
          startTime,
          endTime,
          type: "present",
        }),
      });

      const data = await res.json();

      if (!res.ok)
        return alert(data.error || "Failed");

      alert("Attendance marked successfully");
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= MARK LEAVE ================= */
  const markLeave = async () => {
    if (!date) return alert("Select a date");

    const today = new Date();
    const selectedDate = new Date(date);

    if (selectedDate > today)
      return alert("Cannot mark leave for future date.");

    try {
      setSubmitting(true);

       const dateString = selectedDate
     .toISOString()
      .split("T")[0];

      const res = await fetch("/api/attendance", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: dateString,
        startTime,         
        endTime,
        leave: false,
        }),
      });

      const data = await res.json();

      if (!res.ok)
        return alert(data.error || "Failed");

      alert("Leave marked successfully");
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  const isApprover =
    role === "superAdmin" ||
    role === "CXO/HR" ||
    role === "techManager";

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Attendance Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Mark attendance and review team approvals.
        </p>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 items-start">

        {/* LEFT CARD */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm w-[380px]">
          <h2 className="text-base font-semibold mb-4 text-center">
            Select Attendance
          </h2>

          <div className="flex flex-col items-center">

            {/* Calendar */}
            <div className="w-[260px]">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                disabled={{ after: new Date() }}
                className="w-full"
              />
            </div>

            {/* Time Row */}
            <div className="flex gap-4 mt-5 justify-center">
              <div className="w-[130px]">
                <label className="text-xs font-medium">
                  Check In
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) =>
                    setStartTime(e.target.value)
                  }
                  className="w-full mt-1 rounded-md border px-2 py-1 text-xs"
                />
              </div>

              <div className="w-[130px]">
                <label className="text-xs font-medium">
                  Check Out
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) =>
                    setEndTime(e.target.value)
                  }
                  className="w-full mt-1 rounded-md border px-2 py-1 text-xs"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-5 justify-center">
              <Button
                onClick={markAttendance}
                disabled={submitting}
                className="w-[130px] h-8 text-xs"
              >
                {submitting
                  ? "Processing..."
                  : "Mark Attendance"}
              </Button>

              <Button
                onClick={markLeave}
                disabled={submitting}
                className="w-[130px] h-8 text-xs bg-rose-500 hover:bg-rose-600"
              >
                Mark Leave
              </Button>
            </div>

            {/* View History */}
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() =>
                  setShowHistoryModal(true)
                }
                className="h-8 text-xs"
              >
                <History className="w-3 h-3 mr-1" />
                View History
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT CARD */}
        {isApprover && (
          <div className="rounded-2xl border bg-card p-6 shadow-sm min-h-[500px]">
            <h2 className="text-lg font-semibold mb-4">
              Team Approvals
            </h2>

            <AttendanceTable />
          </div>
        )}
      </div>

      {showHistoryModal && (
        <AttendanceHistoryModal
          onClose={() =>
            setShowHistoryModal(false)
          }
        />
      )}
    </div>
  );
}


