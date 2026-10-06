import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { getEmployeeWithAssets } from "../services/employeeService";
import StatusBadge from "../components/StatusBadge";

const EmployeeDetails = () => {
    const { id } = useParams();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getEmployeeWithAssets(id)
            .then(setData)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return <p className="py-20 text-center">Loading employee...</p>;
    }

    if (error) {
        return <div className="text-red-600">{error}</div>;
    }

    return (
        <div className="space-y-6">

            <Link
                to="/employees"
                className="mb-4 inline-flex items-center gap-3 text-lg font-medium text-blue-500 hover:text-blue-400"
            >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-600 text-slate-300 transition hover:bg-slate-800">
                    <ArrowLeft size={18} />
                </span>
                Employees
            </Link>

            <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm">

                <h1 className="text-2xl font-bold text-slate-100">
                    {data.employee.name}
                </h1>

                <p className="mt-2 text-slate-400">
                    {data.employee.email}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <p className="text-xs text-slate-400">Phone</p>
                        <p className="mt-1 font-medium">
                            {data.employee.phone || "—"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-400">Department</p>
                        <p className="mt-1 font-medium">
                            {data.employee.department || "—"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-400">Designation</p>
                        <p className="mt-1 font-medium">
                            {data.employee.designation || "—"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900 shadow-sm">

                <div className="border-b border-slate-700 p-5">
                    <h2 className="text-lg font-semibold">
                        Assigned Assets ({data.assetCount})
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">

                        <thead className="bg-slate-800 text-xs uppercase text-slate-400">
                            <tr>
                                <th className="px-6 py-4">Asset</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Purchase Date</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-700">
                            {data.assets.map(asset => (
                                <tr key={asset.id}>
                                    <td className="px-6 py-4 font-medium">
                                        {asset.asset_name}
                                    </td>

                                    <td className="px-6 py-4">
                                        <StatusBadge status={asset.status} />
                                    </td>

                                    <td className="px-6 py-4">
                                        {asset.purchase_date
                                            ? new Date(asset.purchase_date).toLocaleDateString()
                                            : "—"}
                                    </td>
                                </tr>
                            ))}

                            {data.assets.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-10 text-center text-slate-400">
                                        No assets assigned to this employee.
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

export default EmployeeDetails;