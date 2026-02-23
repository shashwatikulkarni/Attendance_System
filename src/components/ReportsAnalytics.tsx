"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type ChartPoint = {
  month: string;
  users: number;
  active: number;
};

type AnalyticsResponse = {
  monthlySignups: ChartPoint[];
  activeSessions: number;
  growth: string;
};

export default function ReportsAnalytics() {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeSessions: 0,
    growth: "0%",
  });
  const latestUsers =
  data && data.length > 0 ? data[data.length - 1].users : 0;

  useEffect(() => {
    const loadAnalytics = async () => {
      const res = await fetch("/api/analytics", {
        credentials: "include",
      });

      if (!res.ok) return;

      const json: AnalyticsResponse = await res.json();
      setData(json.monthlySignups);
      setMetrics({
        activeSessions: json.activeSessions,
        growth: json.growth,
      });
      setLoading(false);
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading analytics...</div>;
  }

  return (
  <div className="space-y-6">
    <div className="grid grid-cols-3 gap-4">
      <MetricCard label="Monthly Signups" value={String(latestUsers)} />
      <MetricCard label="Active Sessions" value={String(metrics.activeSessions)} />
      <MetricCard label="User Growth" value={metrics.growth} />
    </div>

      {/* CHART */}
      <div className="h-64 bg-gray-50 rounded p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#2563eb"
              strokeWidth={3}
            />
            <Line
              type="monotone"
              dataKey="active"
              stroke="#16a34a"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border rounded p-4">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
