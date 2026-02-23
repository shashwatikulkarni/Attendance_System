import mongoose, { Schema, Document } from "mongoose";

export interface IEmployeeManagerMapping extends Document {
  employeeEmpId: string;
  managerEmpId: string;
  role: string;
}

const EmployeeManagerMappingSchema = new Schema(
  {
    employeeEmpId: {
      type: String,
      required: true,
    },
    managerEmpId: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.EmployeeManagerMapping ||
  mongoose.model<IEmployeeManagerMapping>(
    "EmployeeManagerMapping",
    EmployeeManagerMappingSchema
  );
