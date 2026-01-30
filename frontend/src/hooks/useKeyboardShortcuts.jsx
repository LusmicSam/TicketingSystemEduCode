import { useEffect, useCallback } from 'react';

/**
 * Hook to handle keyboard shortcuts
 * @param {Object} shortcuts - Object with key combinations as keys and handlers as values
 * @param {boolean} enabled - Whether shortcuts are enabled
 */
export default function useKeyboardShortcuts(shortcuts, enabled = true) {
    const handleKeyDown = useCallback((event) => {
        if (!enabled) return;

        // Don't trigger shortcuts when typing in inputs
        const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);
        const isContentEditable = event.target.isContentEditable;

        // Build key string
        const key = [];
        if (event.ctrlKey || event.metaKey) key.push('ctrl');
        if (event.shiftKey) key.push('shift');
        if (event.altKey) key.push('alt');
        key.push(event.key.toLowerCase());
        const keyString = key.join('+');

        // Check for matching shortcut
        for (const [shortcut, handler] of Object.entries(shortcuts)) {
            const normalizedShortcut = shortcut.toLowerCase().replace(/\s/g, '');

            if (keyString === normalizedShortcut) {
                // Some shortcuts should work even in inputs
                const globalShortcuts = ['escape', 'ctrl+k'];

                if (isInput && !isContentEditable && !globalShortcuts.includes(normalizedShortcut)) {
                    continue;
                }

                event.preventDefault();
                handler(event);
                return;
            }
        }
    }, [shortcuts, enabled]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

// Shortcut hints component
export function ShortcutHint({ keys, className = '' }) {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {keys.map((key, i) => (
                <span key={i}>
                    <kbd className="px-1.5 py-0.5 text-xs font-mono bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded theme-text-muted">
                        {key}
                    </kbd>
                    {i < keys.length - 1 && <span className="mx-0.5 theme-text-muted">+</span>}
                </span>
            ))}
        </div>
    );
}
