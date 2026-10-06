import { useEffect, useState } from "react";

import {
    Laptop,
    UserCheck,
    Wrench,
    Users,
    Package,
    CalendarDays,
    UserRound,
} from "lucide-react";

import { getAssets } from "../services/assetService";
import { getEmployees } from "../services/employeeService";

import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";

const Dashboard = () => {
    const [assets, setAssets] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const [assetData, employeeData] = await Promise.all([
                    getAssets(),
                    getEmployees(),
                ]);

                // Handle asset response:
                // { success: true, assets: [...] }
                // or direct array [...]
                const assetList = Array.isArray(assetData)
                    ? assetData
                    : assetData?.assets || assetData?.data?.assets || [];

                // Handle employee response:
                // { success: true, employees: [...] }
                // or direct array [...]
                const employeeList = Array.isArray(employeeData)
                    ? employeeData
                    : employeeData?.employees ||
                      employeeData?.data?.employees ||
                      [];

                setAssets(assetList);
                setEmployees(employeeList);

            } catch (err) {
                setError(err.message || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    // Calculate statistics
    const assignedCount = assets.filter(
        (asset) => asset.status?.toLowerCase() === "assigned"
    ).length;

    const maintenanceCount = assets.filter(
        (asset) => asset.status?.toLowerCase() === "maintenance"
    ).length;

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                    <p className="text-sm font-medium text-slate-400">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-800 bg-red-950 p-5">
                <h2 className="font-semibold text-red-300">
                    Unable to load dashboard
                </h2>

                <p className="mt-1 text-sm text-red-400">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">

            {/* Dashboard Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-100">
                    Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                    Overview of your organization's assets.
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                    title="Total Assets"
                    value={assets.length}
                    icon={Laptop}
                    color="bg-blue-100 text-blue-600"
                />

                <StatCard
                    title="Assigned Assets"
                    value={assignedCount}
                    icon={UserCheck}
                    color="bg-emerald-100 text-emerald-600"
                />

                <StatCard
                    title="Under Maintenance"
                    value={maintenanceCount}
                    icon={Wrench}
                    color="bg-amber-100 text-amber-600"
                />

                <StatCard
                    title="Total Employees"
                    value={employees.length}
                    icon={Users}
                    color="bg-violet-100 text-violet-600"
                />

            </div>

            {/* All Assets Table */}
            <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-sm">

                {/* Table Header */}
                <div className="flex items-center justify-between border-b border-slate-700 px-6 py-5">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-100">
                            All Assets
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Overview of all registered assets.
                        </p>
                    </div>

                    <span className="rounded-full bg-blue-900/70 px-3 py-1 text-xs font-semibold text-blue-300">
                        {assets.length} Assets
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">

                        <thead className="bg-slate-800 text-xs uppercase tracking-wide text-slate-400">
                            <tr>
                                <th className="whitespace-nowrap px-6 py-4">
                                    Asset
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
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-700">

                            {assets.map((asset) => (
                                <tr
                                    key={asset.id}
                                    className="transition hover:bg-slate-800"
                                >

                                    {/* Asset Name */}
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
                                                <Package size={18} />
                                            </div>

                                            <span className="font-medium text-slate-100">
                                                {asset.name ||
                                                    asset.asset_name ||
                                                    "—"}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="whitespace-nowrap px-6 py-4 text-slate-400">
                                        <StatusBadge status={asset.status} />
                                    </td>

                                    {/* Employee */}
                                    <td className="whitespace-nowrap px-6 py-4 text-slate-400">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <UserRound
                                                size={16}
                                                className="text-slate-400"
                                            />

                                            <span>
                                                {asset.employee_name ||
                                                    asset.assigned_to ||
                                                    "Unassigned"}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Purchase Date */}
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <CalendarDays
                                                size={16}
                                                className="text-slate-400"
                                            />

                                            <span>
                                                {asset.purchase_date
                                                    ? new Date(
                                                        asset.purchase_date
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        }
                                                    )
                                                    : "—"}
                                            </span>
                                        </div>
                                    </td>

                                </tr>
                            ))}

                            {/* Empty State */}
                            {assets.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-16 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-3">

                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                                                <Package size={26} />
                                            </div>

                                            <p className="font-medium text-slate-300">
                                                No assets found
                                            </p>

                                            <p className="text-sm text-slate-400">
                                                Your registered assets will appear here.
                                            </p>

                                        </div>
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

export default Dashboard;