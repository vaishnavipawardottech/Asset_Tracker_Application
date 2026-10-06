import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createAsset } from "../services/assetService";
import { getEmployees } from "../services/employeeService";

const AddAsset = () => {
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);

    const [form, setForm] = useState({
        asset_name: "",
        asset_type: "",
        status: "Available",
        purchase_date: "",
        employee_id: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        getEmployees()
            .then(setEmployees)
            .catch(err => setError(err.message));
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            await createAsset({
                ...form,
                employee_id: form.employee_id
                    ? Number(form.employee_id)
                    : null
            });

            navigate("/assets");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900";

    return (
        <div className="mx-auto max-w-3xl space-y-6">

            <div>
                <h1 className="text-3xl font-bold text-slate-100">
                    Add Asset
                </h1>

                <p className="mt-1 text-slate-400">
                    Register a new organizational asset.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-xl border border-slate-700 bg-slate-900 p-8 shadow-sm"
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

                    <select
                        name="asset_type"
                        value={form.asset_type}
                        onChange={handleChange}
                        required
                        className={inputClass}
                    >
                        <option value="">Select type</option>
                        <option value="Laptop">Laptop</option>
                        <option value="Monitor">Monitor</option>
                        <option value="Mouse">Mouse</option>
                        <option value="Keyboard">Keyboard</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Status *
                    </label>

                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        required
                        className={inputClass}
                    >
                        <option value="Available">Available</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Maintenance">Maintenance</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Purchase Date
                    </label>

                    <input
                        type="date"
                        name="purchase_date"
                        value={form.purchase_date}
                        onChange={handleChange}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Assign Employee
                    </label>

                    <select
                        name="employee_id"
                        value={form.employee_id}
                        onChange={handleChange}
                        className={inputClass}
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
                        {loading ? "Saving..." : "Create Asset"}
                    </button>

                </div>
            </form>
        </div>
    );
};

export default AddAsset;