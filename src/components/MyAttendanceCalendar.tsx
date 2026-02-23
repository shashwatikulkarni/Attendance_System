"use client";

import { useMemo, useState } from "react";
import type { Attendance } from "@/types/attendance";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import AttendanceStatsChart from "@/components/AttendanceStatsChart";

export default function MyAttendanceCalendar({
  data,
}: {
  data: Attendance[];
}) {
  const [selectedDay, setSelectedDay] = useState<Attendance | null>(null);

  const attendanceMap = useMemo(() => {
    const map = new Map<string, Attendance>();
    data.forEach((a) =>
      map.set(new Date(a.date).toDateString(), a)
    );
    return map;
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

      {/* CALENDAR */}
      <div className="bg-card rounded-xl shadow-lg p-6 flex flex-col items-center min-w-[320px] border border-border">
        <Calendar
          mode="single"
          onSelect={(date) => {
            if (!date) return;
            setSelectedDay(
              attendanceMap.get(date.toDateString()) || null
            );
          }}
          classNames={{
            day: "h-12 w-12 rounded-lg text-base border border-border hover:bg-primary/10 transition",
          }}
          modifiers={{
            present: d =>
              attendanceMap.get(d.toDateString())?.attendanceType === "Full Day",
            half: d =>
              attendanceMap.get(d.toDateString())?.attendanceType === "Half Day",
            absent: d =>
              attendanceMap.get(d.toDateString())?.attendanceType === "Absent",
          }}
          modifiersClassNames={{
            present: "bg-green-400/80 text-white font-bold border-green-500",
            half: "bg-yellow-300/80 text-yellow-900 font-bold border-yellow-400",
            absent: "bg-red-400/80 text-white font-bold border-red-500",
          }}
        />
        <div className="flex gap-3 mt-4 flex-wrap text-sm justify-center">
          <Badge className="bg-green-400/80 text-white">Present</Badge>
          <Badge className="bg-yellow-300/80 text-yellow-900">Half Day</Badge>
          <Badge className="bg-red-400/80 text-white">Absent</Badge>
        </div>
      </div>

      {/* DAY DETAILS */}
      <div className="bg-card rounded-xl shadow-lg p-6 min-w-[260px] flex flex-col border border-border">
        <h3 className="text-lg font-semibold mb-4 text-primary">Day Details</h3>
        {!selectedDay ? (
          <p className="text-muted-foreground">Select a date</p>
        ) : (
          <div className="space-y-3 text-base">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${selectedDay.attendanceType === "Full Day" ? "bg-green-400" : selectedDay.attendanceType === "Half Day" ? "bg-yellow-300" : "bg-red-400"}`}></span>
              <span className="font-semibold">{selectedDay.attendanceType}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Status</span>
              <span className="font-medium">{selectedDay.status}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Check In</span>
              <span className="font-medium">{selectedDay.startTime ?? "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Check Out</span>
              <span className="font-medium">{selectedDay.endTime ?? "—"}</span>
            </div>
          </div>
        )}
      </div>

      {/* PIE CHART */}
      <div className="flex items-center justify-center min-w-[260px]">
        <AttendanceStatsChart data={data} />
      </div>
    </div>
  );
}
