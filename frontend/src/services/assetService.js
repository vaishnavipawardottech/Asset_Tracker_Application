const API_URL = "/api/assets";


const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };
};

export const getAssets = async () => {
    const response = await fetch(API_URL, {
        headers: getAuthHeaders()
    });

    if (response.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        window.location.href = "/login";

        return;
    }

    if (!response.ok) {
        throw new Error("Failed to fetch assets");
    }

    return response.json();
};

export const getAssetById = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
    });

    if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
    }

    if (!response.ok) {
        throw new Error("Failed to fetch asset");
    }

    return response.json();
};

export const createAsset = async (asset) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(asset)
    });

    if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
    }

    if (!response.ok) {
        throw new Error("Failed to create asset");
    }

    return response.json();
};

export const updateAsset = async (id, asset) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(asset)
    });

    if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
    }

    if (!response.ok) {
        throw new Error("Failed to update asset");
    }

    return response.json();
};

export const deleteAsset = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });

    if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
    }

    if (!response.ok) {
        throw new Error("Failed to delete asset");
    }

    return response.json();
};