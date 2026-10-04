import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
    LayoutDashboard,
    Users,
    Laptop,
    ChevronDown,
    ChevronRight,
    Plus,
    List,
    LogOut,
    Package
} from "lucide-react";

const Sidebar = () => {
    const [employeesOpen, setEmployeesOpen] = useState(true);
    const [assetsOpen, setAssetsOpen] = useState(true);

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
            isActive
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`;

    const subLinkClass = ({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
            isActive
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`;

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
    };

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-slate-950 text-white">

            <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
                <Package className="text-blue-400" size={26} />

                <h1 className="text-lg font-bold">
                    Asset Tracker
                </h1>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto p-4">

                <NavLink to="/dashboard" className={linkClass}>
                    <LayoutDashboard size={19} />
                    Dashboard
                </NavLink>

                {/* Employees */}
                <div>
                    <button
                        onClick={() => setEmployeesOpen(!employeesOpen)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                    >
                        <span className="flex items-center gap-3">
                            <Users size={19} />
                            Employees
                        </span>

                        {employeesOpen
                            ? <ChevronDown size={17} />
                            : <ChevronRight size={17} />
                        }
                    </button>

                    {employeesOpen && (
                        <div className="ml-5 mt-2 space-y-1 border-l border-slate-700 pl-3">

                            <NavLink
                                to="/employees/add"
                                className={subLinkClass}
                            >
                                <Plus size={16} />
                                Add Employee
                            </NavLink>

                            <NavLink
                                to="/employees"
                                end
                                className={subLinkClass}
                            >
                                <List size={16} />
                                All Employees
                            </NavLink>

                        </div>
                    )}
                </div>

                {/* Assets */}
                <div>
                    <button
                        onClick={() => setAssetsOpen(!assetsOpen)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                    >
                        <span className="flex items-center gap-3">
                            <Laptop size={19} />
                            Assets
                        </span>

                        {assetsOpen
                            ? <ChevronDown size={17} />
                            : <ChevronRight size={17} />
                        }
                    </button>

                    {assetsOpen && (
                        <div className="ml-5 mt-2 space-y-1 border-l border-slate-700 pl-3">

                            <NavLink
                                to="/assets/add"
                                className={subLinkClass}
                            >
                                <Plus size={16} />
                                Add Asset
                            </NavLink>

                            <NavLink
                                to="/assets"
                                end
                                className={subLinkClass}
                            >
                                <List size={16} />
                                All Assets
                            </NavLink>

                        </div>
                    )}
                </div>
            </nav>

            <div className="border-t border-slate-800 p-4">

                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold">
                        {(user.email || "U")[0].toUpperCase()}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                            {user.email || "User"}
                        </p>

                        <p className="text-xs text-slate-400">
                            Logged in
                        </p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;