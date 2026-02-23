"use client";

import { useState, useEffect, useMemo } from "react";

/* ================= TYPES ================= */

type Manager = {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  role: string;
};

type Role =
  | "superAdmin"
  | "CXO/HR"
  | "techManager"
  | "employee"
  | "intern";

const ROLE_MANAGER_ALLOWED: Record<Role, Role[]> = {
  superAdmin: [],
  "CXO/HR": ["superAdmin"],
  techManager: ["CXO/HR"],
  employee: ["techManager"],
  intern: ["employee"],
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  address: string;
  mobile: string;
  emergencyContact: string;
  role: Role | "";
  managerEmpId: string;
};

export default function CreateUserModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<Manager[]>([]);

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    address: "",
    mobile: "",
    emergencyContact: "",
    role: "",
    managerEmpId: "",
  });

  const [resume, setResume] = useState<File | null>(null);
  const [photoId, setPhotoId] = useState<File | null>(null);

  /* ================= LOAD MANAGERS ================= */
  useEffect(() => {
    const loadManagers = async () => {
      try {
        const res = await fetch("/api/managers", {
          credentials: "include",
        });
        const data = await res.json();
        setManagers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load managers", error);
      }
    };

    loadManagers();
  }, []);

  /* ================= FILTER MANAGERS ================= */
  const filteredManagers = useMemo(() => {
    if (!form.role) return [];

    const allowedRoles =
      ROLE_MANAGER_ALLOWED[form.role] || [];

    return managers.filter((m) =>
      allowedRoles.includes(m.role as Role)
    );
  }, [form.role, managers]);

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "role" && { managerEmpId: "" }),
    }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(form.dob) > new Date()) {
      alert("Date of birth cannot be in the future");
      return;
    }

    if (form.role !== "superAdmin" && !form.managerEmpId) {
      alert("Please assign a manager");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) =>
      formData.append(key, value)
    );

    if (resume) formData.append("resume", resume);
    if (photoId) formData.append("photoId", photoId);

    const res = await fetch("/api/signup", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "User creation failed");
      setLoading(false);
      return;
    }

    alert(
      `User Created Successfully\n\nEmployee ID: ${data.employeeId}\nPassword: ${data.defaultPassword}`
    );

    setLoading(false);
    onSuccess();
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 rounded-t-2xl">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Create New Account
          </h2>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <ModernInput label="First Name" name="firstName" required onChange={handleChange} />
          <ModernInput label="Last Name" name="lastName" required onChange={handleChange} />
          <ModernInput label="Email ID" name="email" type="email" required onChange={handleChange} />
          <ModernInput label="DOB" name="dob" type="date" max={today} required onChange={handleChange} />

          <ModernTextarea label="Address" name="address" onChange={handleChange} />
          <ModernInput label="Mobile No" name="mobile" onChange={handleChange} />
          <ModernInput label="Emergency Contact" name="emergencyContact" onChange={handleChange} />

          <ModernSelect
            label="Assign Role"
            name="role"
            required
            value={form.role}
            onChange={handleChange}
            options={[
              "superAdmin",
              "CXO/HR",
              "techManager",
              "employee",
              "intern",
            ]}
          />

          {form.role && form.role !== "superAdmin" && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                Assign Manager
              </label>
              <select
                name="managerEmpId"
                value={form.managerEmpId}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select Manager</option>
                {filteredManagers.map((m) => (
                  <option key={m._id} value={m.employeeId}>
                    {m.firstName} {m.lastName} ({m.employeeId})
                  </option>
                ))}
              </select>
            </div>
          )}

          <ModernFile
            label="Resume"
            onChange={(e) =>
              setResume(e.target.files?.[0] || null)
            }
          />

          <ModernFile
            label="Photo ID"
            onChange={(e) =>
              setPhotoId(e.target.files?.[0] || null)
            }
          />

          <div className="md:col-span-2 flex flex-col sm:flex-row justify-between gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 rounded-lg border"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-2 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= FIELD COMPONENTS ================= */

function ModernInput({
  label,
  ...props
}: {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <input {...props} className="border rounded-lg px-3 py-2 text-sm" />
    </div>
  );
}

function ModernTextarea({
  label,
  ...props
}: {
  label: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="flex flex-col gap-1 md:col-span-2">
      <label className="text-sm font-medium">{label}</label>
      <textarea {...props} rows={3} className="border rounded-lg px-3 py-2 text-sm" />
    </div>
  );
}

function ModernSelect({
  label,
  options,
  ...props
}: {
  label: string;
  options: string[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <select {...props} className="border rounded-lg px-3 py-2 text-sm">
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function ModernFile({
  label,
  ...props
}: {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <input type="file" {...props} className="border rounded-lg px-3 py-2 text-sm" />
    </div>
  );
}
