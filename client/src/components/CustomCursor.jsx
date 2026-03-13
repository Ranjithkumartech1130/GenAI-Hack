import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const CustomCursor = () => {
    const cursorRef = useRef(null);
    const trailRef = useRef(null);
    const [clicks, setClicks] = useState([]);

    useEffect(() => {
        const cursor = cursorRef.current;
        const trail = trailRef.current;
        if (!cursor || !trail) return;

        // Hide default cursor everywhere
        document.body.style.cursor = 'none';
        document.documentElement.style.cursor = 'none';

        const moveCursor = (e) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.08,
                ease: "power2.out"
            });
            gsap.to(trail, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.35,
                ease: "power3.out"
            });
        };

        const handleHover = (e) => {
            const interactives = 'button, a, input, select, textarea, .template-card, .task-item, .metric-card, .nav-tab, [role="button"], .editor-tab, .CodeMirror';
            if (e.target.closest(interactives)) {
                gsap.to(cursor, {
                    scale: 0.6,
                    duration: 0.3,
                    ease: "back.out(1.7)"
                });
                gsap.to(trail, {
                    scale: 2.5,
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    duration: 0.4,
                    ease: "power2.out"
                });
            } else {
                gsap.to(cursor, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
                gsap.to(trail, {
                    scale: 1,
                    borderColor: 'rgba(0, 255, 255, 0.4)',
                    background: 'transparent',
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        };

        const handleMouseDown = (e) => {
            gsap.to(cursor, { scale: 0.6, duration: 0.1 });
            gsap.to(trail, { scale: 0.6, duration: 0.1 });

            // Ripple effect on click
            const id = Date.now();
            setClicks(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
            setTimeout(() => setClicks(prev => prev.filter(c => c.id !== id)), 600);
        };

        const handleMouseUp = () => {
            gsap.to(cursor, { scale: 1, duration: 0.2, ease: "elastic.out(1, 0.5)" });
            gsap.to(trail, { scale: 1, duration: 0.2 });
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleHover);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleHover);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'auto';
            document.documentElement.style.cursor = 'auto';
        };
    }, []);

    return (
        <>
            {/* Main cursor arrow - bright white for max contrast */}
            <div
                ref={cursorRef}
                className="custom-cursor-element"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '28px',
                    height: '28px',
                    pointerEvents: 'none',
                    zIndex: 2147483647,
                    background: '#FFFFFF',
                    clipPath: 'polygon(0% 0%, 0% 100%, 25% 75%, 50% 100%, 65% 85%, 40% 65%, 75% 65%)',
                    transform: 'translate(-3px, -3px) rotate(-10deg)',
                    filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.9)) drop-shadow(0 0 8px rgba(0, 255, 255, 0.7)) drop-shadow(0 2px 4px rgba(0,0,0,1))',
                    mixBlendMode: 'normal',
                    willChange: 'transform'
                }}
            />
            {/* Trail ring */}
            <div
                ref={trailRef}
                className="custom-cursor-element"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '40px',
                    height: '40px',
                    pointerEvents: 'none',
                    zIndex: 2147483646,
                    border: '2px solid rgba(0, 255, 255, 0.4)',
                    borderRadius: '50%',
                    transform: 'translate(-20px, -20px)',
                    willChange: 'transform',
                    transition: 'border-color 0.3s ease, background 0.3s ease'
                }}
            />
            {/* Click ripple effects */}
            {clicks.map(click => (
                <div
                    key={click.id}
                    className="custom-cursor-element"
                    style={{
                        position: 'fixed',
                        left: click.x - 20,
                        top: click.y - 20,
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: '2px solid rgba(0, 255, 255, 0.6)',
                        pointerEvents: 'none',
                        zIndex: 2147483645,
                        animation: 'cursorRipple 0.6s ease-out forwards'
                    }}
                />
            ))}
            <style>{`
                @keyframes cursorRipple {
                    0% { transform: scale(0.5); opacity: 1; }
                    100% { transform: scale(3); opacity: 0; }
                }
            `}</style>
        </>
    );
};

export default CustomCursor;
