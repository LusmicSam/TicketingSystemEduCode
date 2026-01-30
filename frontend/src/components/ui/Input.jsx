import { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    icon: Icon,
    error,
    className = '',
    ...props
}, ref) => {
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <Icon
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                    />
                )}
                <input
                    ref={ref}
                    className={`
            w-full px-4 py-3 rounded-xl 
            bg-slate-800/50 border border-slate-700 
            text-white placeholder-slate-500
            focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
            outline-none transition-all duration-200
            ${Icon ? 'pl-12' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
