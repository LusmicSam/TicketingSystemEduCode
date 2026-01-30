import { useState, useEffect } from 'react';

/**
 * Confetti celebration effect - triggers on ticket submission success
 */
export default function Confetti({ trigger, duration = 3000 }) {
    const [particles, setParticles] = useState([]);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (trigger) {
            createParticles();
            setIsActive(true);
            const timer = setTimeout(() => {
                setIsActive(false);
                setParticles([]);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [trigger, duration]);

    const createParticles = () => {
        const colors = ['#a855f7', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];
        const newParticles = [];

        for (let i = 0; i < 50; i++) {
            newParticles.push({
                id: i,
                x: Math.random() * 100,
                delay: Math.random() * 0.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * 360,
            });
        }
        setParticles(newParticles);
    };

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute animate-confetti"
                    style={{
                        left: `${particle.x}%`,
                        top: '-20px',
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: particle.color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        transform: `rotate(${particle.rotation}deg)`,
                        animationDelay: `${particle.delay}s`,
                        animationDuration: `${2 + Math.random()}s`,
                    }}
                />
            ))}
        </div>
    );
}
