import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
    return (
        <div className="min-h-screen bg-slate-100">
            <Sidebar />

            <main className="ml-64 min-h-screen p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;