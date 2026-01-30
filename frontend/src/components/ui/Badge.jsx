const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    className = ''
}) => {
    const variants = {
        default: 'bg-slate-700 text-slate-200 border-slate-600',
        primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        danger: 'bg-red-500/10 text-red-400 border-red-500/20',
        info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
    };

    return (
        <span
            className={`
        inline-flex items-center font-semibold rounded-full border
        ${variants[variant]} ${sizes[size]} ${className}
      `}
        >
            {children}
        </span>
    );
};

export default Badge;
