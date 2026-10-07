import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createEmployee } from "../services/employeeService";

const AddEmployee = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        department: "",
        designation: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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
        setSuccess("");

        try {
            await createEmployee(form);

            setSuccess("Employee created successfully!");

            setTimeout(() => {
                navigate("/employees");
            }, 800);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900";

    return (
        <div className="w-full space-y-6">

            <div>
                <h1 className="text-3xl font-bold text-slate-100">
                    Add Employee
                </h1>

                {/* <p className="mt-1 text-slate-400">
                    Enter employee details.
                </p> */}
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

                {success && (
                    <div className="rounded-lg bg-emerald-950 p-3 text-sm text-emerald-300">
                        {success}
                    </div>
                )}

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Employee Name *
                    </label>

                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        placeholder="Enter full name"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Email *
                    </label>

                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        placeholder="employee@example.com"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Phone
                    </label>

                    <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Phone number"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Department
                    </label>

                    <input
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Engineering"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Designation
                    </label>

                    <input
                        name="designation"
                        value={form.designation}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Software Engineer"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">

                    <button
                        type="button"
                        onClick={() => navigate("/employees")}
                        className="rounded-lg border border-slate-600 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? "Saving..." : "Create Employee"}
                    </button>

                </div>
            </form>
        </div>
    );
};

export default AddEmployee;