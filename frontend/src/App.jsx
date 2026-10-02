import { useEffect, useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useNavigate
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import AssetForm from "./components/AssetForm";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

import {
    getAssets,
    createAsset,
    updateAsset,
    deleteAsset
} from "./services/assetService";

function AssetTracker() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingAsset, setEditingAsset] = useState(null);

    const navigate = useNavigate();

    const loadAssets = async () => {
        try {
            const data = await getAssets();
            setAssets(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAssets();
    }, []);

    const handleAddAsset = async (asset) => {
        try {
            await createAsset(asset);
            await loadAssets();
        } catch (error) {
            console.error(error);
            alert("Failed to add asset");
        }
    };

    const handleEditAsset = (asset) => {
        setEditingAsset(asset);

        setTimeout(() => {
            document
                .getElementById("asset-form")
                ?.scrollIntoView({
                    behavior: "smooth"
                });
        }, 100);
    };

    const handleUpdateAsset = async (id, asset) => {
        try {
            await updateAsset(id, asset);

            setEditingAsset(null);

            await loadAssets();
        } catch (error) {
            console.error(error);
            alert("Failed to update asset");
        }
    };

    const handleDeleteAsset = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this asset?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteAsset(id);
            await loadAssets();
        } catch (error) {
            console.error(error);
            alert("Failed to delete asset");
        }
    };

    const handleCancelEdit = () => {
        setEditingAsset(null);
    };

    return (
        <>
            <Navbar />

            <main className="container">
                <Dashboard assets={assets} />

                {loading ? (
                    <p className="loading">
                        Loading assets...
                    </p>
                ) : (
                    <Assets
                        assets={assets}
                        onDelete={handleDeleteAsset}
                        onEdit={handleEditAsset}
                    />
                )}

                <div id="asset-form">
                    <AssetForm
                        onAdd={handleAddAsset}
                        onUpdate={handleUpdateAsset}
                        editingAsset={editingAsset}
                        onCancelEdit={handleCancelEdit}
                    />
                </div>
            </main>
        </>
    );
}

function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <AssetTracker />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />

            <Route
                path="*"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

export default App;