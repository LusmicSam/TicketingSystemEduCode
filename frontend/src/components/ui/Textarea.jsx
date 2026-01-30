import { forwardRef } from 'react';

const Textarea = forwardRef(({
    label,
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
            <textarea
                ref={ref}
                className={`
          w-full px-4 py-3 rounded-xl 
          bg-slate-800/50 border border-slate-700 
          text-white placeholder-slate-500
          focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
          outline-none transition-all duration-200
          resize-none min-h-[120px]
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
        </div>
    );
});

Textarea.displayName = 'Textarea';

export default Textarea;
