'use client';

import React, { useRef, useLayoutEffect } from 'react';
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
        <div ref={containerRef} className="pt-32 pb-20 border-b border-black/10">
            <div className="max-w-4xl">
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
                        className="group flex items-center gap-3 bg-black text-cream px-8 py-4 rounded-none hover:bg-neutral-800 transition-all font-mono text-sm uppercase tracking-wider"
                    >
                        Start Building
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};
