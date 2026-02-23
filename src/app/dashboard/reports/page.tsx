"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Users,
  TrendingUp,
  CalendarCheck,
  ShieldCheck,
  Download,
  FileText,
  ChevronDown,
} from "lucide-react";

/* ---------- TYPES ---------- */

type MonthlySignup = {
  month: string;
  users: number;
};

type MonthlyAttendance = {
  month: string;
  approved: number;
  rejected: number;
  pending: number;
};

type RoleCount = {
  _id: string;
  count: number;
};

/* ---------- COLORS ---------- */

const COLORS = {
  blue: "#2563eb",
  green: "#16a34a",
  amber: "#f59e0b",
  red: "#ef4444",
  purple: "#7c3aed",
};

const PIE_COLORS = [
  COLORS.blue,
  COLORS.green,
  COLORS.amber,
  COLORS.purple,
];

/* ---------- COMPONENT ---------- */

export default function ReportsPage() {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [monthly, setMonthly] = useState<MonthlySignup[]>([]);
  const [roles, setRoles] = useState<RoleCount[]>([]);
  const [attendanceMonthly, setAttendanceMonthly] =
    useState<MonthlyAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------- FETCH DATA ---------- */

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const res = await fetch(`/api/analytics?year=${year}`, {
        credentials: "include",
      });

      const data = await res.json();

      setMonthly(data.monthlySignups || []);
      setRoles(data.roleWise || []);
      setAttendanceMonthly(data.monthlyAttendance || []);

      setLoading(false);
    };

    load();
  }, [year]);

  /* ---------- KPIs ---------- */

  const totalUsers = roles.reduce((sum, r) => sum + r.count, 0);

  const totalAttendance = attendanceMonthly.reduce(
    (sum, m) => sum + m.approved + m.pending + m.rejected,
    0
  );

  const approvedAttendance = attendanceMonthly.reduce(
    (sum, m) => sum + m.approved,
    0
  );

  const approvalRate =
    totalAttendance === 0
      ? 0
      : Math.round((approvedAttendance / totalAttendance) * 100);

  /* ---------- EXPORT CSV ---------- */

  const exportCSV = () => {
    const rows = [
      ["Year", String(year)],
      [],
      ["Month", "Users"],
      ...monthly.map((m) => [m.month, String(m.users)]),
      [],
      ["Role", "Count"],
      ...roles.map((r) => [r._id, String(r.count)]),
      [],
      ["Month", "Approved", "Pending", "Rejected"],
      ...attendanceMonthly.map((m) => [
        m.month,
        String(m.approved),
        String(m.pending),
        String(m.rejected),
      ]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `reports_${year}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  /* ---------- EXPORT PDF ---------- */

  const exportPDF = () => {
    const doc = new jsPDF();
    let currentY = 20;

    doc.setFontSize(18);
    doc.text(`Reports & Analytics (${year})`, 14, currentY);
    currentY += 10;

    autoTable(doc, {
      startY: currentY,
      head: [["Month", "Users"]],
      body: monthly.map((m) => [m.month, m.users]),
    });

    autoTable(doc, {
      head: [["Role", "Count"]],
      body: roles.map((r) => [r._id, r.count]),
    });

    autoTable(doc, {
      head: [["Month", "Approved", "Pending", "Rejected"]],
      body: attendanceMonthly.map((m) => [
        m.month,
        m.approved,
        m.pending,
        m.rejected,
      ]),
    });

    doc.save(`reports_${year}.pdf`);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-muted-foreground">
        Loading reports...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ---------- HEADER ---------- */}

      <header className="border-b bg-card/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Year-wise system insights
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="appearance-none bg-secondary border rounded-xl px-4 py-2 pr-10 text-sm"
              >
                {[currentYear - 2, currentYear - 1, currentYear].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" />
            </div>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary"
            >
              <Download className="h-4 w-4" /> CSV
            </button>

            <button
              onClick={exportPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white"
            >
              <FileText className="h-4 w-4" /> PDF
            </button>
          </div>
        </div>
      </header>

      {/* ---------- MAIN ---------- */}

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPI SECTION */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KpiCard title="Total Users" value={totalUsers} icon={<Users />} />
          <KpiCard title="Attendance" value={totalAttendance} icon={<CalendarCheck />} />
          <KpiCard title="Approval Rate" value={`${approvalRate}%`} icon={<ShieldCheck />} />
          <KpiCard title="Growth" value="+19%" icon={<TrendingUp />} />
        </div>

        {/* CHARTS */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Monthly User Signups">
            <AreaChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="users"
                stroke={COLORS.blue}
                fill={COLORS.blue}
                fillOpacity={0.2}
              />
            </AreaChart>
          </ChartCard>

          <ChartCard title="Users by Role">
            <PieChart>
              <Pie
                data={roles}
                dataKey="count"
                nameKey="_id"
                outerRadius={90}
              >
                {roles.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ChartCard>
        </div>

        <ChartCard title="Monthly Attendance Status">
          <BarChart data={attendanceMonthly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="approved" stackId="a" fill={COLORS.green} />
            <Bar dataKey="pending" stackId="a" fill={COLORS.amber} />
            <Bar dataKey="rejected" stackId="a" fill={COLORS.red} />
          </BarChart>
        </ChartCard>
      </main>
    </div>
  );
}

/* ---------- REUSABLE COMPONENTS ---------- */

function KpiCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-card rounded-2xl shadow p-6 flex items-center justify-between"
    >
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className="text-primary">{icon}</div>
    </motion.div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-card rounded-2xl shadow p-6 h-80"
    >
      <h2 className="font-semibold mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </motion.div>
  );
}
