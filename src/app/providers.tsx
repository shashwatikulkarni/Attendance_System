"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return document.documentElement.classList.contains("light")
      ? "light"
      : "dark";
  });

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() =>
            setTheme((prev) =>
              prev === "dark" ? "light" : "dark"
            )
          }
          className="rounded-full p-2 shadow bg-card border border-border hover:bg-accent transition"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
      </div>

      {children}
    </>
  );
}
