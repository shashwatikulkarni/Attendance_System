import mongoose, { Schema, Types } from "mongoose";

export interface RoleDocument {
  _id: Types.ObjectId;
  name: string; 
  code: "SUPER_ADMIN" | "HR" | "TECH_MANAGER" | "EMPLOYEE" | "INTERN"; 
}

const RoleSchema = new Schema<RoleDocument>(
  {
    name: { type: String, required: true }, 
    code: { type: String, required: true, unique: true }, 
  },
  { timestamps: true }
);

export default mongoose.models.Role ||
  mongoose.model<RoleDocument>("Role", RoleSchema);
