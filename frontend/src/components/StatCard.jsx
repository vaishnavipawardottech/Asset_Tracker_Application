const StatCard = ({ title, value, icon: Icon, color }) => {
    return (
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-400">
                    {title}
                </p>

                <div className={`rounded-lg p-3 ${color}`}>
                    <Icon size={22} />
                </div>
            </div>

            <h2 className="mt-4 text-3xl font-bold text-slate-100">
                {value}
            </h2>
        </div>
    );
};

export default StatCard;