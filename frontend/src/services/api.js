const API_URL = "/api";

export const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && {
                Authorization: `Bearer ${token}`
            }),
            ...options.headers
        }
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        window.location.href = "/login";

        throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
};