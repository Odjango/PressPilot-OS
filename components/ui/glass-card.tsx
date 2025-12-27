'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={cn(
                'relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl',
                'hover:border-white/20 transition-colors duration-300',
                className
            )}
        >
            <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-transparent opacity-50" />
            {children}
        </motion.div>
    );
}
