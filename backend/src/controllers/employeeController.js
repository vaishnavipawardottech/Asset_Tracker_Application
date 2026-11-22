import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const generateAccessToken = (employeeId) => {
    return jwt.sign(
        { userId: employeeId, role: "employee" },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" }
    );
};

const generateRefreshToken = (employeeId) => {
    return jwt.sign(
        { userId: employeeId, role: "employee" },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );
};

// CREATE EMPLOYEE
export const registerEmployee = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            department,
            designation
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required"
            });
        }

        if (typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string") {
            return res.status(400).json({
                message: "Invalid input"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO employees
             (name, email, password_hash, phone, department, designation)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, name, email, phone, department, designation, created_at, updated_at`,
            [
                name.trim(),
                email.trim().toLowerCase(),
                passwordHash,
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

// LOGIN EMPLOYEE
export const loginEmployee = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({
                message: "Invalid input"
            });
        }

        const result = await pool.query(
            `SELECT id, name, email, password_hash
             FROM employees
             WHERE email = $1`,
            [email.trim().toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const employee = result.rows[0];
        const isPasswordValid = await bcrypt.compare(
            password,
            employee.password_hash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const accessToken = generateAccessToken(employee.id);
        const refreshToken = generateRefreshToken(employee.id);

        await pool.query(
            "UPDATE employees SET refresh_token = $1 WHERE id = $2",
            [refreshToken, employee.id]
        );

        return res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            employee: {
                id: employee.id,
                name: employee.name,
                email: employee.email
            }
        });
    } catch (error) {
        console.error("Employee login error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// LOGOUT EMPLOYEE
export const logoutEmployee = async (req, res) => {
    try {
        const employeeId = req.user.userId;

        await pool.query(
            "UPDATE employees SET refresh_token = NULL WHERE id = $1",
            [employeeId]
        );

        return res.status(200).json({
            message: "Logout successful"
        });
    } catch (error) {
        console.error("Employee logout error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// GET LOGGED-IN EMPLOYEE'S ASSETS
export const getMyEmployeeAssets = async (req, res) => {
    try {
        const employeeId = req.user.userId;

        const result = await pool.query(
            `SELECT
                a.*,
                e.name AS employee_name
             FROM assets a
             INNER JOIN employees e ON e.id = a.employee_id
             WHERE a.employee_id = $1
             ORDER BY a.id DESC`,
            [employeeId]
        );

        return res.status(200).json({
            success: true,
            assets: result.rows
        });
    } catch (error) {
        console.error("Get employee assets error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch employee assets"
        });
    }
};


// GET ALL EMPLOYEES
export const getEmployees = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                e.id,
                e.name,
                e.email,
                e.phone,
                e.department,
                e.designation,
                e.created_at,
                e.updated_at,
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
            `SELECT id, name, email, phone, department, designation,
                    created_at, updated_at
             FROM employees
             WHERE id = $1`,
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
             RETURNING id, name, email, phone, department, designation,
                       created_at, updated_at`,
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
        const requestedId = req.params.id;
        const id = requestedId === "me"
            ? req.user.userId
            : req.user.role === "employee"
                ? req.user.userId
                : requestedId;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid employee ID"
            });
        }

        const employeeResult = await pool.query(
            `SELECT id, name, email, phone, department, designation,
                    created_at, updated_at
             FROM employees
             WHERE id = $1`,
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