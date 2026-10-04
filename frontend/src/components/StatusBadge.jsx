const StatusBadge = ({ status }) => {
    const styles = {
        Available: "bg-emerald-100 text-emerald-700",
        Assigned: "bg-blue-100 text-blue-700",
        Maintenance: "bg-amber-100 text-amber-700",
        "Under Maintenance": "bg-amber-100 text-amber-700"
    };

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
                styles[status] || "bg-slate-100 text-slate-600"
            }`}
        >
            {status}
        </span>
    );
};

export default StatusBadge;