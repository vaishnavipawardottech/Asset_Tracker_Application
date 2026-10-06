import { useNavigate } from "react-router-dom";
import {
    getCurrentUser,
    logoutUser
} from "../services/authService";

function Navbar() {
    const navigate = useNavigate();

    const user = getCurrentUser();

    const handleLogout = async () => {
        await logoutUser();

        navigate("/login", {
            replace: true
        });
    };

    return (
        <nav className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-6 py-4 text-slate-100">
            <div className="text-lg font-semibold">
                Asset Tracker
            </div>

            <div className="flex items-center gap-5 text-sm">
                <a href="/dashboard">
                    Dashboard
                </a>

                {user && (
                    <span className="text-slate-400">
                        {user.email}
                    </span>
                )}

                <button
                    className="rounded-lg px-3 py-2 text-red-400 transition hover:bg-red-950"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;