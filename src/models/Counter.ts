import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  _id: String,     
  seq: {
    type: Number,
    default: 1000, 
  },
});

export default mongoose.models.Counter ||
  mongoose.model("Counter", CounterSchema);
