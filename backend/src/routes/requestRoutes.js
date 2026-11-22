import express from "express";
import {
  addComment,
  approveRequest,
  assignRequest,
  cancelRequest,
  createRequest,
  getApprovedRequests,
  getComments,
  getHistory,
  getMyRequests,
  getPendingApprovals,
  getRequestById,
  getRequests,
  rejectRequest,
  updateRequestStatus,
} from "../controllers/requestController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

const authorize = (permission) => (req, res, next) => {
  if (!req.user?.permissions?.includes(permission)) {
    return res.status(403).json({ message: `${permission} permission required` });
  }
  return next();
};

router.post("/", authMiddleware, authorize("request.create"), createRequest);
router.get("/my", authMiddleware, authorize("request.view_own"), getMyRequests);
router.get("/pending-approvals", authMiddleware, authorize("request.view_department"), getPendingApprovals);
router.get("/approved", authMiddleware, authorize("request.view_all"), getApprovedRequests);
router.get("/", authMiddleware, getRequests);
router.get("/:id/comments", authMiddleware, getComments);
router.get("/:id/history", authMiddleware, getHistory);
router.post("/:id/comments", authMiddleware, authorize("request.comment"), addComment);
router.patch("/:id/cancel", authMiddleware, cancelRequest);
router.patch("/:id/approve", authMiddleware, authorize("request.approve"), approveRequest);
router.patch("/:id/reject", authMiddleware, authorize("request.reject"), rejectRequest);
router.patch("/:id/assign", authMiddleware, authorize("request.assign"), assignRequest);
router.patch("/:id/status", authMiddleware, authorize("request.resolve"), updateRequestStatus);
router.get("/:id", authMiddleware, getRequestById);

export default router;