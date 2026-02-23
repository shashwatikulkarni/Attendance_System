"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type User = {
  role: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);

  /* 🔐 AUTH CHECK */
  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/me", { credentials: "include" });

      if (!res.ok) {
        router.replace("/login");
        return;
      }

      const data: User = await res.json();
      if (!["superAdmin", "HR", "CXO/HR"].includes(data.role)) {
        router.replace("/dashboard");
        return;
      }

      setAuthorized(true);
    };

    checkAuth();
  }, [router]);

  /* 📄 FORM STATE */
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    address: "",
    mobile: "",
    emergencyContact: "",
    role: "",
    managerName: "",
  });

  const [resume, setResume] = useState<File | null>(null);
  const [photoId, setPhotoId] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* 🚀 SUBMIT */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      if (resume) payload.append("resume", resume);
      if (photoId) payload.append("photoId", photoId);

      const res = await fetch("/api/signup", {
        method: "POST",
        credentials: "include",
        body: payload,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Signup failed");
        return;
      }

      alert(
        `User created 🎉\n\nEmployee ID: ${data.employeeId}\nPassword: ${data.defaultPassword}`
      );

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!authorized) return null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-blue-300">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
          <CardDescription>
            Employee ID & Password will be auto-generated
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input name="firstName" required onChange={handleChange} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input name="lastName" required onChange={handleChange} />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input type="email" name="email" required onChange={handleChange} />
            </div>

            <div>
              <Label>DOB</Label>
              <Input type="date" name="dob" required onChange={handleChange} />
            </div>

            <div>
              <Label>Address</Label>
              <Input name="address" onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mobile No</Label>
                <Input name="mobile" onChange={handleChange} />
              </div>
              <div>
                <Label>Emergency Contact No</Label>
                <Input name="emergencyContact" onChange={handleChange} />
              </div>
            </div>

            <div>
              <Label>Assign Role</Label>
              <select
                name="role"
                required
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="">Select Role</option>
                <option value="CXO/HR">CXO / HR</option>
                <option value="techManager">Tech Manager</option>
                <option value="employee">Employee</option>
                <option value="intern">Intern</option>
              </select>
            </div>

            <div>
              <Label>Assign Manager</Label>
              <Input name="managerName" onChange={handleChange} />
            </div>

            <div>
              <Label>Resume (PDF / DOC / DOCX)</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label>Photo ID Proof (PNG / JPG / PDF)</Label>
              <Input
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={(e) => setPhotoId(e.target.files?.[0] || null)}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-sm text-gray-600">
          Password format: <b>DOBYEAR_EMPLOYEEID</b>
        </CardFooter>
      </Card>
    </main>
  );
}
