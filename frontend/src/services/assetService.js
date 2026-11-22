import { apiRequest } from "./api";

export const getAssets = async () => {
    const endpoint =
        localStorage.getItem("accountType") === "employee"
            ? "/assets/my"
            : "/assets";
    const data = await apiRequest(endpoint);

    return Array.isArray(data)
        ? data
        : data.assets || [];
};

export const createAsset = async (asset) => {
    return await apiRequest("/assets", {
        method: "POST",
        body: JSON.stringify(asset)
    });
};

export const updateAsset = async (id, asset) => {
    return await apiRequest(`/assets/${id}`, {
        method: "PUT",
        body: JSON.stringify(asset)
    });
};

export const deleteAsset = async (id) => {
    return await apiRequest(`/assets/${id}`, {
        method: "DELETE"
    });
};