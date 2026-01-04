'use client';

import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { BlueprintGrid } from '@/components/ui/blueprint-grid';
import { HeroSection } from '@/components/ui/hero-section';
import { BentoFeatures } from '@/components/ui/bento-features';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CustomSelect } from '@/components/ui/custom-select';
import { GlowButton } from '@/components/ui/glow-button';
import { Bot, Terminal, Paperclip, X } from 'lucide-react';
import { SitePreviewDeck } from '@/components/ui/site-preview-deck';
import { motion, AnimatePresence } from 'framer-motion';

interface SitePreviews {
  original: string;
  high_contrast: string;
  inverted: string;
}

export default function StudioPage() {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false); // Toggle for form overlay
  const [formData, setFormData] = useState({
    businessName: '',
    businessTagline: '',
    businessDescription: '',
    contentLanguage: 'English',
    businessType: 'Restaurant / Food Service',
    logo_base64: '',
  });
  const [sitePreviews, setSitePreviews] = useState<SitePreviews | null>(null);

  // ... (Logo Handling Logic - Same as before)
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File too large'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, logo_base64: reader.result as string }));
      toast.success('Logo uploaded');
    };
    reader.readAsDataURL(file);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/proxy-n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName,
          tagline: formData.businessTagline,
          description: formData.businessDescription,
          contentLanguage: formData.contentLanguage,
          businessType: formData.businessType,
          logo: formData.logo_base64,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSitePreviews(data);
        setShowForm(false); // Close form on success to show previews
      } else {
        throw new Error('Signal failed');
      }
    } catch (error) {
      toast.error('Connection Failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-cream selection:bg-black selection:text-cream">
      <Toaster position="top-right" theme="light" />

      <BlueprintGrid>
        {/* Render Previews if available */}
        {sitePreviews ? (
          <div className="pt-32 pb-20">
            <button onClick={() => setSitePreviews(null)} className="mb-8 text-sm font-mono underline hover:text-black/60">← Back to Generator</button>
            <SitePreviewDeck previews={sitePreviews} onReset={() => setSitePreviews(null)} />
          </div>
        ) : (
          <>
            <HeroSection />
            <BentoFeatures />

            {/* Floating Action Button for Form */}
            {!showForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-8 right-8 z-40"
              >
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-black text-cream px-6 py-4 font-mono uppercase tracking-wider shadow-xl hover:bg-neutral-800 transition-colors"
                >
                  Initialize Builder
                </button>
              </motion.div>
            )}
          </>
        )}
      </BlueprintGrid>

      {/* Form Overlay (Slide Up) */}
      <AnimatePresence>
        {showForm && !sitePreviews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-sm p-4 md:p-8"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-2xl bg-white border border-black/10 shadow-2xl p-8 pb-12 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight">System Input</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-neutral-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Reusing the Form Logic but with Blueprint Styling */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-mono text-xs uppercase tracking-wider text-neutral-500">Business Name</label>
                    <Input required value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} className="rounded-none border-black/20 focus:border-black text-black bg-white placeholder:text-neutral-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-xs uppercase tracking-wider text-neutral-500">Tagline</label>
                    <Input value={formData.businessTagline} onChange={e => setFormData({ ...formData, businessTagline: e.target.value })} className="rounded-none border-black/20 focus:border-black text-black bg-white placeholder:text-neutral-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase tracking-wider text-neutral-500">Description</label>
                  <Textarea required value={formData.businessDescription} onChange={e => setFormData({ ...formData, businessDescription: e.target.value })} className="rounded-none border-black/20 focus:border-black min-h-[100px] text-black bg-white placeholder:text-neutral-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-mono text-xs uppercase tracking-wider text-neutral-500">Sector</label>
                    <CustomSelect value={formData.businessType} onChange={e => setFormData({ ...formData, businessType: e.target.value })}>
                      <option value="Restaurant / Food Service">Restaurant / Food Service</option>
                      <option value="Real Estate / Architecture">Real Estate / Architecture</option>
                      <option value="Tech / SaaS">Tech / SaaS</option>
                      <option value="Health / Wellness">Health / Wellness</option>
                      <option value="Creative Agency">Creative Agency</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Personal Portfolio">Personal Portfolio</option>
                    </CustomSelect>
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-xs uppercase tracking-wider text-neutral-500">Language</label>
                    <CustomSelect value={formData.contentLanguage} onChange={e => setFormData({ ...formData, contentLanguage: e.target.value })}>
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Japanese">Japanese</option>
                    </CustomSelect>
                  </div>
                </div>

                {/* Simplified Logo Input for Blueprint Aesthetic */}
                <div className="border border-dashed border-black/20 p-6 text-center hover:bg-cream transition-colors cursor-pointer relative group">
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="flex flex-col items-center justify-center gap-2">
                    {formData.logo_base64 && (
                      <div className="w-12 h-12 object-contain bg-white border border-black/10 p-1 mb-2 rounded-sm shadow-sm overflow-hidden flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formData.logo_base64} alt="Logo Preview" className="max-w-full max-h-full" />
                      </div>
                    )}
                    <Paperclip className={`w-5 h-5 ${formData.logo_base64 ? 'text-green-600' : 'text-neutral-400'}`} />
                    <p className="font-mono text-xs text-neutral-500 group-hover:text-black transition-colors">
                      {formData.logo_base64 ? "Logo Attached (Click to Change)" : "Upload Logo (Vector/PNG)"}
                    </p>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-black text-cream py-4 font-mono uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50">
                  {loading ? "Constructing..." : "Generate Structure"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
