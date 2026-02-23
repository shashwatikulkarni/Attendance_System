import DashboardMenu from "@/components/DashboardMenu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DashboardMenu />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
