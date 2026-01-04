'use client';

import React, { useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';

export const HeroSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subRef = useRef<HTMLParagraphElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Typing/Reveal Effect for Title
            tl.from(titleRef.current, {
                y: 100,
                opacity: 0,
                duration: 1.2,
                ease: "power4.out",
                skewY: 7,
            })
                .from(subRef.current, {
                    y: 20,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out",
                }, "-=0.8")
                .from(btnRef.current, {
                    scale: 0.9,
                    opacity: 0,
                    duration: 0.5,
                }, "-=0.6");

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="pt-32 pb-20 border-b border-black/10 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="max-w-2xl relative z-10">
                    <h1
                        ref={titleRef}
                        className="text-7xl md:text-9xl font-bold tracking-tighter text-black leading-[0.9] mb-8"
                    >
                        Structure<br />
                        Your Vision.
                    </h1>

                    <div className="flex flex-col md:flex-row gap-12 items-start mt-12 pl-2">
                        <p ref={subRef} className="text-lg md:text-xl text-neutral-600 font-mono max-w-md leading-relaxed">
                            We replaced the drag-and-drop chaos with intelligence. Turn your raw prompts into fully deployed WordPress realities in seconds.
                        </p>

                        <button
                            ref={btnRef}
                            onClick={() => {
                                // Scroll to Bento Features or trigger existing flow if needed
                                const bento = document.getElementById('bento-grid');
                                bento?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="group flex items-center gap-3 bg-black text-cream px-8 py-4 rounded-none hover:bg-neutral-800 transition-all font-mono text-sm uppercase tracking-wider whitespace-nowrap"
                        >
                            Start Building
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Self-Assembling Wireframe Animation */}
                <div className="relative h-[400px] hidden md:block opacity-80 select-none pointer-events-none">
                    {/* Floating Blocks Container */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {/* Header Block */}
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.5, ease: "backOut" }}
                            className="absolute top-[10%] w-[80%] h-16 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20"
                        />
                        {/* Hero Image Block */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.7, ease: "backOut" }}
                            className="absolute top-[25%] left-[5%] w-[50%] h-48 border-2 border-dashed border-black/30 bg-black/5 z-10"
                        />
                        {/* Hero Text Block */}
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.9, ease: "backOut" }}
                            className="absolute top-[30%] right-[10%] w-[30%] h-32 border-2 border-black bg-neutral-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] z-20"
                        />
                        {/* Grid Items Block */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 1.1, ease: "backOut" }}
                            className="absolute bottom-[10%] left-[10%] w-[25%] h-24 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20"
                        />
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 1.2, ease: "backOut" }}
                            className="absolute bottom-[10%] left-[40%] w-[25%] h-24 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20"
                        />
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 1.3, ease: "backOut" }}
                            className="absolute bottom-[10%] left-[70%] w-[15%] h-24 border-2 border-black bg-black z-20"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
