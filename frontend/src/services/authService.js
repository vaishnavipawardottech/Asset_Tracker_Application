import { apiRequest } from "./api";

// Register user
export const registerUser = async (emailOrData, password) => {
  const credentials =
    typeof emailOrData === "object"
      ? emailOrData
      : { email: emailOrData, password };

  const data = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  return data;
};

// Login user
export const loginUser = async (emailOrData, password) => {
  const credentials =
    typeof emailOrData === "object"
      ? emailOrData
      : { email: emailOrData, password };

  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  if (!data.accessToken) {
    throw new Error("Login response does not contain an access token");
  }

  localStorage.setItem("accessToken", data.accessToken);

  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }

  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
};

// Logout user
export const logoutUser = async () => {
  try {
    if (getAccessToken()) {
      await apiRequest("/auth/logout", {
        method: "POST",
      });
    }
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
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