"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  BadgeCheck,
  Calendar,
  MapPin,
  Phone,
  ShieldAlert,
  Briefcase,
  Edit3,
  Activity,
  Clock,
  Award,
} from "lucide-react";

type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  role: string;
  department: string;
  joinDate: string;
  dob?: string;
  address?: string;
  mobile?: string;
  emergencyContact?: string;
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: number;
}

const InfoItem = ({ icon, label, value, delay }: InfoItemProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="flex items-start gap-3.5 p-4 rounded-xl border border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group bg-secondary/40"
  >
    <div className="mt-0.5 p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-card-foreground leading-relaxed">
        {value}
      </p>
    </div>
  </motion.div>
);

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Dynamic Stats (can later fetch from backend)
  const stats = [
    { label: "Projects", value: "24", icon: Activity },
    { label: "Experience", value: "4 yrs", icon: Clock },
    { label: "Awards", value: "7", icon: Award },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile", {
          credentials: "include",
        });

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        const data = await res.json();
        setProfile(data);
      } catch (error) {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (!profile) return null;

  const initials = `${profile.firstName[0]}${profile.lastName[0]}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient Header */}
      <div className="h-56 bg-gradient-to-r from-primary to-accent relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-16 w-64 h-64 rounded-full bg-white/5" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-28 pb-16 relative z-10">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-3xl shadow-lg p-6 sm:p-8 mb-5"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-32 h-32 rounded-3xl bg-gradient-to-r from-primary to-accent flex items-center justify-center text-4xl font-bold text-white shadow-xl -mt-20 sm:-mt-24 border-[5px] border-card"
            >
              {initials}
            </motion.div>

            {/* Name & Role */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                {profile.firstName} {profile.lastName}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 mt-2 text-muted-foreground text-sm">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  {profile.role}
                </span>
                <span className="hidden sm:inline">•</span>
                <span>{profile.department}</span>
              </div>
            </div>

            {/* Status + Edit */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-600">
                <BadgeCheck className="w-3.5 h-3.5" />
                Active
              </span>

              <button className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-200">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-7 pt-6 border-t border-border grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex p-2 rounded-xl bg-primary/5 text-primary mb-2">
                  <stat.icon className="w-4 h-4" />
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Personal Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card rounded-3xl shadow-lg p-6 sm:p-8"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">Personal Information</h2>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Joined{" "}
              {new Date(profile.joinDate).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={profile.email} delay={0.3} />
            <InfoItem icon={<BadgeCheck className="w-4 h-4" />} label="Employee ID" value={profile.employeeId} delay={0.35} />
            <InfoItem icon={<Calendar className="w-4 h-4" />} label="Date of Birth" value={profile.dob ? new Date(profile.dob).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"} delay={0.4} />
            <InfoItem icon={<Phone className="w-4 h-4" />} label="Mobile" value={profile.mobile || "—"} delay={0.45} />
            <InfoItem icon={<MapPin className="w-4 h-4" />} label="Address" value={profile.address || "—"} delay={0.5} />
            <InfoItem icon={<ShieldAlert className="w-4 h-4" />} label="Emergency Contact" value={profile.emergencyContact || "—"} delay={0.55} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
