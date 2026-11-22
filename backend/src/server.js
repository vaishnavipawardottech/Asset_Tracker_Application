import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import assetsRoutes from "./routes/assetsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Hello DevOps!",
    application: "Simple Node.js App"
  });
});


app.get("/health", (req, res) => {
  res.json({
    status: "healthy"
  });
});

// Authentication APIs
app.use("/api/admin", adminRoutes);
app.use("/api", authRoutes);
// Asset APIs
app.use("/api/assets", assetsRoutes);
// Employees APIs
app.use("/api/employees", employeeRoutes);
// Request workflow APIs
app.use("/api/requests", requestRoutes);

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});