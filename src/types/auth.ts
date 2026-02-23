import mongoose, { Schema } from "mongoose";

const AttendanceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    date: { type: Date },
    startTime: String,
    endTime: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance ||
  mongoose.model("Attendance", AttendanceSchema);
