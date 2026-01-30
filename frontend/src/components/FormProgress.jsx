/**
 * Form Progress Indicator - Shows completion percentage
 */
export default function FormProgress({ steps, currentStep, className = '' }) {
    const percentage = Math.round((currentStep / steps.length) * 100);

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Progress bar */}
            <div className="h-1 bg-[var(--color-border)] rounded-full overflow-hidden">
                <div
                    className="h-full bg-[var(--color-primary)] transition-all duration-300 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Step indicators */}
            <div className="flex justify-between text-xs">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={`flex items-center gap-1 transition-colors ${index < currentStep
                                ? 'text-[var(--color-primary)]'
                                : index === currentStep
                                    ? 'theme-text'
                                    : 'theme-text-muted'
                            }`}
                    >
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-medium ${index < currentStep
                                ? 'bg-[var(--color-primary)] text-white'
                                : index === currentStep
                                    ? 'border-2 border-[var(--color-primary)] text-[var(--color-primary)]'
                                    : 'border border-[var(--color-border)]'
                            }`}>
                            {index < currentStep ? '✓' : index + 1}
                        </span>
                        <span className="hidden sm:inline">{step}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Simple linear progress - for form fields
 */
export function FieldProgress({ value, max, showLabel = true, warningThreshold = 0.8 }) {
    const percentage = Math.min((value / max) * 100, 100);
    const isWarning = value / max >= warningThreshold;
    const isOver = value > max;

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-[var(--color-border)] rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-150 ${isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-[var(--color-primary)]'
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <span className={`text-xs font-medium tabular-nums ${isOver ? 'text-red-500' : isWarning ? 'text-amber-500' : 'theme-text-muted'
                    }`}>
                    {value}/{max}
                </span>
            )}
        </div>
    );
}
