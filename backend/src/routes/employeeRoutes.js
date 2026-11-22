import express from "express";

import {
    registerEmployee,
    loginEmployee,
    logoutEmployee,
    getMyEmployeeAssets,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    getEmployeeWithAssets
} from "../controllers/employeeController.js";

import {authMiddleware} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", loginEmployee);
router.post("/logout", authMiddleware, logoutEmployee);
router.post("/", authMiddleware, registerEmployee);

router.get("/", authMiddleware, getEmployees);

router.get("/me/assets", authMiddleware, getMyEmployeeAssets);
router.get("/:id/assets", authMiddleware, getEmployeeWithAssets);

router.get("/:id", authMiddleware, getEmployeeById);

router.put("/:id", authMiddleware, updateEmployee);

export default router;