"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/* ---------- TYPES ---------- */
type Role =
  | "superAdmin"
  | "HR"
  | "CXO/HR"
  | "techManager"
  | "employee"
  | "intern";

/* ---------- LAYOUT ---------- */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/me", { credentials: "include" });
      if (!res.ok) {
        router.replace("/login");
        return;
      }
      const data = await res.json();
      setRole(data.role);
    };
    load();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    router.replace("/login");
  };

  if (!role) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const isAdmin = ["superAdmin", "HR", "CXO/HR"].includes(role);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ---------- SIDEBAR ---------- */}
      <aside
        className={`bg-white border-r px-3 py-6 transition-all duration-300
        ${sidebarOpen ? "w-64" : "w-16"}`}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-8 text-center">
          {sidebarOpen ? "Admin Panel" : "AP"}
        </h2>

        <nav className="space-y-2 text-gray-700">
          <SidebarItem
            label="Dashboard"
            open={sidebarOpen}
            onClick={() => router.push("/dashboard")}
          />
{/* 
          {isAdmin && (
            <SidebarItem
              label="Create User"
              open={sidebarOpen}
              onClick={() => router.push("/dashboard")}
            />
          )} */}

          <SidebarItem
            label="Users"
            open={sidebarOpen}
            onClick={() => router.push("/dashboard/workers")}
          />

          <SidebarItem
            label="Reports & Analytics"
            open={sidebarOpen}
            onClick={() => router.push("/dashboard/reports")}
          />
        </nav>
      </aside>

      {/* ---------- MAIN ---------- */}
      <main className="flex-1 p-6">
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-2xl font-bold text-black"
            >
              ☰
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              {role} Panel
            </h1>
          </div>

          <Button
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>

        {children}
      </main>
    </div>
  );
}

/* ---------- SIDEBAR ITEM ---------- */
function SidebarItem({
  label,
  onClick,
  open,
}: {
  label: string;
  onClick: () => void;
  open: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded font-medium hover:bg-gray-100"
    >
      <span className="text-lg">•</span>
      {open && <span>{label}</span>}
    </button>
  );
}
