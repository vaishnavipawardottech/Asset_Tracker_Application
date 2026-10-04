import pool from "../config/db.js";

// CREATE EMPLOYEE
export const createEmployee = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            department,
            designation
        } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO employees
             (name, email, phone, department, designation)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                name.trim(),
                email.trim().toLowerCase(),
                phone || null,
                department || null,
                designation || null
            ]
        );

        return res.status(201).json({
            message: "Employee created successfully",
            employee: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "Employee with this email already exists"
            });
        }

        console.error("Create employee error:", error);

        return res.status(500).json({
            message: "Failed to create employee"
        });
    }
};


// GET ALL EMPLOYEES
export const getEmployees = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                e.*,
                COUNT(a.id)::INTEGER AS asset_count
             FROM employees e
             LEFT JOIN assets a ON a.employee_id = e.id
             GROUP BY e.id
             ORDER BY e.created_at DESC`
        );

        return res.status(200).json({
            employees: result.rows
        });

    } catch (error) {
        console.error("Get employees error:", error);

        return res.status(500).json({
            message: "Failed to fetch employees"
        });
    }
};


// GET EMPLOYEE BY ID
export const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid employee ID"
            });
        }

        const result = await pool.query(
            `SELECT * FROM employees WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        return res.status(200).json({
            employee: result.rows[0]
        });

    } catch (error) {
        console.error("Get employee error:", error);

        return res.status(500).json({
            message: "Failed to fetch employee"
        });
    }
};


// UPDATE EMPLOYEE
export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            email,
            phone,
            department,
            designation
        } = req.body;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid employee ID"
            });
        }

        // Check whether at least one field is provided
        if (
            name === undefined &&
            email === undefined &&
            phone === undefined &&
            department === undefined &&
            designation === undefined
        ) {
            return res.status(400).json({
                message: "At least one field is required to update"
            });
        }

        const result = await pool.query(
            `UPDATE employees
             SET
                name = COALESCE($1, name),
                email = COALESCE($2, email),
                phone = COALESCE($3, phone),
                department = COALESCE($4, department),
                designation = COALESCE($5, designation),
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $6
             RETURNING *`,
            [
                name?.trim() || null,
                email?.trim().toLowerCase() || null,
                phone ?? null,
                department ?? null,
                designation ?? null,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        return res.status(200).json({
            message: "Employee updated successfully",
            employee: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "Email already belongs to another employee"
            });
        }

        console.error("Update employee error:", error);

        return res.status(500).json({
            message: "Failed to update employee"
        });
    }
};


// GET EMPLOYEE WITH ASSIGNED ASSETS
export const getEmployeeWithAssets = async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid employee ID"
            });
        }

        const employeeResult = await pool.query(
            `SELECT * FROM employees WHERE id = $1`,
            [id]
        );

        if (employeeResult.rows.length === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        const assetsResult = await pool.query(
            `SELECT *
             FROM assets
             WHERE employee_id = $1
             ORDER BY id DESC`,
            [id]
        );

        return res.status(200).json({
            employee: employeeResult.rows[0],
            assets: assetsResult.rows,
            assetCount: assetsResult.rows.length
        });

    } catch (error) {
        console.error("Get employee assets error:", error);

        return res.status(500).json({
            message: "Failed to fetch employee assets"
        });
    }
};