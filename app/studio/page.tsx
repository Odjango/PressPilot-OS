'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Sparkles, Loader2, ArrowRight, FolderPlus } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { supabase } from '@/lib/supabase';

const slugify = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);

export default function StudioLauncherPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Timeout after 2 seconds to prevent hanging
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Auth check timeout')), 2000)
                );

                const authPromise = supabase.auth.getSession();

                await Promise.race([authPromise, timeoutPromise]);
            } catch (error) {
                console.warn('[Studio] Auth check timed out or failed, allowing bypass');
            } finally {
                // Always unset loading state
                setCheckingAuth(false);
            }
        };
        checkAuth();
    }, [router]);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!projectName.trim()) {
            toast.error('Please enter a project name');
            return;
        }

        setLoading(true);
        const slug = slugify(projectName);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const accessToken = session?.access_token || 'bypass-token'; // Use bypass token if no session

            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    name: projectName.trim(),
                    slug: slug,
                    status: 'draft',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create project');
            }

            toast.success('Project created! Entering Studio...');

            // Redirect to the new multi-step wizard
            router.push(`/studio/${data.project.slug}`);

        } catch (error: any) {
            console.error('[Launch Error]', error);
            toast.error(error.message || 'Failed to start project');
            setLoading(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <Toaster position="top-center" theme="dark" />

            <main className="max-w-4xl mx-auto px-6 py-24">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-slate-950 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                        <Sparkles className="w-3 h-3" />
                        PressPilot OS
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
                        Start a New Project
                    </h1>
                    <p className="text-lg text-slate-400 max-w-xl mx-auto">
                        Your project tracks your theme configuration, content, and static exports in one place.
                    </p>
                </div>

                <div className="max-w-md mx-auto">
                    <form onSubmit={handleCreateProject} className="space-y-6">
                        <div className="relative">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                                Project / Business Name
                            </label>
                            <div className="relative group">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-white transition-colors" />
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="e.g. Skyline Digital"
                                    className="w-full pl-12 pr-4 py-4 text-lg text-white bg-slate-900 border-2 border-slate-800 rounded-2xl focus:border-white focus:outline-none transition-all hover:border-slate-700 placeholder:text-slate-600"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !projectName.trim()}
                            className="w-full group relative py-4 bg-white text-slate-950 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <span>Enter Studio</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-12 border-t border-slate-800 grid grid-cols-2 gap-8 text-center">
                        <div>
                            <div className="flex justify-center mb-3 text-white">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-white mb-1">New Wizard</h3>
                            <p className="text-xs text-slate-500">4-step guided workflow</p>
                        </div>
                        <div>
                            <div className="flex justify-center mb-3 text-white">
                                <FolderPlus className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-white mb-1">Cloud Sync</h3>
                            <p className="text-xs text-slate-500">Saved to your account</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
