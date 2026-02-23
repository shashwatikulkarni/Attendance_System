import Counter from "@/models/Counter";

export async function generateEmployeeId() {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "employeeId" },
    { $inc: { seq: 1 } }, // increment by 1
    { new: true, upsert: true }
  );

  return `EMP${counter.seq}`;
}
