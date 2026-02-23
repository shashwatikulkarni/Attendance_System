import mongoose from "mongoose";
import User from "../../models/User";
import Role from "../../models/Role";

async function migrate() {
  const MONGODB_URI = "mongodb+srv://Shashwati:Shashwati123@cluster3.tajtmgl.mongodb.net/User?retryWrites=true&w=majority";

  await mongoose.connect(MONGODB_URI);

  const superAdminRole = await Role.findOne({ code: "SUPER_ADMIN" });

  if (!superAdminRole) {
    throw new Error("SUPER_ADMIN role not found");
  }

  const result = await User.updateMany(
    { role: { $exists: true } },
    {
      $set: { roleId: superAdminRole._id },
      $unset: { role: "" },
    }
  );

  console.log("Migration complete:", result);
  await mongoose.disconnect();
}

migrate()
  .then(() => {
    console.log("✅ Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
