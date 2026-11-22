import express from "express";
import {
  assignAsset,
  createAsset,
  getAllAssets,
  getAssetById,
  getMyAssets,
  updateAsset,
} from "../controllers/assetsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

const authorize = (permission) => (req, res, next) => {
  if (!Array.isArray(req.user?.permissions) || !req.user.permissions.includes(permission)) {
    return res.status(403).json({ message: `${permission} permission required` });
  }
  return next();
};

router.post("/", authMiddleware, authorize("asset.create"), createAsset);
router.get("/", authMiddleware, authorize("asset.view_all"), getAllAssets);
router.get("/my", authMiddleware, authorize("asset.view_own"), getMyAssets);
router.get("/:id", authMiddleware, getAssetById);
router.patch("/:id", authMiddleware, authorize("asset.update"), updateAsset);
router.patch("/:id/assign", authMiddleware, authorize("asset.assign"), assignAsset);

export default router;