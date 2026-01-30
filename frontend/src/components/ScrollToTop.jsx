import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * Scroll to top button - appears when scrolled down
 */
export default function ScrollToTop({ threshold = 300 }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > threshold);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-20 right-6 z-40 w-10 h-10 rounded-full bg-[var(--color-primary)] text-white shadow-lg flex items-center justify-center hover:bg-[var(--color-primary-hover)] transition-all hover:scale-110 animate-fade-in"
            aria-label="Scroll to top"
        >
            <ArrowUp size={18} />
        </button>
    );
}
