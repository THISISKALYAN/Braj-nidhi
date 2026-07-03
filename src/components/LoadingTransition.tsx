"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingTransition() {
    const [isNavigating, setIsNavigating] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Reset navigating state when the pathname changes (i.e. the new page has loaded)
    useEffect(() => {
        setIsNavigating(false);
    }, [pathname]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('a');
            
            // Check if it's an internal link
            if (target && target.href && target.href.startsWith(window.location.origin) && !target.href.includes('#')) {
                const url = new URL(target.href);
                // If it's navigating to a different page
                if (url.pathname !== pathname) {
                    e.preventDefault();
                    setIsNavigating(true);
                    
                    // Delay navigation to show animation
                    setTimeout(() => {
                        router.push(url.pathname + url.search);
                    }, 1200); // 1.2 seconds for a smoother luxury transition
                }
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [pathname, router]);

    return (
        <AnimatePresence>
            {isNavigating && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)', // Transparent glass effect
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        zIndex: 99999,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '20px'
                        }}
                    >
                        <img loading="lazy" decoding="async" src="/Braj_nidhi_.webp" 
                            alt="Braj Nidhi Loading" 
                            style={{ 
                                width: '220px', 
                                height: 'auto',
                                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.08))' 
                            }} />
                    </motion.div>
                    
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "120px" }}
                        transition={{ duration: 0.8, ease: "easeInOut", delay: 0.3 }}
                        style={{
                            height: '2px',
                            backgroundColor: '#d4af37',
                            marginTop: '25px'
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
