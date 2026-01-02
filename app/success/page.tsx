'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlowButton } from '@/components/ui/glow-button';

export default function SuccessPage() {
    return (
        <main className="min-h-screen w-full bg-zinc-950 bg-mesh-gradient flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-lg relative z-10">
                <GlassCard className="text-center space-y-8 p-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20"
                    >
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </motion.div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-white">Blueprints Generated</h1>
                        <p className="text-zinc-400">
                            The factory has successfully processed your request. Your WordPress kit is ready for deployment.
                        </p>
                    </div>

                    <div className="pt-4">
                        <a href="/studio">
                            <GlowButton>
                                Create Another
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </GlowButton>
                        </a>
                    </div>
                </GlassCard>
            </div>
        </main>
    );
}
