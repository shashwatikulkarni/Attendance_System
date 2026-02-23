import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  role: "superAdmin" | "CXO/HR" | "techManager" | "employee" | "intern";

  employeeId: string;
  dob: Date;

  managerId?: Types.ObjectId;   

  createdBy?: Types.ObjectId;

  address?: string;
  mobile?: string;
  emergencyContact?: string;
   resetToken?: string;
  resetTokenExpiry?: Date;
  resume: string;
  photoId: string;
  isDeleted?: boolean; 
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["superAdmin", "CXO/HR", "techManager", "employee", "intern"],
      required: true,
    },
     isDeleted: {
      type: Boolean,
      default: false,
    },


    employeeId: { type: String, unique: true },

    dob: { type: Date, required: true },

    
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resetToken: {
  type: String,
      },
    resetTokenExpiry: {
  type: Date,
      },


    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
resume: {
  type: String,
  default:" ",
},

photoId: {
  type: String,
  default:" ",
},

    address: String,
    mobile: String,
    emergencyContact: String,

   
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
