function AssetTable({ assets, onDelete, onEdit }) {

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString("en-GB");
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900 text-slate-100">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-800 text-xs uppercase text-slate-400">
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Serial Number</th>
                        <th>Assigned To</th>
                        <th>Status</th>
                        <th>Purchase Date</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>

                <tbody>
                    {assets.map((asset) => (
                        <tr key={asset.id} className="border-b border-slate-700">
                            <td>{asset.id}</td>

                            <td>{asset.name}</td>

                            <td>{asset.type}</td>

                            <td>{asset.serial_number}</td>

                            <td>{asset.assigned_to || "-"}</td>

                            <td>
                                <span
                                    className="rounded-full bg-blue-900/70 px-3 py-1 text-xs text-blue-300"
                                >
                                    {asset.status}
                                </span>
                            </td>

                            <td>
                                {formatDate(asset.purchase_date)}
                            </td>

                            <td>
                                <button
                                    className="rounded-lg p-2 text-blue-400 hover:bg-blue-950"
                                    onClick={() => onEdit(asset)}
                                    title="Edit asset"
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M12 20h9" />
                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                    </svg>
                                </button>
                            </td>

                            <td>
                                <button
                                    className="rounded-lg p-2 text-red-400 hover:bg-red-950"
                                    onClick={() => onDelete(asset.id)}
                                    title="Delete asset"
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M3 6h18" />
                                        <path d="M8 6V4h8v2" />
                                        <path d="M19 6l-1 14H6L5 6" />
                                        <path d="M10 11v5" />
                                        <path d="M14 11v5" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AssetTable;