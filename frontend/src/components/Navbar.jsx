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
        <nav className="navbar">
            <div className="navbar-brand">
                Asset Tracker
            </div>

            <div className="navbar-links">
                <a href="/dashboard">
                    Dashboard
                </a>

                {user && (
                    <span className="navbar-user">
                        {user.email}
                    </span>
                )}

                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;