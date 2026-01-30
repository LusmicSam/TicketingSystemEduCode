const Select = ({
    label,
    options = [],
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <select
                className={`
          w-full px-4 py-3 rounded-xl 
          bg-slate-800/50 border border-slate-700 
          text-white
          focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
          outline-none transition-all duration-200
          cursor-pointer appearance-none
          bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")]
          bg-no-repeat bg-[right_1rem_center]
          ${className}
        `}
                {...props}
            >
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        className="bg-slate-900 text-white"
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Select;
