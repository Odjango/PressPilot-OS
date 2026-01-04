'use client';

import { motion } from 'framer-motion';
import { Layout, Sun, Contrast, ExternalLink, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlowButton } from './glow-button';

interface SitePreviews {
    original: string;
    high_contrast: string;
    inverted: string;
}

interface SitePreviewDeckProps {
    previews: SitePreviews;
    onReset: () => void;
    onSelect: (url: string) => void;
}

export function SitePreviewDeck({ previews, onReset, onSelect }: SitePreviewDeckProps) {
    const cards = [
        {
            id: 'original',
            title: 'Original Style',
            description: 'Primary brand colors and balanced spacing.',
            icon: Layout,
            url: previews.original,
            color: 'from-blue-500/20 to-indigo-500/20',
            borderColor: 'group-hover:border-blue-500/50',
            iconColor: 'text-blue-400',
        },
        {
            id: 'high_contrast',
            title: 'High Contrast',
            description: 'Strict black & white for maximum readability.',
            icon: Contrast,
            url: previews.high_contrast,
            color: 'from-zinc-500/20 to-zinc-900/20',
            borderColor: 'group-hover:border-zinc-500/50',
            iconColor: 'text-zinc-100',
        },
        {
            id: 'inverted',
            title: 'Inverted',
            description: 'Dark mode with vibrant secondary accents.',
            icon: Sun,
            url: previews.inverted,
            color: 'from-purple-500/20 to-pink-500/20',
            borderColor: 'group-hover:border-purple-500/50',
            iconColor: 'text-purple-400',
        },
    ];

    return (
        <div className="space-y-8 select-none">
            <div className="text-center space-y-2">
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-black"
                >
                    Blueprints Generated
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-neutral-500 text-sm"
                >
                    Select a variation to preview in the Live Output.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto px-6">
                {cards.map((card, index) => (
                    <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                    >
                        <div
                            onClick={() => card.url && onSelect(card.url)}
                            className={cn(
                                "group relative flex flex-col items-start gap-4 p-6 rounded-none border border-black/10 bg-white hover:border-black transition-all duration-300 h-full",
                                card.url ? "cursor-pointer" : "opacity-50 cursor-not-allowed",
                                card.borderColor
                            )}
                        >
                            {/* Icon */}
                            <div className="flex items-center justify-between w-full">
                                <div className="p-2 bg-neutral-100">
                                    <card.icon className={cn("w-5 h-5 text-black")} />
                                </div>
                                {card.url && (
                                    <a
                                        href={card.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs font-mono underline text-neutral-400 hover:text-black"
                                    >
                                        New Tab ↗
                                    </a>
                                )}
                            </div>

                            {/* Content */}
                            <div className="mt-4">
                                <h3 className="text-black font-bold font-mono text-sm uppercase tracking-wider mb-2">
                                    {card.title}
                                </h3>
                                <p className="text-xs text-neutral-500 leading-relaxed min-h-[40px]">{card.description}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="pt-8 flex justify-center pb-20"
            >
                <button
                    onClick={onReset}
                    className="text-sm font-mono text-neutral-500 hover:text-black transition-colors underline underline-offset-4"
                >
                    ← Start New Generation
                </button>
            </motion.div>
        </div>
    );
}
