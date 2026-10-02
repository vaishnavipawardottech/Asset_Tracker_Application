import express from "express";

import {
    getAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset
} from "../controllers/assetController.js";

import {authMiddleware} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAssets);

router.get("/:id", authMiddleware, getAssetById);

router.post("/", authMiddleware, createAsset);

router.put("/:id", authMiddleware, updateAsset);

router.delete("/:id", authMiddleware, deleteAsset);

export default router;