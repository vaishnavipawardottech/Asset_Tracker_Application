import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const REFRESH_COOKIE = "refreshToken";

const getRefreshCookieOptions = () => [
  `${REFRESH_COOKIE}=`,
  "Max-Age=0",
  "Path=/api/auth",
  "HttpOnly",
  "SameSite=Lax",
  process.env.NODE_ENV === "production" ? "Secure" : "",
].filter(Boolean).join("; ");

const setRefreshCookie = (res, token) => {
  const maxAge = 7 * 24 * 60 * 60;
  const cookie = [
    `${REFRESH_COOKIE}=${encodeURIComponent(token)}`,
    `Max-Age=${maxAge}`,
    "Path=/api/auth",
    "HttpOnly",
    "SameSite=Lax",
    process.env.NODE_ENV === "production" ? "Secure" : "",
  ].filter(Boolean).join("; ");

  res.setHeader("Set-Cookie", cookie);
};

const clearRefreshCookie = (res) => {
  res.setHeader("Set-Cookie", getRefreshCookieOptions());
};

const getCookie = (req, name) => {
  const cookies = req.headers.cookie?.split(";") || [];
  const cookie = cookies.find((item) => item.trim().startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.trim().slice(name.length + 1)) : null;
};

const getUserWithAccess = async (userId) => {
  const result = await pool.query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.phone,
       u.department_id AS "departmentId",
       u.designation,
       u.manager_id AS "managerId",
       u.is_active AS "isActive",
       COALESCE(
         json_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL),
         '[]'
       ) AS roles,
       COALESCE(
         json_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL),
         '[]'
       ) AS permissions
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles r ON r.id = ur.role_id
     LEFT JOIN role_permissions rp ON rp.role_id = r.id
     LEFT JOIN permissions p ON p.id = rp.permission_id
     WHERE u.id = $1
     GROUP BY u.id`,
    [userId]
  );

  return result.rows[0] || null;
};

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  departmentId: user.departmentId,
  designation: user.designation,
  managerId: user.managerId,
  roles: user.roles,
  permissions: user.permissions,
});

const createTokens = (user) => {
  const payload = {
    userId: user.id,
    roles: user.roles,
    permissions: user.permissions,
  };

  return {
    accessToken: jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: ACCESS_TOKEN_TTL,
    }),
    refreshToken: jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_TTL,
    }),
  };
};

const requireUserManagement = (req, res) => {
  if (!req.user?.permissions?.includes("user.manage")) {
    res.status(403).json({ message: "User management permission required" });
    return false;
  }

  return true;
};

const validateCredentials = (email, password) => {
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return "Email and password are required";
  }

  return null;
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const validationError = validateCredentials(email, password);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const result = await pool.query(
      `SELECT id, name, email, password_hash, is_active
       FROM users
       WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const account = result.rows[0];
    if (!account.is_active) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    const passwordMatches = await bcrypt.compare(password, account.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = await getUserWithAccess(account.id);
    const { accessToken, refreshToken } = createTokens(user);

    await pool.query(
      "UPDATE users SET refresh_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [refreshToken, account.id]
    );
    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      message: "Login successful",
      user: publicUser(user),
      accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = getCookie(req, REFRESH_COOKIE);
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const result = await pool.query(
      "SELECT id, refresh_token, is_active FROM users WHERE id = $1",
      [decoded.userId]
    );
    const account = result.rows[0];

    if (!account || !account.is_active || account.refresh_token !== refreshToken) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const user = await getUserWithAccess(account.id);
    const tokens = createTokens(user);
    await pool.query(
      "UPDATE users SET refresh_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [tokens.refreshToken, account.id]
    );
    setRefreshCookie(res, tokens.refreshToken);

    return res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: tokens.accessToken,
      user: publicUser(user),
    });
  } catch (error) {
    clearRefreshCookie(res);
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    console.error("Refresh token error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (userId) {
      await pool.query(
        "UPDATE users SET refresh_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [userId]
      );
    }

    clearRefreshCookie(res);
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await getUserWithAccess(req.user.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Account is unavailable" });
    }

    return res.status(200).json({ user: publicUser(user) });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1 AND is_active = TRUE",
      [req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Account is unavailable" });
    }

    if (!(await bcrypt.compare(currentPassword, result.rows[0].password_hash))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      `UPDATE users
       SET password_hash = $1, refresh_token = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [passwordHash, req.user.userId]
    );
    clearRefreshCookie(res);

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createUser = async (req, res, roleName) => {
  if (!requireUserManagement(req, res)) {
    return;
  }

  const {
    name,
    email,
    password,
    phone = null,
    departmentId = null,
    designation = null,
    managerId = null,
  } = req.body;
  const validationError = validateCredentials(email, password);

  if (validationError || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      message: validationError || "Name, email, and password are required",
    });
  }

  let client;
  let transactionStarted = false;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    transactionStarted = true;
    const passwordHash = await bcrypt.hash(password, 12);
    const userResult = await client.query(
      `INSERT INTO users
       (name, email, password_hash, phone, department_id, designation, manager_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        passwordHash,
        phone,
        departmentId,
        designation,
        managerId,
      ]
    );

    const roleResult = await client.query(
      "SELECT id FROM roles WHERE name = $1",
      [roleName]
    );
    if (roleResult.rows.length === 0) {
      throw new Error(`Required role ${roleName} does not exist`);
    }

    await client.query(
      "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
      [userResult.rows[0].id, roleResult.rows[0].id]
    );
    await client.query("COMMIT");

    const user = await getUserWithAccess(userResult.rows[0].id);
    return res.status(201).json({
      message: `${roleName} created successfully`,
      user: publicUser(user),
    });
  } catch (error) {
    if (client && transactionStarted) {
      await client.query("ROLLBACK");
    }

    if (error.code === "23505") {
      return res.status(409).json({ message: "A user with this email already exists" });
    }

    console.error("Create user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const createManager = (req, res) => createUser(req, res, "MANAGER");
export const createUserAccount = (req, res) => createUser(req, res, "EMPLOYEE");