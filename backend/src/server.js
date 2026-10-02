import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import assetRoutes from "./routes/assetRoutes.js";
import authRoutes from "./routes/authRoutes.js";

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
app.use("/api/auth", authRoutes);
// Asset APIs
app.use("/api/assets", assetRoutes);

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});