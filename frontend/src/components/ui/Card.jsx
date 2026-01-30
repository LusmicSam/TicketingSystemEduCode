const Card = ({
    children,
    variant = 'default',
    hover = false,
    className = '',
    ...props
}) => {
    const variants = {
        default: 'bg-slate-900/50 border-slate-800',
        glass: 'glass',
        elevated: 'bg-slate-800 border-slate-700 shadow-xl',
        success: 'bg-emerald-900/20 border-emerald-500/30',
        warning: 'bg-amber-900/20 border-amber-500/30',
        primary: 'bg-indigo-900/20 border-indigo-500/30',
    };

    const hoverClasses = hover
        ? 'hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer hover:-translate-y-0.5'
        : '';

    return (
        <div
            className={`backdrop-blur-xl border rounded-2xl p-6 ${variants[variant]} ${hoverClasses} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
