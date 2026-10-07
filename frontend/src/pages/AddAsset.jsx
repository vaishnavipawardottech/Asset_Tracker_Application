import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import { createAsset, updateAsset } from "../services/assetService";
import { getEmployees } from "../services/employeeService";

const AddAsset = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editingAsset = location.state?.asset;

    const [employees, setEmployees] = useState([]);

    const [form, setForm] = useState(() => ({
        asset_name: editingAsset?.name || editingAsset?.asset_name || "",
        asset_type: editingAsset?.type || editingAsset?.asset_type || "",
        serial_number: editingAsset?.serial_number || "",
        status: editingAsset?.status || "Available",
        purchase_date: editingAsset?.purchase_date
            ? new Date(editingAsset.purchase_date).toISOString().slice(0, 10)
            : "",
        employee_id: editingAsset?.employee_id
            ? String(editingAsset.employee_id)
            : ""
    }));

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const purchaseDateRef = useRef(null);

    useEffect(() => {
        getEmployees()
            .then(setEmployees)
            .catch(err => setError(err.message));
    }, []);

    const assignedEmployeeName = editingAsset?.employee_name || editingAsset?.assigned_to;
    const existingEmployee = employees.find(
        employee => employee.name === assignedEmployeeName
    );
    const selectedEmployeeId = form.employee_id || (
        existingEmployee ? String(existingEmployee.id) : ""
    );

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "employee_id") {
            setForm(previous => ({
                ...previous,
                employee_id: value,
                status: value
                    ? "Assigned"
                    : previous.status === "Assigned"
                        ? "Available"
                        : previous.status
            }));
            return;
        }

        if (name === "status" && !form.employee_id && value === "Assigned") {
            return;
        }

        setForm(previous => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const payload = {
                ...form,
                name: form.asset_name,
                type: form.asset_type,
                employee_id: selectedEmployeeId
                    ? Number(selectedEmployeeId)
                    : null
            };

            if (editingAsset) {
                await updateAsset(editingAsset.id, payload);
            } else {
                await createAsset(payload);
            }

            navigate("/assets");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900";
    const selectClass = `${inputClass} appearance-none pr-12`;

    return (
        <div className="w-full space-y-6">

            <div>
                <h1 className="text-3xl font-bold text-slate-100">
                {editingAsset ? "Edit Asset" : "Add Asset"}
                </h1>

                <p className="mt-1 text-slate-400">
                    {editingAsset
                        ? "Update asset information."
                        : "Register a new organizational asset."}
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="max-w-3xl space-y-5"
            >

                {error && (
                    <div className="rounded-lg bg-red-950 p-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Asset Name *
                    </label>

                    <input
                        name="asset_name"
                        value={form.asset_name}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        placeholder="Dell Latitude 5440"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Asset Type *
                    </label>

                    <div className="relative">
                        <select
                            name="asset_type"
                            value={form.asset_type}
                            onChange={handleChange}
                            required
                            className={selectClass}
                        >
                            <option value="">Select type</option>
                            <option value="Laptop">Laptop</option>
                            <option value="Monitor">Monitor</option>
                            <option value="Mouse">Mouse</option>
                            <option value="Keyboard">Keyboard</option>
                            <option value="Other">Other</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Serial Number *
                    </label>

                    <input
                        name="serial_number"
                        value={form.serial_number}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        placeholder="e.g. DL-001"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Status *
                    </label>

                    <div className="relative">
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            required
                            disabled={Boolean(form.employee_id)}
                            className={selectClass}
                        >
                            <option value="Available">Available</option>
                            {form.employee_id && (
                                <option value="Assigned">Assigned</option>
                            )}
                            <option value="Maintenance">Maintenance</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Purchase Date
                    </label>

                    <div
                        className="[color-scheme:dark]"
                        onClick={() => purchaseDateRef.current?.showPicker?.()}
                    >
                        <input
                            ref={purchaseDateRef}
                            type="date"
                            name="purchase_date"
                            value={form.purchase_date}
                            onChange={handleChange}
                            className={`${inputClass} [&::-webkit-calendar-picker-indicator]:opacity-70`}
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Assigned To
                    </label>

                    <div className="relative">
                        <select
                            name="employee_id"
                            value={selectedEmployeeId}
                            onChange={handleChange}
                            className={selectClass}
                        >
                                <option value="">Unassigned</option>

                            {employees.map(employee => (
                                <option
                                    key={employee.id}
                                    value={employee.id}
                                >
                                    {employee.name} ({employee.email})
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">

                    <button
                        type="button"
                        onClick={() => navigate("/assets")}
                        className="rounded-lg border border-slate-600 px-5 py-3 text-slate-300 hover:bg-slate-800"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading
                            ? "Saving..."
                            : editingAsset
                                ? "Save Changes"
                                : "Create Asset"}
                    </button>

                </div>
            </form>
        </div>
    );
};

export default AddAsset;