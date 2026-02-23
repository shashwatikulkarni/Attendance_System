"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Activity,
  Clock,
  Plus,
} from "lucide-react";
import CreateUserModal from "@/components/CreateUserModal";
import TodaysBirthdays from "@/components/TodaysBirthdays";
import { Button } from "@/components/ui/button";

/* ---------- TYPES ---------- */
type Role =
  | "superAdmin"
  | "HR"
  | "CXO/HR"
  | "techManager"
  | "employee"
  | "intern";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
  totalUsers: 0,
  activeToday: 0,
  pendingRequests: 0,
});

  const [role, setRole] = useState<Role | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ---------- LOAD USER ---------- */
useEffect(() => {
  const load = async () => {
    try {
      const res = await fetch("/api/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        router.replace("/login");
        return;
      }

      const data = await res.json();
      setRole(data.role);

      // 🔥 Fetch dashboard stats
      const statsRes = await fetch("/api/dashboard-stats", {
        credentials: "include",
        cache: "no-store",
      });

      const statsData = await statsRes.json();

      setStats({
        totalUsers: statsData.totalUsers || 0,
        activeToday: statsData.activeToday || 0,
        pendingRequests: statsData.pendingRequests || 0,
      });

    } finally {
      setLoading(false);
    }
  };

  load();
}, [router]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  if (!role) return null;

  const isAdmin = ["superAdmin", "HR", "CXO/HR"].includes(role);
  const isManager = role === "techManager";
  const isSuperAdmin = role === "superAdmin";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ---------- HEADER ---------- */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
             HELLO👋
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Overview of people and activity
            </p>
          </div>

          {isSuperAdmin && (
            <Button
              onClick={() => setShowCreateUser(true)}
              size="default"
              className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create User
            </Button>
          )}
        </div>

        {/* ---------- CREATE USER MODAL ---------- */}
        {isSuperAdmin && showCreateUser && (
          <CreateUserModal
            onClose={() => setShowCreateUser(false)}
            onSuccess={() => {
              setShowCreateUser(false);
              router.refresh(); // refresh dashboard after user created
            }}
          />
        )}

        {/* ---------- STATS SECTION ---------- */}
        {(isAdmin || isManager) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={<Users className="w-5 h-5" />}
              badge="All roles"
              variant="blue"
            />
            <StatCard
              title="Active Today"
              value={stats.activeToday} // Replace with real API later
              icon={<Activity className="w-5 h-5" />}
              badge="Checked in"
              variant="green"
            />
            <StatCard
              title="Pending"
              value={stats.pendingRequests} // Replace with real API later
              icon={<Clock className="w-5 h-5" />}
              badge="Approvals"
              variant="amber"
            />
          </div>
        )}

        {/* ---------- 🎂 BIRTHDAY CARD ---------- */}
        <div className="bg-card border rounded-2xl shadow-sm">
          <div className="flex items-center justify-between p-6 pb-3">
            <h2 className="text-base font-semibold">
              Todays Birthdays 🎂
            </h2>
            <span className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground">
              Team
            </span>
          </div>

          <div className="px-6 pb-6">
            <TodaysBirthdays />
          </div>
        </div>

      </div>
    </div>
  );
}

/* ---------- STAT CARD COMPONENT ---------- */
function StatCard({
  title,
  value,
  icon,
  badge,
  variant = "blue",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  badge?: string;
  variant?: "blue" | "green" | "amber";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600",
  };

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          {badge && (
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
              {badge}
            </span>
          )}
        </div>
        <p className="text-3xl font-bold">{value}</p>
      </div>

      <div className={`p-3 rounded-xl ${colors[variant]}`}>
        {icon}
      </div>
    </div>
  );
}
