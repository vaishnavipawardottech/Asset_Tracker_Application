import express from "express";

import {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    getEmployeeWithAssets
} from "../controllers/employeeController.js";

import {authMiddleware} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createEmployee);

router.get("/", authMiddleware, getEmployees);

router.get("/:id/assets", authMiddleware, getEmployeeWithAssets);

router.get("/:id", authMiddleware, getEmployeeById);

router.put("/:id", authMiddleware, updateEmployee);

export default router;