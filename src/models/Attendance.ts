import mongoose, { Schema, Types, Document } from "mongoose";

/* ================== TS INTERFACE ================== */
export interface AttendanceDocument extends Document {
  userId: Types.ObjectId;
  date: Date;
  startTime?: string | null;
  endTime?: string | null;
  attendanceType: "Full Day" | "Half Day" | "Absent";
  late: boolean;
  status: "pending" | "approved" | "rejected";
  approvedBy?: Types.ObjectId;
}

/* ==================SCHEMA================== */
const AttendanceSchema = new Schema<AttendanceDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      default: null,
    },

    endTime: {
      type: String,
      default: null,
    },

    attendanceType: {
      type: String,
      enum: ["Full Day", "Half Day", "Absent","late"],
      default: "Absent",
    },

    late: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

/* ================== UNIQUE PER USER PER DAY ================== */
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

/* ================== BLOCK FUTURE DATES ================== */
AttendanceSchema.pre("save", function () {
  const attendanceDate = new Date(this.date);
  attendanceDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (attendanceDate.getTime() > today.getTime()) {
    throw new Error("Future date attendance not allowed");
  }
});

/* ================== EXPORT ================== */
export default mongoose.models.Attendance ||
  mongoose.model<AttendanceDocument>(
    "Attendance",
    AttendanceSchema
  );
