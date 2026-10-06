const StatusBadge = ({ status }) => {
    const styles = {
        Available: "bg-emerald-900/70 text-emerald-300",
        Assigned: "bg-blue-900/70 text-blue-300",
        Maintenance: "bg-amber-900/70 text-amber-300",
        "Under Maintenance": "bg-amber-900/70 text-amber-300"
    };

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
                styles[status] || "bg-slate-800 text-slate-300"
            }`}
        >
            {status}
        </span>
    );
};

export default StatusBadge;