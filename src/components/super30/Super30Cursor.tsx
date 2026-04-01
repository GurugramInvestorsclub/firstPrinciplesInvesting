'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Super30Cursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(true);

    useEffect(() => {
        const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        setIsTouchDevice(!hasHover);

        if (!hasHover) return;

        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('a') || target.closest('button') || target.closest('input')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    if (isTouchDevice) return null;

    return (
        <div className="hidden lg:block">
            {/* Custom ring cursor */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-full border border-gold/30 pointer-events-none z-[100]"
                animate={{
                    x: mousePosition.x - 16,
                    y: mousePosition.y - 16,
                    scale: isHovering ? 1.5 : 1,
                    backgroundColor: isHovering ? 'rgba(245, 184, 0, 0.05)' : 'transparent',
                }}
                transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 15,
                    mass: 0.1
                }}
            />
            {/* Soft glow following the cursor */}
            <motion.div
                className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-[-1] blur-[100px]"
                animate={{
                    x: mousePosition.x - 200,
                    y: mousePosition.y - 200,
                    background: isHovering 
                        ? 'radial-gradient(circle, rgba(245, 184, 0, 0.08) 0%, rgba(0,0,0,0) 70%)' 
                        : 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, rgba(0,0,0,0) 70%)'
                }}
                transition={{
                    type: "tween",
                    ease: "linear",
                    duration: 0.1
                }}
            />
        </div>
    );
}
