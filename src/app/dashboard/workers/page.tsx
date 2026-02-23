"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Pencil,
  Trash2,
  X,
  Download,
  Users,
  UserCheck,
  UserPlus,
} from "lucide-react";

/* ---------- TYPES ---------- */
type Worker = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  dob?: string;
  employeeId: string;
  mobile?: string;
  managerName?: string;
  resume?: string;
  photoId?: string;
};

/* ---------- HELPERS ---------- */
const formatRole = (role: string) => {
  if (role === "techManager") return "Tech Manager";
  if (role === "CXO/HR") return "CXO / HR";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const roleBadge = (role: string) => {
  const base =
    "px-3 py-1 rounded-full text-xs font-medium border inline-block";
  switch (role) {
    case "intern":
      return `${base} bg-purple-100 text-purple-700 border-purple-200`;
    case "employee":
      return `${base} bg-green-100 text-green-700 border-green-200`;
    case "techManager":
      return `${base} bg-blue-100 text-blue-700 border-blue-200`;
    case "CXO/HR":
      return `${base} bg-yellow-100 text-yellow-700 border-yellow-200`;
    case "HR":
      return `${base} bg-pink-100 text-pink-700 border-pink-200`;
    default:
      return base;
  }
};

export default function WorkersPage() {
  const router = useRouter();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selected, setSelected] = useState<Worker | null>(null);
  const [editing, setEditing] = useState<Worker | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [myRole, setMyRole] = useState("");

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    const load = async () => {
      const me = await fetch("/api/me", { credentials: "include" });
      if (!me.ok) {
        router.replace("/login");
        return;
      }

      const meData = await me.json();
      setMyRole(meData.role);

      if (meData.role === "intern") {
        router.replace("/dashboard");
        return;
      }

      const res = await fetch("/api/workers", {
        credentials: "include",
      });

      const data = await res.json();
      setWorkers(Array.isArray(data) ? data : []);
    };

    load();
  }, [router]);

  /* ---------- FILTER ---------- */
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      const text = `${w.firstName} ${w.lastName} ${w.email} ${w.employeeId}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const roleOk = roleFilter ? w.role === roleFilter : true;

      return text && roleOk;
    });
  }, [workers, search, roleFilter]);

  /* ---------- STATS ---------- */
  const totalWorkers = workers.length;
  const interns = workers.filter((w) => w.role === "intern").length;
  const employees = workers.filter((w) => w.role === "employee").length;

  const canDelete = myRole !== "intern";
  const canViewDocs = ["superAdmin", "HR", "CXO/HR"].includes(myRole);

  /* ---------- DELETE ---------- */
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const res = await fetch(`/api/workers/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      alert("Failed to delete user");
      return;
    }

    setWorkers((prev) => prev.filter((w) => w._id !== id));
  };

  /* ---------- EXPORT CSV ---------- */
  const exportCSV = () => {
    const rows = [
      ["Employee ID", "Name", "Role", "Email"],
      ...filteredWorkers.map((w) => [
        w.employeeId,
        `${w.firstName} ${w.lastName}`,
        formatRole(w.role),
        w.email,
      ]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "workers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-800">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Employees</h1>
          <p className="text-sm text-gray-500">
            View and manage your team members
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700 transition"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={<Users size={18} />} label="Total Employees" value={totalWorkers} />
        <StatCard icon={<UserCheck size={18} />} label="Employees" value={employees} />
        <StatCard icon={<UserPlus size={18} />} label="Interns" value={interns} />
      </div>

      {/* FILTER */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          placeholder="Search name / email / ID"
          className="px-4 py-2 rounded-lg border bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="px-4 py-2 rounded-lg border bg-white shadow-sm"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="HR">HR</option>
          <option value="CXO/HR">CXO / HR</option>
          <option value="techManager">Tech Manager</option>
          <option value="employee">Employee</option>
          <option value="intern">Intern</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 text-left">
            <tr>
              <th className="p-4">Employee ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Role</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredWorkers.map((w) => (
              <tr key={w._id} className="border-t hover:bg-gray-50 transition">
                <td className="p-4 font-medium">{w.employeeId}</td>
                <td className="p-4">{w.firstName} {w.lastName}</td>
                <td className="p-4">
                  <span className={roleBadge(w.role)}>
                    {formatRole(w.role)}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{w.email}</td>

                <td className="p-4 flex justify-center gap-3">
                  <IconButton onClick={() => setSelected(w)}>
                    <Eye size={16} />
                  </IconButton>

                  <IconButton onClick={() => setEditing(w)}>
                    <Pencil size={16} />
                  </IconButton>

                  {canDelete && (
                    <IconButton danger onClick={() => handleDelete(w._id)}>
                      <Trash2 size={16} />
                    </IconButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODERN VIEW DRAWER */}
      {selected && (
        <Drawer onClose={() => setSelected(null)}>
          <div className="space-y-6">

            <div className="flex items-center gap-4 border-b pb-5">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-semibold">
                {selected.firstName.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {selected.firstName} {selected.lastName}
                </h2>
                <p className="text-sm text-gray-500">
                  Employee ID: {selected.employeeId}
                </p>
                <span className={roleBadge(selected.role)}>
                  {formatRole(selected.role)}
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              <InfoCard label="Email" value={selected.email} />
              <InfoCard
                label="Date of Birth"
                value={
                  selected.dob
                    ? new Date(selected.dob).toLocaleDateString()
                    : "-"
                }
              />
              {/* <InfoCard label="Mobile" value={selected.mobile || "-"} />
              <InfoCard label="Manager" value={selected.managerName || "-"} /> */}
            </div>

            {canViewDocs && (
              <div className="border-t pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Documents
                </h3>

                {selected.resume && (
                  <a
                    href={selected.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50 transition"
                  >
                    <span className="text-blue-600 font-medium">
                      📄 View Resume
                    </span>
                    <span className="text-xs text-gray-400">Open</span>
                  </a>
                )}

                {selected.photoId && (
                  <a
                    href={selected.photoId}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50 transition"
                  >
                    <span className="text-blue-600 font-medium">
                      🪪 View Photo ID
                    </span>
                    <span className="text-xs text-gray-400">Open</span>
                  </a>
                )}
              </div>
            )}

          </div>
        </Drawer>
      )}
      

       {/* EDIT MODAL */}
{editing && (
  <Modal onClose={() => setEditing(null)}>
    <h2 className="text-lg font-semibold mb-4">
      Edit Worker
    </h2>

    <div className="space-y-3">

      <input
        className="border p-2 w-full rounded"
        placeholder="First Name"
        value={editing.firstName}
        onChange={(e) =>
          setEditing({ ...editing, firstName: e.target.value })
        }
      />

      <input
        className="border p-2 w-full rounded"
        placeholder="Last Name"
        value={editing.lastName}
        onChange={(e) =>
          setEditing({ ...editing, lastName: e.target.value })
        }
      />

      <input
        className="border p-2 w-full rounded"
        placeholder="Email"
        value={editing.email}
        onChange={(e) =>
          setEditing({ ...editing, email: e.target.value })
        }
      />

      <input
        type="date"
        className="border p-2 w-full rounded"
        value={editing.dob ? editing.dob.substring(0, 10) : ""}
        onChange={(e) =>
          setEditing({ ...editing, dob: e.target.value })
        }
      />

      <select
        className="border p-2 w-full rounded"
        value={editing.role}
        onChange={(e) =>
          setEditing({ ...editing, role: e.target.value })
        }
      >
        <option value="HR">HR</option>
        <option value="CXO/HR">CXO / HR</option>
        <option value="techManager">Tech Manager</option>
        <option value="employee">Employee</option>
        <option value="intern">Intern</option>
      </select>

      <div className="flex justify-end gap-3 pt-3">
        <button
          onClick={() => setEditing(null)}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            const res = await fetch(`/api/workers/${editing._id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify(editing),
            });

            if (!res.ok) {
              alert("Update failed");
              return;
            }

            const data = await res.json();

            setWorkers((prev) =>
              prev.map((w) =>
                w._id === editing._id ? data.user : w
              )
            );

            setEditing(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </div>
    </div>
  </Modal>
)}
 



    </div>
  );
}


/* ---------- COMPONENTS ---------- */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h3 className="text-xl font-semibold mt-1">{value}</h3>
      </div>
      <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
        {icon}
      </div>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-md border transition ${
        danger
          ? "hover:bg-red-50 text-red-600 border-red-200"
          : "hover:bg-gray-100 border-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

function Drawer({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
      <div className="w-full max-w-md bg-white p-6 shadow-xl overflow-y-auto">
        <div className="flex justify-end mb-4">
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl relative">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
}



function InfoCard({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}
