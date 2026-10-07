import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const CustomDropdown = ({
    value,
    options,
    onChange,
    placeholder = "Select an option",
    disabled = false,
    className = "",
}) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!dropdownRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const selectedOption = options.find((option) => option.value === value);

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((isOpen) => !isOpen)}
                className={`flex w-full items-center justify-between rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-left text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-900 ${
                    disabled ? "cursor-not-allowed opacity-60" : "hover:border-slate-500"
                }`}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className={selectedOption ? "text-slate-100" : "text-slate-500"}>
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronDown
                    size={18}
                    className={`ml-3 shrink-0 text-slate-400 transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {open && !disabled && (
                <div
                    className="absolute left-0 right-0 z-30 mt-2 max-h-60 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-xl"
                    role="listbox"
                >
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setOpen(false);
                            }}
                            className={`block w-full rounded-md px-3 py-2.5 text-left text-sm transition ${
                                option.value === value
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                            }`}
                            role="option"
                            aria-selected={option.value === value}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
