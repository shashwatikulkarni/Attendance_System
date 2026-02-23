export type Attendance = {
  date: string;
  attendanceType: "Full Day" | "Half Day" | "Absent";
  startTime?: string | null;
  endTime?: string | null;
  status: "approved" | "pending" | "rejected";
};
