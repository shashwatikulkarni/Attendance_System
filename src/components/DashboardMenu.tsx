"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardMenu() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const getMe = async () => {
      const res = await fetch("/api/me");

      if (!res.ok) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      setRole(data.role);
    };

    getMe();
  }, [router]);

  if (!role) return null; // or loading spinner

  return (
    <aside className="w-60 bg-slate-900 text-white p-4 flex flex-col gap-4">
      <Button variant="ghost" onClick={() => router.push("/dashboard")}>
        Dashboard
      </Button>

      {/* ✅ ONLY SUPERADMIN CAN SEE THIS */}
      {role === "superadmin" && (
        <Button
          variant="ghost"
          onClick={() => router.push("/signup")}
        >
          Create User
        </Button>
      )}

      <Button
        variant="ghost"
        onClick={() => router.push("/teams")}
      >
        My Team
      </Button>

      <Button
        variant="ghost"
        onClick={() => router.push("/logout")}
      >
        Logout
      </Button>
    </aside>
  );
}
