"use client";

import CreateUserModal from "@/components/CreateUserModal";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReportsAnalytics from "@/components/ReportsAnalytics";
import { Button } from "@/components/ui/button";

/* ---------- TYPES ---------- */
type Role =
  | "superAdmin"
  | "CXO/HR"
  | "techManager"
  | "employee"
  | "intern";

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showCreateUser, setShowCreateUser] = useState(false);

  /* ---------- LOAD USER ---------- */
  useEffect(() => {
    const load = async () => {
      const me = await fetch("/api/me", { credentials: "include" });
      if (!me.ok) {
        router.replace("/login");
        return;
      }

      const meData = await me.json();
      setRole(meData.role);

      if (["superAdmin", "CXO/HR"].includes(meData.role)) {
        const usersRes = await fetch("/api/workers", {
          credentials: "include",
        });
        const users = await usersRes.json();
        setTotalUsers(Array.isArray(users) ? users.length : 0);
      }
    };

    load();
  }, [router]);

  if (!role) {
    return (
      <div className="h-96 flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  const isAdmin = role === "superAdmin" || role === "CXO/HR";

  return (
    <>
      {/* ✅ CREATE USER MODAL */}
      {showCreateUser && (
        <CreateUserModal
          onClose={() => setShowCreateUser(false)}
          onSuccess={() => setShowCreateUser(false)}
        />
      )}

      {/* 🔘 HEADER ACTION */}
      {isAdmin && (
        <div className="flex justify-end mb-6 bg-blue-300 hover:bg-blue-700 text-black">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowCreateUser(true)} // ✅ THIS WAS MISSING
          >
            + Create User
          </Button>
        </div>
      )}

      {/* 📊 STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <StatCard title="Total Users" value={totalUsers} />
        <StatCard title="Active Users" value={980} />
        <StatCard title="Pending Requests" value={25} />
      </div>

      {/* 📦 CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded shadow">
          <h2 className="font-semibold text-gray-800 mb-4">
            Roles Management
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <RoleCard label="CXO / HR" />
            <RoleCard label="Tech Manager" />
            <RoleCard label="Employee" />
            <RoleCard label="Intern" />
          </div>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2 className="font-semibold text-gray-800 mb-4">
            Reports & Analytics
          </h2>
          <ReportsAnalytics />
        </div>
      </div>
    </>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white p-5 rounded shadow">
      <p className="text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function RoleCard({ label }: { label: string }) {
  return (
    <div className="bg-gray-50 p-4 rounded border hover:shadow transition text-center">
      <p className="font-medium text-gray-800">{label}</p>
    </div>
  );
}
