'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlowButtonProps extends HTMLMotionProps<"button"> {
    isLoading?: boolean;
    loadingText?: string;
}

export function GlowButton({
    children,
    className,
    isLoading,
    loadingText = 'Loading...',
    disabled,
    ...props
}: GlowButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || disabled}
            className={cn(
                'relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300',
                'hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:from-indigo-500 hover:to-violet-500',
                'disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-none',
                className
            )}
            {...props}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                {isLoading ? (loadingText as React.ReactNode) : (children as React.ReactNode)}
            </span>
            {/* Glow overlay */}
            <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300 mix-blend-overlay" />
        </motion.button>
    );
}
