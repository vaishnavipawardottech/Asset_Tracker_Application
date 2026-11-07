import express from "express";
import {
  changePassword,
  createManager,
  createUserAccount,
  getMe,
  login,
  logout,
  refresh,
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/auth/login", login);
router.post("/auth/refresh", refresh);
router.post("/auth/logout", authMiddleware, logout);
router.get("/auth/me", authMiddleware, getMe);
router.patch("/auth/change-password", authMiddleware, changePassword);

router.post("/users/managers", authMiddleware, createManager);
router.post("/users", authMiddleware, createUserAccount);

export default router;