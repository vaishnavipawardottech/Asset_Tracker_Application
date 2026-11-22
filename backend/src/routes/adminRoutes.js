import express from "express";

import {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
} from "../controllers/adminController.js";

import {authMiddleware} from "../middlewares/authMiddleware.js";

const router = express.Router();

// public routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", authMiddleware, logoutAdmin);


export default router;