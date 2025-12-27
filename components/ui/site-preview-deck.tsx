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
}

export function SitePreviewDeck({ previews, onReset }: SitePreviewDeckProps) {
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

    console.log('Rendering Deck with previews:', previews);

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-white"
                >
                    Blueprints Generated
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-zinc-400 text-sm"
                >
                    Select a variation to launch the Playground session.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {cards.map((card, index) => (
                    <motion.div
                        key={card.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                    >
                        <a
                            href={card.url || '#'}
                            target={card.url ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            className={cn(
                                "group relative flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 transition-all duration-300",
                                card.url ? "hover:bg-white/10 cursor-pointer" : "opacity-50 cursor-not-allowed",
                                card.borderColor
                            )}
                            onClick={(e) => !card.url && e.preventDefault()}
                        >
                            {/* Background Gradient */}
                            {card.url && (
                                <div className={cn("absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500", card.color)} />
                            )}

                            {/* Icon */}
                            <div className="relative z-10 p-3 rounded-lg bg-black/40 border border-white/10">
                                <card.icon className={cn("w-6 h-6", card.iconColor)} />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 flex-1">
                                <h3 className="text-white font-medium flex items-center gap-2">
                                    {card.title}
                                    {card.url && <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />}
                                </h3>
                                <p className="text-xs text-zinc-400">{card.description}</p>
                                {!card.url && <p className="text-[10px] text-red-400 mt-1">URL Missing</p>}
                            </div>

                            {/* Action Arrow */}
                            {card.url && (
                                <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                    <ArrowRight className="w-5 h-5 text-white/70" />
                                </div>
                            )}
                        </a>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="pt-4 flex justify-center"
            >
                <button
                    onClick={onReset}
                    className="text-xs text-zinc-500 hover:text-white transition-colors underline decoration-zinc-700 underline-offset-4"
                >
                    Start New Generation
                </button>
            </motion.div>
        </div>
    );
}
