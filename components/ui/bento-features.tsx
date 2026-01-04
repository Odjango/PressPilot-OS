'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Terminal, Cpu, Layout, Globe } from 'lucide-react';

const Card = ({ title, children, className = '' }: { title: string, children: React.ReactNode, className?: string }) => (
    <div className={`border border-black/10 bg-white p-6 md:p-8 flex flex-col justify-between group hover:border-black/30 transition-colors ${className}`}>
        <div className="mb-6">
            <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-2">{title}</h3>
            {children}
        </div>
        <div className="w-full h-px bg-black/5 mt-auto group-hover:bg-black/10 transition-colors" />
    </div>
);

export const BentoFeatures = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

    return (
        <section ref={targetRef} className="py-24 border-b border-black/10">
            <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-0 border-l border-t border-black/10">

                {/* Card 1: The Input (Large) */}
                <Card title="01_INPUT" className="md:col-span-2 md:row-span-1 border-r border-b border-black/10 min-h-[300px]">
                    <div className="flex items-start gap-4 mt-4">
                        <div className="w-10 h-10 bg-cream border border-black/10 flex items-center justify-center shrink-0">
                            <Terminal className="w-5 h-5 text-black" />
                        </div>
                        <div className="font-mono text-2xl md:text-3xl text-black leading-tight">
                            "Make a portfolio for a bold architectural photographer."
                        </div>
                    </div>
                </Card>

                {/* Card 2: The Tech (Tall) */}
                <Card title="04_STACK" className="md:col-span-1 md:row-span-2 border-r border-b border-black/10 bg-cream">
                    <div className="space-y-4 font-mono text-sm text-neutral-600">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            React / Next.js
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            WP Engine
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full" />
                            Core Blocks
                        </div>
                        <div className="mt-12 p-4 border border-black/10 bg-white">
                            <code className="text-xs break-all">
                                {`{ "mode": "heavy", "theme": "ollie" }`}
                            </code>
                        </div>
                    </div>
                </Card>

                {/* Card 3: The Engine */}
                <Card title="02_ENGINE" className="md:col-span-1 md:row-span-1 border-r border-b border-black/10 min-h-[300px]">
                    <div className="mt-4 flex flex-col gap-2">
                        <div className="relative w-8 h-8 mb-2">
                            <Cpu className="w-8 h-8 text-black absolute inset-0 z-10" />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-black/20 rounded-full z-0"
                            />
                        </div>
                        <p className="text-lg font-bold">AI Layout Logic</p>
                        <p className="text-sm text-neutral-500 max-w-[200px]">Constructing wireframes based on semantic intent.</p>
                    </div>
                </Card>

                {/* Card 4: The Output */}
                <Card title="03_OUTPUT" className="md:col-span-1 md:row-span-1 border-r border-b border-black/10 min-h-[300px] bg-neutral-100 text-black overflow-hidden relative group-hover:bg-white transition-colors">
                    <div className="mt-4 flex flex-col gap-2 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Layout className="w-5 h-5 text-neutral-400" />
                            <span className="font-mono text-xs uppercase tracking-wider text-neutral-400">Live Preview</span>
                        </div>

                        {/* Browser Window Placeholder */}
                        <div className="w-full h-40 bg-white border border-black/10 rounded-lg shadow-sm mt-2 flex flex-col overflow-hidden">
                            {/* Browser Bar */}
                            <div className="h-6 bg-neutral-50 border-b border-black/5 flex items-center px-2 gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-400/50" />
                                <div className="w-2 h-2 rounded-full bg-yellow-400/50" />
                                <div className="w-2 h-2 rounded-full bg-green-400/50" />
                                <div className="ml-2 w-full h-3 bg-white border border-black/5 rounded-sm" />
                            </div>
                            {/* Browser Content */}
                            <div className="flex-1 flex items-center justify-center p-4">
                                <div className="text-center space-y-2">
                                    <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin mx-auto" />
                                    <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Waiting for Generation...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

            </div>
        </section>
    );
};
