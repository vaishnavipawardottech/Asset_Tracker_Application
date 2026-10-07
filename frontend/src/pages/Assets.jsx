import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Package,
    CalendarDays,
    UserRound,
    Pencil,
    X,
    Save,
} from "lucide-react";

import { getAssets, updateAsset } from "../services/assetService";
import StatusBadge from "../components/StatusBadge";
import CustomDropdown from "../components/CustomDropdown";

const Assets = () => {
    const navigate = useNavigate();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");


    const fetchAssets = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getAssets();

            const assetList = Array.isArray(response)
                ? response
                : response?.assets || response?.data?.assets || [];

            setAssets(assetList);
        } catch (err) {
            setError(err.message || "Failed to load assets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const statusOptions = [
        ...new Set(
            assets
                .map((asset) => asset.status)
                .filter(Boolean)
        ),
    ];

    const filteredAssets =
        statusFilter === "all"
            ? assets
            : assets.filter(
                (asset) =>
                    asset.status?.toLowerCase() === statusFilter.toLowerCase()
            );

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!selectedAsset) return;

        try {
            setSaving(true);
            setSaveError("");
            await updateAsset(selectedAsset.id, formData);
            await fetchAssets();
            setSelectedAsset(null);
        } catch (err) {
            setSaveError(err.message || "Failed to update asset");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                    <p className="text-sm font-medium text-slate-400">
                        Loading assets...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-100">
                        Assets
                    </h1>
                </div>

            </div>

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-red-800 bg-red-950 p-4 text-sm text-red-300">
                    {error}
                </div>
            )}

            {/* Status Filter */}
            <div className="flex items-center justify-between gap-4">
                <CustomDropdown
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                        { value: "all", label: "Status" },
                        ...statusOptions.map((status) => ({
                            value: status,
                            label: status,
                        })),
                    ]}
                    className="w-44"
                />

                <span className="rounded-full bg-blue-900/70 px-3 py-1 text-xs font-semibold text-blue-300">
                    {assets.length} Assets
                </span>
            </div>

            {/* Assets Table */}
            <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">

                        <thead className="bg-slate-800 text-xs uppercase tracking-wide text-slate-400">
                            <tr>
                                <th className="whitespace-nowrap px-6 py-4">
                                    Asset
                                </th>

                                <th className="whitespace-nowrap px-6 py-4">
                                    Type
                                </th>

                                <th className="whitespace-nowrap px-6 py-4">
                                    Serial Number
                                </th>

                                <th className="whitespace-nowrap px-6 py-4">
                                    Status
                                </th>

                                <th className="whitespace-nowrap px-6 py-4">
                                    Employee
                                </th>

                                <th className="whitespace-nowrap px-6 py-4">
                                    Purchase Date
                                </th>

                                <th className="whitespace-nowrap px-6 py-4 text-center">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-700">
                            {filteredAssets.map((asset) => (
                                <tr
                                    key={asset.id}
                                    className="transition hover:bg-slate-800"
                                >
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
                                                <Package size={18} />
                                            </div>

                                            <span className="font-medium text-slate-100">
                                                {asset.name || asset.asset_name || "—"}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-slate-400">
                                        {asset.type || asset.asset_type || "—"}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-slate-400">
                                        {asset.serial_number || "—"}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4">
                                        <StatusBadge status={asset.status} />
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <UserRound
                                                size={16}
                                                className="text-slate-400"
                                            />

                                            {asset.employee_name ||
                                                asset.assigned_to ||
                                                "Unassigned"}
                                        </div>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <CalendarDays
                                                size={16}
                                                className="text-slate-400"
                                            />

                                            {asset.purchase_date
                                                ? new Date(
                                                    asset.purchase_date
                                                ).toLocaleDateString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                                : "—"}
                                        </div>
                                    </td>

                                    {/* Edit Action */}
                                    <td className="whitespace-nowrap px-6 py-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate("/assets/add", {
                                                    state: { asset },
                                                })
                                            }
                                            className="inline-flex items-center gap-2 text-blue-400 transition hover:text-blue-300"
                                        >
                                            <Pencil size={17} />
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filteredAssets.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-16 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <Package
                                                size={28}
                                                className="text-slate-400"
                                            />

                                            <p className="font-medium text-slate-300">
                                                {statusFilter === "all"
                                                    ? "No assets found"
                                                    : "No assets match this status"}
                                            </p>

                                            <p className="text-sm text-slate-400">
                                                {statusFilter === "all"
                                                    ? "Start by adding your first asset."
                                                    : "Try selecting a different status filter."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Asset Modal */}
            {selectedAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-slate-900 shadow-2xl">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-5">
                            <div>
                                <h2 className="text-xl font-bold text-slate-100">
                                    Edit Asset
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    Update asset information.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedAsset(null)}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleUpdate} className="space-y-5 p-6">

                            {saveError && (
                                <div className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
                                    {saveError}
                                </div>
                            )}

                            {/* Asset Name */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Asset Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-900"
                                />
                            </div>

                            {/* Asset Type */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Asset Type
                                </label>

                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-900"
                                >
                                    <option value="">Select type</option>
                                    <option value="Laptop">Laptop</option>
                                    <option value="Monitor">Monitor</option>
                                    <option value="Mouse">Mouse</option>
                                    <option value="Keyboard">Keyboard</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Serial Number */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Serial Number
                                </label>

                                <input
                                    type="text"
                                    name="serial_number"
                                    value={formData.serial_number}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-900"
                                />
                            </div>

                            {/* Assigned To */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Assigned To
                                </label>

                                <input
                                    type="text"
                                    name="assigned_to"
                                    value={formData.assigned_to}
                                    onChange={handleChange}
                                    placeholder="Enter employee name"
                                    className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-900"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-900"
                                >
                                    <option value="Available">Available</option>
                                    <option value="Assigned">Assigned</option>
                                    <option value="Maintenance">Maintenance</option>
                                </select>
                            </div>

                            {/* Purchase Date */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Purchase Date
                                </label>

                                <input
                                    type="date"
                                    name="purchase_date"
                                    value={formData.purchase_date}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-900"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                                <button
                                    type="button"
                                    onClick={() => setSelectedAsset(null)}
                                    disabled={saving}
                                    className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Save size={16} />
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assets;