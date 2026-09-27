const API_URL = "/api/assets";

export const getAssets = async () => {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Failed to fetch assets");
    }

    return response.json();
};

export const getAssetById = async (id) => {
    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok) {
        throw new Error("Failed to fetch asset");
    }

    return response.json();
};

export const createAsset = async (asset) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(asset)
    });

    if (!response.ok) {
        throw new Error("Failed to create asset");
    }

    return response.json();
};

export const updateAsset = async (id, asset) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(asset)
    });

    if (!response.ok) {
        throw new Error("Failed to update asset");
    }

    return response.json();
};

export const deleteAsset = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error("Failed to delete asset");
    }

    return response.json();
};