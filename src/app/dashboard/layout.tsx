"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Users,
  BarChart3,
  CalendarDays,
  LogOut,
  Menu,
  X,
} from "lucide-react";

type Role =
  | "superAdmin"
  | "HR"
  | "CXO/HR"
  | "techManager"
  | "employee"
  | "intern";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [role, setRole] = useState<Role | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const load = async () => {
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
    };

    load();
  }, [router]);

  /* ================= LOGOUT ================= */
  const logout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

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
    <div className="flex min-h-screen bg-gray-50 text-gray-800">

      {/* ================= MOBILE OVERLAY ================= */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed lg:static z-50 top-0 left-0 h-full w-64 bg-white border-r p-6
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* MOBILE HEADER */}
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <h2 className="font-semibold text-lg">Menu</h2>
          <button onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
        </div>

        {/* DESKTOP TITLE */}
        <h2 className="text-lg font-semibold mb-8 hidden lg:block">
          {role === "superAdmin"
            ? "Admin Panel"
            : role === "techManager"
            ? "Manager Panel"
            : "Dashboard"}
        </h2>

        {/* ================= NAV ITEMS ================= */}

        <NavItem
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          active={pathname === "/dashboard"}
          onClick={() => {
            router.push("/dashboard");
            setSidebarOpen(false);
          }}
        />

        <NavItem
          icon={<User size={18} />}
          label="My Profile"
          active={pathname === "/dashboard/profile"}
          onClick={() => {
            router.push("/dashboard/profile");
            setSidebarOpen(false);
          }}
        />

        <NavItem
          icon={<CalendarDays size={18} />}
          label="Attendance"
          active={pathname === "/dashboard/attendance"}
          onClick={() => {
            router.push("/dashboard/attendance");
            setSidebarOpen(false);
          }}
        />

        {role !== "intern" && (
          <NavItem
            icon={<Users size={18} />}
            label="Employees"
            active={pathname === "/dashboard/workers"}
            onClick={() => {
              router.push("/dashboard/workers");
              setSidebarOpen(false);
            }}
          />
        )}

        {/* ================= REPORTS (ADMIN ONLY) ================= */}
        {isAdmin && (
          <NavItem
            icon={<BarChart3 size={18} />}
            label="Reports & Analytics"
            active={pathname === "/dashboard/reports"}
            onClick={() => {
              router.push("/dashboard/reports");
              setSidebarOpen(false);
            }}
          />
        )}

        {/* ================= LOGOUT (ALL ROLES) ================= */}
        <div className="mt-6 pt-6 border-t">
          <NavItem
            icon={<LogOut size={18} />}
            label="Logout"
            onClick={logout}
            danger
          />
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col">

        {/* MOBILE TOP BAR */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <h1 className="font-semibold">Dashboard</h1>
          <div />
        </header>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ================= NAV ITEM ================= */
function NavItem({
  icon,
  label,
  onClick,
  active,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition mb-2
        ${
          danger
            ? "text-red-600 hover:bg-red-50"
            : active
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
