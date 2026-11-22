import pool from "../config/db.js";

const REQUEST_TYPES = ["ASSET_REQUEST", "MAINTENANCE"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const hasPermission = (req, permission) =>
  Array.isArray(req.user?.permissions) && req.user.permissions.includes(permission);

const isRole = (req, role) =>
  Array.isArray(req.user?.roles) && req.user.roles.includes(role);

const sendServerError = (res, label, error) => {
  console.error(label, error);
  return res.status(500).json({ message: "Internal server error" });
};

const requestSelect = `
  SELECT r.id, r.request_number AS "requestNumber", r.subject, r.description,
         r.request_type AS "requestType", r.status, r.priority,
         r.requested_by AS "requestedBy", requester.name AS "requesterName",
         r.requested_for AS "requestedFor", requested.name AS "requestedForName",
         r.assigned_to AS "assignedTo", assignee.name AS "assigneeName",
         r.department_id AS "departmentId", d.name AS "departmentName",
         r.asset_id AS "assetId", r.requested_asset_type AS "requestedAssetType",
         r.created_at AS "createdAt", r.updated_at AS "updatedAt",
         r.closed_at AS "closedAt"
  FROM requests r
  JOIN users requester ON requester.id = r.requested_by
  LEFT JOIN users requested ON requested.id = r.requested_for
  LEFT JOIN users assignee ON assignee.id = r.assigned_to
  LEFT JOIN departments d ON d.id = r.department_id
`;

const resourcePredicate = (req, alias = "r", parameterOffset = 0) => {
  if (isRole(req, "IT_ADMIN") || isRole(req, "SUPER_ADMIN") ||
      hasPermission(req, "request.view_all")) {
    return { sql: "TRUE", params: [] };
  }
  if (isRole(req, "MANAGER") || hasPermission(req, "request.view_department")) {
    return {
      sql: `(${alias}.department_id = $${parameterOffset + 1} OR EXISTS (
        SELECT 1 FROM users report
        WHERE report.id = ${alias}.requested_by AND report.manager_id = $${parameterOffset + 1}
      ))`,
      params: [req.user.userId],
    };
  }
  return {
    sql: `(${alias}.requested_by = $${parameterOffset + 1} OR ${alias}.requested_for = $${parameterOffset + 1})`,
    params: [req.user.userId],
  };
};

const getRequest = async (id) => {
  const result = await pool.query(`${requestSelect} WHERE r.id = $1`, [id]);
  return result.rows[0] || null;
};

const recordHistory = async (client, requestId, changedBy, oldStatus, newStatus, remarks) => {
  await client.query(
    `INSERT INTO request_history
       (request_id, changed_by, old_status, new_status, remarks)
     VALUES ($1, $2, $3, $4, $5)`,
    [requestId, changedBy, oldStatus, newStatus, remarks || null]
  );
};

export const createRequest = async (req, res) => {
  const {
    subject,
    description,
    requestType,
    request_type: requestTypeSnake,
    priority = "MEDIUM",
    requestedFor,
    requested_for: requestedForSnake,
    assetId,
    asset_id: assetIdSnake,
    requestedAssetType,
    requested_asset_type: requestedAssetTypeSnake,
  } = req.body;
  const type = typeof (requestType ?? requestTypeSnake) === "string"
    ? (requestType ?? requestTypeSnake).toUpperCase()
    : "";
  const normalizedSubject = typeof subject === "string" ? subject.trim() : "";
  const normalizedPriority = typeof priority === "string" ? priority.toUpperCase() : "";
  const targetId = parseId(requestedFor ?? requestedForSnake) || req.user.userId;
  const maintenanceAssetId = parseId(assetId ?? assetIdSnake);
  const assetTypeInput = requestedAssetType ?? requestedAssetTypeSnake;
  const normalizedAssetType = typeof assetTypeInput === "string"
    ? assetTypeInput.trim()
    : "";

  if (!normalizedSubject || !REQUEST_TYPES.includes(type) || !PRIORITIES.includes(normalizedPriority)) {
    return res.status(400).json({ message: "Valid subject, requestType, and priority are required" });
  }
  if (type === "ASSET_REQUEST" && !normalizedAssetType) {
    return res.status(400).json({ message: "requestedAssetType is required for asset requests" });
  }
  if (type === "MAINTENANCE" && !maintenanceAssetId) {
    return res.status(400).json({ message: "assetId is required for maintenance requests" });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    const userResult = await client.query(
      "SELECT id, department_id, manager_id FROM users WHERE id = $1 AND is_active = TRUE FOR SHARE",
      [targetId]
    );
    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Requested user not found" });
    }
    const target = userResult.rows[0];
    if (!target.manager_id) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "The requested user has no assigned manager" });
    }
    if (type === "MAINTENANCE") {
      const asset = await client.query("SELECT id FROM assets WHERE id = $1", [maintenanceAssetId]);
      if (asset.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Asset not found" });
      }
    }

    const requestNumber = `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const requestResult = await client.query(
      `INSERT INTO requests
         (request_number, subject, description, request_type, priority,
          requested_by, requested_for, department_id, asset_id, requested_asset_type)
       VALUES ($1, $2, $3, $4, 'PENDING_APPROVAL', $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        requestNumber,
        normalizedSubject,
        typeof description === "string" ? description.trim() || null : null,
        type,
        req.user.userId,
        targetId,
        target.department_id,
        type === "MAINTENANCE" ? maintenanceAssetId : null,
        type === "ASSET_REQUEST" ? normalizedAssetType : null,
      ]
    );
    const requestId = requestResult.rows[0].id;
    await client.query(
      "INSERT INTO request_approvals (request_id, approver_id) VALUES ($1, $2)",
      [requestId, target.manager_id]
    );
    await recordHistory(client, requestId, req.user.userId, null, "PENDING_APPROVAL", "Request created");
    await client.query("COMMIT");

    return res.status(201).json({ message: "Request created successfully", request: await getRequest(requestId) });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    return sendServerError(res, "Create request error:", error);
  } finally {
    client?.release();
  }
};

export const getRequests = async (req, res) => {
  const access = resourcePredicate(req);
  try {
    const result = await pool.query(
      `${requestSelect} WHERE ${access.sql} ORDER BY r.created_at DESC`,
      access.params
    );
    return res.status(200).json({ requests: result.rows });
  } catch (error) {
    return sendServerError(res, "Get requests error:", error);
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `${requestSelect}
       WHERE r.requested_by = $1 OR r.requested_for = $1
       ORDER BY r.created_at DESC`,
      [req.user.userId]
    );
    return res.status(200).json({ requests: result.rows });
  } catch (error) {
    return sendServerError(res, "Get my requests error:", error);
  }
};

export const getRequestById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid request ID" });
  try {
    const request = await getRequest(id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    const access = resourcePredicate(req, "r", 1);
    const permitted = access.sql === "TRUE" || (await pool.query(
      `SELECT 1 FROM requests r WHERE r.id = $1 AND ${access.sql}`,
      [id, ...access.params]
    )).rows.length > 0;
    if (!permitted) return res.status(403).json({ message: "You cannot access this request" });
    return res.status(200).json({ request });
  } catch (error) {
    return sendServerError(res, "Get request error:", error);
  }
};

export const cancelRequest = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid request ID" });
  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    const result = await client.query(
      `SELECT status, requested_by, requested_for
       FROM requests WHERE id = $1 FOR UPDATE`,
      [id]
    );
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Request not found" });
    }
    const request = result.rows[0];
    if (request.requested_by !== req.user.userId) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "You cannot cancel this request" });
    }
    if (request.status !== "PENDING_APPROVAL") {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Only pending approval requests can be cancelled" });
    }
    await client.query(
      `UPDATE requests
       SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP,
           closed_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );
    await recordHistory(client, id, req.user.userId, "PENDING_APPROVAL", "CANCELLED", "Request cancelled");
    await client.query("COMMIT");
    return res.status(200).json({ message: "Request cancelled successfully", request: await getRequest(id) });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    return sendServerError(res, "Cancel request error:", error);
  } finally {
    client?.release();
  }
};

export const getPendingApprovals = async (req, res) => {
  try {
    const result = await pool.query(
      `${requestSelect}
       JOIN request_approvals approval ON approval.request_id = r.id
       WHERE approval.approver_id = $1 AND approval.status = 'PENDING'
         AND r.status = 'PENDING_APPROVAL'
       ORDER BY r.created_at ASC`,
      [req.user.userId]
    );
    return res.status(200).json({ requests: result.rows });
  } catch (error) {
    return sendServerError(res, "Get pending approvals error:", error);
  }
};

const decideRequest = async (req, res, decision) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid request ID" });
  const comments = typeof req.body?.comments === "string" ? req.body.comments.trim() : null;
  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    const result = await client.query(
      `SELECT r.status, approval.id AS approval_id
       FROM requests r
       JOIN request_approvals approval ON approval.request_id = r.id
       WHERE r.id = $1 AND approval.approver_id = $2
         AND approval.status = 'PENDING'
       FOR UPDATE OF r, approval`,
      [id, req.user.userId]
    );
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "You are not the assigned approver for this request" });
    }
    if (result.rows[0].status !== "PENDING_APPROVAL") {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Request is no longer awaiting approval" });
    }
    const newStatus = decision === "approve" ? "APPROVED" : "REJECTED";
    await client.query(
      `UPDATE request_approvals
       SET status = $1, comments = $2, decided_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [newStatus, comments, result.rows[0].approval_id]
    );
    await client.query(
      `UPDATE requests SET status = $1, updated_at = CURRENT_TIMESTAMP,
              closed_at = CASE WHEN $1 = 'REJECTED' THEN CURRENT_TIMESTAMP ELSE closed_at END
       WHERE id = $2`,
      [newStatus, id]
    );
    await recordHistory(client, id, req.user.userId, "PENDING_APPROVAL", newStatus, comments);
    await client.query("COMMIT");
    return res.status(200).json({ message: `Request ${decision}d successfully`, request: await getRequest(id) });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    return sendServerError(res, `Request ${decision} error:`, error);
  } finally {
    client?.release();
  }
};

export const approveRequest = (req, res) => decideRequest(req, res, "approve");
export const rejectRequest = (req, res) => decideRequest(req, res, "reject");

export const getApprovedRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `${requestSelect}
       WHERE r.status = 'APPROVED'
       ORDER BY r.created_at ASC`
    );
    return res.status(200).json({ requests: result.rows });
  } catch (error) {
    return sendServerError(res, "Get approved requests error:", error);
  }
};

export const assignRequest = async (req, res) => {
  const id = parseId(req.params.id);
  const processorId = parseId(req.body?.assignedTo ?? req.body?.assigned_to);
  if (!id || !processorId) return res.status(400).json({ message: "Valid request ID and assignedTo are required" });
  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    const processor = await client.query(
      `SELECT u.id FROM users u
       JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r ON r.id = ur.role_id
       WHERE u.id = $1 AND u.is_active = TRUE AND r.name IN ('IT_ADMIN', 'SUPER_ADMIN')`,
      [processorId]
    );
    if (processor.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Assigned user must be an active IT processor" });
    }
    const request = await client.query(
      "SELECT status, assigned_to FROM requests WHERE id = $1 FOR UPDATE",
      [id]
    );
    if (request.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Request not found" });
    }
    if (request.rows[0].status !== "APPROVED") {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Only approved requests can be assigned" });
    }
    await client.query(
      `UPDATE requests
       SET assigned_to = $1, status = 'IN_PROGRESS', updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [processorId, id]
    );
    await recordHistory(client, id, req.user.userId, "APPROVED", "IN_PROGRESS", "Request assigned");
    await client.query("COMMIT");
    return res.status(200).json({ message: "Request assigned successfully", request: await getRequest(id) });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    return sendServerError(res, "Assign request error:", error);
  } finally {
    client?.release();
  }
};

export const updateRequestStatus = async (req, res, explicitStatus) => {
  const id = parseId(req.params.id);
  const status = explicitStatus || (typeof req.body?.status === "string" ? req.body.status.toUpperCase() : "");
  const remarks = typeof req.body?.remarks === "string" ? req.body.remarks.trim() : null;
  if (!id || !["IN_PROGRESS", "COMPLETED"].includes(status)) {
    return res.status(400).json({ message: "Status must be IN_PROGRESS or COMPLETED" });
  }
  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    const result = await client.query("SELECT status, assigned_to FROM requests WHERE id = $1 FOR UPDATE", [id]);
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Request not found" });
    }
    const request = result.rows[0];
    if (status === "COMPLETED" && request.status !== "IN_PROGRESS") {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Only in-progress requests can be completed" });
    }
    if (status === "IN_PROGRESS" && !["APPROVED", "IN_PROGRESS"].includes(request.status)) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Request is not ready for processing" });
    }
    if (status === "IN_PROGRESS" && !request.assigned_to) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Request must be assigned before processing" });
    }
    if (request.assigned_to && request.assigned_to !== req.user.userId &&
        !isRole(req, "SUPER_ADMIN")) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "Only the assigned processor can update this request" });
    }
    await client.query(
      `UPDATE requests SET status = $1, updated_at = CURRENT_TIMESTAMP,
              closed_at = CASE WHEN $1 = 'COMPLETED' THEN CURRENT_TIMESTAMP ELSE closed_at END
       WHERE id = $2`,
      [status, id]
    );
    await recordHistory(client, id, req.user.userId, request.status, status, remarks);
    await client.query("COMMIT");
    return res.status(200).json({ message: "Request status updated successfully", request: await getRequest(id) });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    return sendServerError(res, "Update request status error:", error);
  } finally {
    client?.release();
  }
};

export const addComment = async (req, res) => {
  const id = parseId(req.params.id);
  const comment = typeof req.body?.comment === "string" ? req.body.comment.trim() : "";
  if (!id || !comment) return res.status(400).json({ message: "A valid request ID and comment are required" });
  try {
    const request = await getRequest(id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    const access = resourcePredicate(req, "r", 1);
    if (access.sql !== "TRUE" && (await pool.query(
      `SELECT 1 FROM requests r WHERE r.id = $1 AND ${access.sql}`, [id, ...access.params]
    )).rows.length === 0) {
      return res.status(403).json({ message: "You cannot access this request" });
    }
    const result = await pool.query(
      `INSERT INTO request_comments (request_id, user_id, comment)
       VALUES ($1, $2, $3)
       RETURNING id, request_id AS "requestId", user_id AS "userId",
                 comment, created_at AS "createdAt"`,
      [id, req.user.userId, comment]
    );
    return res.status(201).json({ comment: result.rows[0] });
  } catch (error) {
    return sendServerError(res, "Add request comment error:", error);
  }
};

export const getComments = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid request ID" });
  try {
    const request = await getRequest(id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    const access = resourcePredicate(req, "r", 1);
    if (access.sql !== "TRUE" && (await pool.query(
      `SELECT 1 FROM requests r WHERE r.id = $1 AND ${access.sql}`, [id, ...access.params]
    )).rows.length === 0) {
      return res.status(403).json({ message: "You cannot access this request" });
    }
    const result = await pool.query(
      `SELECT c.id, c.request_id AS "requestId", c.user_id AS "userId",
              u.name AS "userName", c.comment, c.created_at AS "createdAt"
       FROM request_comments c JOIN users u ON u.id = c.user_id
       WHERE c.request_id = $1 ORDER BY c.created_at ASC`,
      [id]
    );
    return res.status(200).json({ comments: result.rows });
  } catch (error) {
    return sendServerError(res, "Get request comments error:", error);
  }
};

export const getHistory = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid request ID" });
  try {
    const request = await getRequest(id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    const access = resourcePredicate(req, "r", 1);
    if (access.sql !== "TRUE" && (await pool.query(
      `SELECT 1 FROM requests r WHERE r.id = $1 AND ${access.sql}`, [id, ...access.params]
    )).rows.length === 0) {
      return res.status(403).json({ message: "You cannot access this request" });
    }
    const result = await pool.query(
      `SELECT h.id, h.request_id AS "requestId", h.changed_by AS "changedBy",
              u.name AS "changedByName", h.old_status AS "oldStatus",
              h.new_status AS "newStatus", h.remarks, h.created_at AS "createdAt"
       FROM request_history h JOIN users u ON u.id = h.changed_by
       WHERE h.request_id = $1 ORDER BY h.created_at ASC`,
      [id]
    );
    return res.status(200).json({ history: result.rows });
  } catch (error) {
    return sendServerError(res, "Get request history error:", error);
  }
};