import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * Copy to clipboard button with feedback
 */
export default function CopyButton({ text, label = 'Copy', className = '' }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${copied
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]'
                } ${className}`}
            title={copied ? 'Copied!' : `Copy ${label}`}
        >
            {copied ? (
                <>
                    <Check size={12} />
                    <span>Copied!</span>
                </>
            ) : (
                <>
                    <Copy size={12} />
                    <span>{label}</span>
                </>
            )}
        </button>
    );
}

/**
 * Inline copy for ticket IDs
 */
export function CopyableText({ text, prefix = '', className = '' }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1 group cursor-pointer ${className}`}
            title={copied ? 'Copied!' : 'Click to copy'}
        >
            <span className="font-mono text-xs bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded">
                {prefix}{text}
            </span>
            {copied ? (
                <Check size={12} className="text-green-500" />
            ) : (
                <Copy size={12} className="opacity-0 group-hover:opacity-100 theme-text-muted transition-opacity" />
            )}
        </button>
    );
}
