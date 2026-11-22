import pool from "../config/db.js";

const ASSET_STATUSES = [
  "AVAILABLE",
  "ASSIGNED",
  "UNDER_MAINTENANCE",
  "RETIRED",
  "LOST",
];

const parseAssetId = (value) => {
  const assetId = Number(value);
  return Number.isInteger(assetId) && assetId > 0 ? assetId : null;
};

const hasPermission = (req, permission) =>
  Array.isArray(req.user?.permissions) && req.user.permissions.includes(permission);

const sendServerError = (res, message, error) => {
  console.error(message, error);
  return res.status(500).json({ message: "Internal server error" });
};

export const createAsset = async (req, res) => {
  try {
    const {
      name,
      type,
      serialNumber,
      serial_number,
      purchaseDate,
      purchase_date,
      status = "AVAILABLE",
    } = req.body;
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedType = typeof type === "string" ? type.trim() : "";
    const normalizedSerialNumber = (
      typeof serialNumber === "string" ? serialNumber : serial_number
    )?.trim();
    const normalizedStatus = typeof status === "string" ? status.toUpperCase() : "";

    if (!normalizedName || !normalizedType || !normalizedSerialNumber) {
      return res.status(400).json({
        message: "Name, type, and serialNumber are required",
      });
    }

    if (!ASSET_STATUSES.includes(normalizedStatus) || normalizedStatus === "ASSIGNED") {
      return res.status(400).json({
        message: "New assets must use AVAILABLE status",
      });
    }

    const result = await pool.query(
      `INSERT INTO assets (name, type, serial_number, status, purchase_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, type, serial_number AS "serialNumber",
                 status, purchase_date AS "purchaseDate", employee_id AS "employeeId",
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [
        normalizedName,
        normalizedType,
        normalizedSerialNumber,
        normalizedStatus,
        purchaseDate ?? purchase_date ?? null,
      ]
    );

    return res.status(201).json({
      message: "Asset created successfully",
      asset: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Serial number already exists" });
    }
    return sendServerError(res, "Create asset error:", error);
  }
};

export const getAllAssets = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.id, a.name, a.type, a.serial_number AS "serialNumber",
              a.status, a.purchase_date AS "purchaseDate",
              a.employee_id AS "employeeId", u.name AS "employeeName",
              a.created_at AS "createdAt", a.updated_at AS "updatedAt"
       FROM assets a
       LEFT JOIN users u ON u.id = a.employee_id
       ORDER BY a.id DESC`
    );

    return res.status(200).json({ assets: result.rows });
  } catch (error) {
    return sendServerError(res, "Get all assets error:", error);
  }
};

export const getMyAssets = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.id, a.name, a.type, a.serial_number AS "serialNumber",
              a.status, a.purchase_date AS "purchaseDate",
              a.employee_id AS "employeeId",
              a.created_at AS "createdAt", a.updated_at AS "updatedAt"
       FROM assets a
       WHERE a.employee_id = $1
       ORDER BY a.id DESC`,
      [req.user.userId]
    );

    return res.status(200).json({ assets: result.rows });
  } catch (error) {
    return sendServerError(res, "Get my assets error:", error);
  }
};

export const getAssetById = async (req, res) => {
  const assetId = parseAssetId(req.params.id);
  if (!assetId) {
    return res.status(400).json({ message: "Invalid asset ID" });
  }

  try {
    const result = await pool.query(
      `SELECT a.id, a.name, a.type, a.serial_number AS "serialNumber",
              a.status, a.purchase_date AS "purchaseDate",
              a.employee_id AS "employeeId", u.name AS "employeeName",
              a.created_at AS "createdAt", a.updated_at AS "updatedAt"
       FROM assets a
       LEFT JOIN users u ON u.id = a.employee_id
       WHERE a.id = $1`,
      [assetId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const asset = result.rows[0];
    if (!hasPermission(req, "asset.view_all") && asset.employeeId !== req.user.userId) {
      return res.status(403).json({ message: "You cannot access this asset" });
    }

    return res.status(200).json({ asset });
  } catch (error) {
    return sendServerError(res, "Get asset error:", error);
  }
};

export const updateAsset = async (req, res) => {
  const assetId = parseAssetId(req.params.id);
  if (!assetId) {
    return res.status(400).json({ message: "Invalid asset ID" });
  }

  const allowedFields = {
    name: "name",
    type: "type",
    serialNumber: "serial_number",
    serial_number: "serial_number",
    purchaseDate: "purchase_date",
    purchase_date: "purchase_date",
    status: "status",
  };
  const updates = [];

  for (const [field, column] of Object.entries(allowedFields)) {
    if (req.body[field] !== undefined && !updates.some((item) => item.column === column)) {
      let value = req.body[field];
      if (["name", "type", "serialNumber", "serial_number"].includes(field)) {
        if (typeof value !== "string" || !value.trim()) {
          return res.status(400).json({ message: `${field} must be a non-empty string` });
        }
        value = value.trim();
      }
      if (field === "status") {
        value = typeof value === "string" ? value.toUpperCase() : "";
        if (!ASSET_STATUSES.includes(value)) {
          return res.status(400).json({ message: "Invalid asset status" });
        }
      }
      updates.push({ column, value });
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "At least one asset field is required" });
  }

  try {
    const result = await pool.query(
      `UPDATE assets
       SET ${updates.map((item, index) => `${item.column} = $${index + 1}`).join(", ")},
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $${updates.length + 1}
       RETURNING id, name, type, serial_number AS "serialNumber",
                 status, purchase_date AS "purchaseDate", employee_id AS "employeeId",
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [...updates.map((item) => item.value), assetId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Asset not found" });
    }
    return res.status(200).json({
      message: "Asset updated successfully",
      asset: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Serial number already exists" });
    }
    return sendServerError(res, "Update asset error:", error);
  }
};

export const assignAsset = async (req, res) => {
  const assetId = parseAssetId(req.params.id);
  const employeeId = Number(req.body.employeeId);
  if (!assetId || !Number.isInteger(employeeId) || employeeId <= 0) {
    return res.status(400).json({ message: "Valid asset ID and employeeId are required" });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const assetResult = await client.query(
      "SELECT id, status FROM assets WHERE id = $1 FOR UPDATE",
      [assetId]
    );
    if (assetResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Asset not found" });
    }
    if (assetResult.rows[0].status !== "AVAILABLE") {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Only AVAILABLE assets can be assigned" });
    }

    const employeeResult = await client.query(
      "SELECT id FROM users WHERE id = $1 AND is_active = TRUE",
      [employeeId]
    );
    if (employeeResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Active employee not found" });
    }

    const result = await client.query(
      `UPDATE assets
       SET employee_id = $1, status = 'ASSIGNED', updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, type, serial_number AS "serialNumber",
                 status, purchase_date AS "purchaseDate", employee_id AS "employeeId",
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [employeeId, assetId]
    );
    await client.query("COMMIT");

    return res.status(200).json({
      message: "Asset assigned successfully",
      asset: result.rows[0],
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }
    return sendServerError(res, "Assign asset error:", error);
  } finally {
    if (client) {
      client.release();
    }
  }
};