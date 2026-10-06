import pool from "../config/db.js";

// Get all assets
export const getAllAssets = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.*,
        COALESCE(e.name, a.assigned_to) AS employee_name
      FROM assets a
      LEFT JOIN employees e
        ON a.employee_id = e.id
      ORDER BY a.id DESC
    `);

    return res.status(200).json({
      success: true,
      assets: result.rows,
    });
  } catch (error) {
    console.error("Error fetching assets:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assets",
    });
  }
};

// Get asset by ID
export const getAssetById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM assets WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Asset not found"
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch asset"
        });
    }
};

// create asset with optional employee assignment
export const createAsset = async (req, res) => {
  try {
    const {
      asset_name: requestedName,
      asset_type: requestedType,
      name,
      type,
      serial_number,
      purchase_date,
      employee_id,
      status,
    } = req.body;

    const assetName = (requestedName || name || "").trim();
    const assetType = (requestedType || type || "").trim();
    const serialNumber = (serial_number || "").trim();

    if (!assetName || !assetType || !serialNumber) {
      return res.status(400).json({
        success: false,
        message: "Asset name, asset type, and serial number are required",
      });
    }

    // Validate employee if one is selected
    let assignedEmployeeId = null;

    if (
      employee_id !== undefined &&
      employee_id !== null &&
      employee_id !== ""
    ) {
      const employeeResult = await pool.query(
        "SELECT id FROM employees WHERE id = $1",
        [employee_id]
      );

      if (employeeResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Selected employee does not exist",
        });
      }

      assignedEmployeeId = employeeResult.rows[0].id;
    }

    // Set status based on assignment
    const assetStatus = assignedEmployeeId
      ? "Assigned"
      : status === "Maintenance"
      ? "Maintenance"
      : "Available";

    const result = await pool.query(
      `INSERT INTO assets
        (name, type, serial_number, purchase_date, employee_id, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        assetName,
        assetType,
        serialNumber,
        purchase_date || null,
        assignedEmployeeId,
        assetStatus,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Asset created successfully",
      asset: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "An asset with this serial number already exists",
      });
    }

    console.error("Error creating asset:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create asset",
    });
  }
};

// Update asset
export const updateAsset = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            type,
            serial_number,
            assigned_to,
            status,
            purchase_date
        } = req.body;

        const result = await pool.query(
            `UPDATE assets
             SET
                name = $1,
                type = $2,
                serial_number = $3,
                assigned_to = $4,
                status = $5,
                purchase_date = $6
             WHERE id = $7
             RETURNING *`,
            [
                name,
                type,
                serial_number,
                assigned_to,
                status,
                purchase_date,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Asset not found"
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update asset"
        });
    }
};

// Delete asset
export const deleteAsset = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM assets WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Asset not found"
            });
        }

        res.status(200).json({
            message: "Asset deleted successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete asset"
        });
    }
};