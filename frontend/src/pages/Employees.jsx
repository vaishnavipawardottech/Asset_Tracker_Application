import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye } from "lucide-react";

import { getEmployees } from "../services/employeeService";

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getEmployees()
            .then(setEmployees)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <p className="py-20 text-center">Loading employees...</p>;
    }

    return (
        <div className="space-y-6">

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">
                        All Employees
                    </h1>

                    <p className="mt-1 text-slate-400">
                        Manage employees and their assigned assets.
                    </p>
                </div>

            </div>

            {error && (
                <div className="rounded-lg bg-red-950 p-4 text-red-300">
                    {error}
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-sm">

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">

                        <thead className="bg-slate-800 text-xs uppercase text-slate-400">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Designation</th>
                                <th className="px-6 py-4">Assets Owned</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-700">

                            {employees.map(employee => (
                                <tr key={employee.id} className="hover:bg-slate-800">

                                    <td className="px-6 py-4 font-medium text-slate-100">
                                        {employee.name}
                                    </td>

                                    <td className="px-6 py-4 text-slate-400">
                                        {employee.email}
                                    </td>

                                    <td className="px-6 py-4 text-slate-400">
                                        {employee.department || "—"}
                                    </td>

                                    <td className="px-6 py-4 text-slate-400">
                                        {employee.designation || "—"}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="rounded-full bg-blue-900/70 px-3 py-1 text-xs font-medium text-blue-300">
                                            {employee.asset_count ?? 0} Assets
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <Link
                                            to={`/employees/${employee.id}`}
                                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                        >
                                            <Eye size={17} />
                                            View
                                        </Link>
                                    </td>

                                </tr>
                            ))}

                            {employees.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="6"
                                    className="px-6 py-12 text-center text-slate-400"
                                    >
                                        No employees added yet.
                                    </td>
                                </tr>
                            )}

                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Employees;