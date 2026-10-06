import { useEffect, useState } from "react";

const emptyForm = {
    name: "",
    type: "",
    serial_number: "",
    assigned_to: "",
    status: "Available",
    purchase_date: ""
};

function AssetForm({ onAdd, onUpdate, editingAsset, onCancelEdit }) {
    const [formData, setFormData] = useState(emptyForm);

    // useEffect(() => {
    //     if (editingAsset) {
    //         setFormData({
    //             name: editingAsset.name || "",
    //             type: editingAsset.type || "",
    //             serial_number: editingAsset.serial_number || "",
    //             assigned_to: editingAsset.assigned_to || "",
    //             status: editingAsset.status || "Available",
    //             purchase_date: editingAsset.purchase_date
    //                 ? editingAsset.purchase_date.split("T")[0]
    //                 : ""
    //         });
    //     } else {
    //         setFormData(emptyForm);
    //     }
    // }, [editingAsset]);

    useEffect(() => {
        if (editingAsset) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                name: editingAsset.name || "",
                type: editingAsset.type || "",
                serial_number: editingAsset.serial_number || "",
                assigned_to: editingAsset.assigned_to || "",
                status: editingAsset.status || "Available",
                purchase_date: editingAsset.purchase_date
                    ? editingAsset.purchase_date.split("T")[0]
                    : ""
            });
        } else {
            setFormData(emptyForm);
        }
    }, [editingAsset]);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (editingAsset) {
            await onUpdate(editingAsset.id, formData);
        } else {
            await onAdd(formData);
        }

        setFormData(emptyForm);
    };

    const handleCancel = () => {
        setFormData(emptyForm);
        onCancelEdit();
    };

    return (
        <section className="rounded-xl border border-slate-700 bg-slate-900 p-8 text-slate-100">
            <div className="mb-6">
                <div>
                    <h2>
                        {editingAsset ? "Edit Asset" : "Add Asset"}
                    </h2>

                    <p className="text-slate-400">
                        {editingAsset
                            ? "Update the selected asset details."
                            : "Register a new IT asset."}
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="grid gap-5"
            >
                <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-300">Asset Name</label>

                    <input
                        type="text"
                        name="name"
                        placeholder="e.g. Dell Latitude 5440"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-300">Type</label>

                    <input
                        type="text"
                        name="type"
                        placeholder="e.g. Laptop"
                        value={formData.type}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-300">Serial Number</label>

                    <input
                        type="text"
                        name="serial_number"
                        placeholder="e.g. DL-001"
                        value={formData.serial_number}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-300">Assigned To</label>

                    <input
                        type="text"
                        name="assigned_to"
                        placeholder="e.g. Vaishnavi"
                        value={formData.assigned_to}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-300">Status</label>

                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900"
                    >
                        <option value="Available">
                            Available
                        </option>

                        <option value="Assigned">
                            Assigned
                        </option>

                        <option value="Maintenance">
                            Maintenance
                        </option>
                    </select>
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-300">Purchase Date</label>

                    <input
                        type="date"
                        name="purchase_date"
                        value={formData.purchase_date}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900"
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
                    >
                        {editingAsset
                            ? "Update Asset"
                            : "Add Asset"}
                    </button>

                    {editingAsset && (
                        <button
                            type="button"
                            className="rounded-lg border border-slate-600 px-5 py-3 font-medium text-slate-300 hover:bg-slate-800"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </section>
    );
}

export default AssetForm;