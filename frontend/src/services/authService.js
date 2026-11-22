import { apiRequest } from "./api";

// Register user
export const registerUser = async (emailOrData, password) => {
  const credentials =
    typeof emailOrData === "object"
      ? emailOrData
      : { email: emailOrData, password };

  const data = await apiRequest("/admin/register", {
    method: "POST",
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  return data;
};

const storeLoginSession = (data, accountType, user) => {
  if (!data.accessToken) {
    throw new Error("Login response does not contain an access token");
  }

  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("accountType", accountType);

  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  return data;
};

const getCredentials = (emailOrData, password) => {
  const credentials =
    typeof emailOrData === "object"
      ? emailOrData
      : { email: emailOrData, password };

  return {
    email: credentials.email,
    password: credentials.password,
  };
};

export const loginAdmin = async (emailOrData, password) => {
  const credentials = getCredentials(emailOrData, password);
  const data = await apiRequest("/admin/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  return storeLoginSession(data, "admin", data.user);
};

export const loginEmployee = async (emailOrData, password) => {
  const credentials = getCredentials(emailOrData, password);
  const data = await apiRequest("/employees/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  return storeLoginSession(data, "employee", data.employee);
};

// Backward-compatible admin login helper.
export const loginUser = async (emailOrData, password) => {
  return loginAdmin(emailOrData, password);
};

// Logout user
export const logoutUser = async () => {
  try {
    if (getAccessToken()) {
      const accountType = localStorage.getItem("accountType") || "admin";
      const logoutEndpoint =
        accountType === "employee" ? "/employees/logout" : "/admin/logout";

      await apiRequest(logoutEndpoint, {
        method: "POST",
      });
    }
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("accountType");
  }
};

// Get access token
export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

// Get logged-in user
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

// Check authentication
export const isAuthenticated = () => {
  return !!getAccessToken();
};