"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LabelList,
} from "recharts";
import type { Attendance } from "@/types/attendance";

const COLORS = {
  present: "#4ade80",
  half: "#facc15",
  absent: "#f87171",
};

export default function AttendanceStatsChart({
  data,
}: {
  data: Attendance[];
}) {
  const summary = {
    present: 0,
    half: 0,
    absent: 0,
  };

  data.forEach((a) => {
    if (a.attendanceType === "Full Day") summary.present++;
    else if (a.attendanceType === "Half Day") summary.half++;
    else if (a.attendanceType === "Absent") summary.absent++;
  });

  const pieData = [
    { name: "Present", value: summary.present, key: "present" },
    { name: "Half Day", value: summary.half, key: "half" },
    { name: "Absent", value: summary.absent, key: "absent" },
  ];

  const allZero = pieData.every(d => d.value === 0);

  return (
    <div
      className={`bg-white rounded-xl shadow p-6 h-[360px] ${
        allZero ? "opacity-60" : ""
      }`}
    >
      <h3 className="text-lg font-semibold mb-4">
        Attendance Distribution
      </h3>

      <PieChart width={320} height={260}>
        <Pie
          data={pieData}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          isAnimationActive
        >
          {pieData.map((entry) => (
            <Cell
              key={entry.key}
              fill={COLORS[entry.key as keyof typeof COLORS]}
            />
          ))}

          {/* ✅ FIXED LabelList */}
          <LabelList
            dataKey="value"
            position="inside"
            formatter={(value) =>
              typeof value === "number" && value > 0 ? value : ""
            }
          />
        </Pie>

        {/* ✅ FIXED Tooltip */}
        <Tooltip
          formatter={(value, name) => {
            if (typeof value !== "number") return ["", name];
            return [value.toString(), name];
          }}
        />
      </PieChart>

      <div className="flex justify-center gap-6 mt-2 text-sm">
        <Legend color={COLORS.present} label={`Present (${summary.present})`} />
        <Legend color={COLORS.half} label={`Half Day (${summary.half})`} />
        <Legend color={COLORS.absent} label={`Absent (${summary.absent})`} />
      </div>

      {allZero && (
        <div className="text-center text-gray-400 mt-2">
          No attendance data yet
        </div>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </div>
  );
}
