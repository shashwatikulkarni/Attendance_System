"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Attendance = {
  _id: string;
  userId?: {
    firstName?: string;
    lastName?: string;
    role?: string;
  };
  date: string;
  status: "pending" | "approved" | "rejected";
};

export default function AttendanceTable() {
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const params = new URLSearchParams({
        name,
        role,
        status,
        date,
      });

      const res = await fetch(
        `/api/attendance/approve?${params.toString()}`,
        { credentials: "include" }
      );

      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
      setLoading(false);
    };

    fetchData();
  }, [name, role, status, date]);

  const updateStatus = async (
    id: string,
    newStatus: "approved" | "rejected"
  ) => {
    await fetch("/api/attendance/approve", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });

    setData((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  return (
    <div className="space-y-4">

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          placeholder="Search name"
          className="border rounded-lg px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Roles</option>
          <option value="employee">Employee</option>
          <option value="intern">Intern</option>
          <option value="techManager">Tech Manager</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Data */}
      {loading ? (
        <p className="text-sm">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No records found
        </p>
      ) : (
        <div className="space-y-3">
          {data.map((a) => (
            <div
              key={a._id}
              className="flex items-center justify-between border rounded-lg px-4 py-3"
            >
              <div>
                <p className="font-medium">
                  {a.userId?.firstName && a.userId?.lastName
                    ? `${a.userId.firstName} ${a.userId.lastName}`
                    : a.userId?.firstName || "-"}
                </p>

                <p className="text-xs text-muted-foreground">
                  {a.userId?.role}
                </p>

                <p className="text-xs text-muted-foreground">
                  {new Date(a.date).toDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    a.status === "approved"
                      ? "default"
                      : a.status === "rejected"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {a.status}
                </Badge>

                <Button
                  size="sm"
                  onClick={() =>
                    updateStatus(a._id, "approved")
                  }
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Approve
                </Button>

                <Button
                  size="sm"
                  onClick={() =>
                    updateStatus(a._id, "rejected")
                  }
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
