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
                        <Cpu className="w-8 h-8 text-black mb-2" />
                        <p className="text-lg font-bold">AI Layout Logic</p>
                        <p className="text-sm text-neutral-500 max-w-[200px]">Constructing wireframes based on semantic intent.</p>
                    </div>
                </Card>

                {/* Card 4: The Output */}
                <Card title="03_OUTPUT" className="md:col-span-1 md:row-span-1 border-r border-b border-black/10 min-h-[300px] bg-black text-cream">
                    <div className="mt-4 flex flex-col gap-2">
                        <Layout className="w-8 h-8 text-cream mb-2" />
                        <p className="text-lg font-bold">Live Preview</p>
                        <div className="w-full h-32 bg-neutral-900 border border-neutral-800 rounded-sm mt-4 relative overflow-hidden">
                            <div className="absolute top-2 left-2 w-20 h-2 bg-neutral-800 rounded-sm" />
                            <div className="absolute top-6 left-2 w-12 h-12 bg-neutral-800 rounded-sm" />
                            <div className="absolute top-6 left-16 right-2 h-12 bg-neutral-800 rounded-sm" />
                        </div>
                    </div>
                </Card>

            </div>
        </section>
    );
};
