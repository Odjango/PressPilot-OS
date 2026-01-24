'use client';

// Force Re-Deploy: Restore Dec 25 UI State
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
import DownloadPanel from '@/components/DownloadPanel';
import { motion, AnimatePresence } from 'framer-motion';

interface SitePreviews {
  original: string;
  high_contrast: string;
  inverted: string;
}

export default function StudioPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false); // Toggle for form overlay
  const [formData, setFormData] = useState({
    businessName: '',
    businessTagline: '',
    businessDescription: '',
    contentLanguage: 'English',
    businessType: 'Restaurant / Food Service',
    logo_base64: '',
    palette: { primary: '', secondary: '', accent: '' } // New Palette State
  });
  const [sitePreviews, setSitePreviews] = useState<SitePreviews | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [zombieData, setZombieData] = useState<any>(null); // Debug state for empty success

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
    setError(null);
    setZombieData(null);

    try {
      // ARCHITECTURAL UPGRADE: Use Internal Generator (Sync)
      // Deprecated: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
      const apiUrl = '/api/generate';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            businessName: formData.businessName,
            heroTitle: formData.businessTagline, // Map Tagline -> HeroTitle
            businessDescription: formData.businessDescription,
            primaryLanguage: formData.contentLanguage, // Map Language
            businessCategory: formData.businessType, // Map Sector
            logoBase64: formData.logo_base64,
            palette: formData.palette, // PASS FRONTEND PALETTE
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("INTERNAL API DATA:", data);

        // 1. DETECT FAILURE (API returned 200 but missing URL)
        // Internal API returns 'themeUrl' and 'themeZipPath'
        if (!data.themeUrl) {
          console.error("GENERATION TRAPPED:", data);
          setZombieData(data); // Trigger Debug UI
          setSitePreviews(null);
          setShowForm(false);
          return;
        }

        // 2. SUCCESS: Map internal 'themeUrl' to 'original' slot
        setSitePreviews({
          original: data.themeUrl || "",
          high_contrast: "", // Internal API currently generates single variation
          inverted: ""
        });

        setShowForm(false); // Close form on success to show previews
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.details || err.error || 'Internal Generator Failed');
      }
    } catch (error: any) {
      console.error("GENERATION FAILED:", error);
      setError(error?.message || "Unknown API Error");
      setSitePreviews(null); // Force it to be empty so we don't show old data
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-cream selection:bg-black selection:text-cream">
      {/* FORCE FRONTEND DEBUG */}
      <div className="w-full bg-black text-white p-2 text-xs font-mono overflow-auto z-[60] relative">
        DEBUG DATA: {JSON.stringify(sitePreviews || "No Data", null, 2)}
      </div>
      <Toaster position="top-right" theme="light" />

      <BlueprintGrid>
        {/* Render Previews if available */}
        <>
          <HeroSection />

          {error && (
            <div className="max-w-4xl mx-auto my-8 p-6 bg-red-50 border-2 border-red-500 text-red-700 rounded-lg">
              <h3 className="font-bold text-lg">GENERATION FAILED</h3>
              <p className="font-mono text-sm mt-2">{error}</p>
            </div>
          )}

          {/* ZOMBIE SUCCESS DEBUGGER */}
          {zombieData && (
            <div className="max-w-4xl mx-auto my-8 p-8 border-2 border-yellow-500 bg-yellow-50 rounded-xl text-left">
              <h2 className="text-xl font-bold text-yellow-800 mb-4">⚠️ Generation "Succeeded" but returned Empty Data</h2>
              <p className="mb-2 text-sm text-yellow-700">The n8n workflow returned success, but the file URLs are missing.</p>
              <pre className="bg-black text-white p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(zombieData, null, 2)}
              </pre>
            </div>
          )}

          <div id="bento-grid">
            <BentoFeatures previewUrl={selectedPreview} />
          </div>

          {/* Show Preview Deck *below* Bento Grid if results exist */}
          {sitePreviews && (
            <div className="border-t border-black/10 bg-neutral-50 px-4 py-8">
              <SitePreviewDeck
                previews={sitePreviews}
                onReset={() => { setSitePreviews(null); setSelectedPreview(null); }}
                onSelect={(url) => { setSelectedPreview(url); document.getElementById('bento-grid')?.scrollIntoView({ behavior: 'smooth' }); }}
              />
            </div>
          )}

          {/* Floating Action Button for Form */}
          {!showForm && !sitePreviews && (
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
      </BlueprintGrid>

      {/* Persistent Download Panel and Error Display */}
      <div className="fixed bottom-8 left-8 z-50 flex flex-col gap-4 max-w-sm">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        <DownloadPanel
          themeUrl={sitePreviews?.original ? `${sitePreviews.original}/wp-content/themes/presspilot-child.zip` : null} // Rough approximation for safe download enable
          staticUrl={null}
          isGenerating={loading}
          slug={formData.businessName.toLowerCase().replace(/\s+/g, '-')}
        />
      </div>

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
                    <Input required value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} className="placeholder:text-neutral-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-xs uppercase tracking-wider text-neutral-500">Tagline</label>
                    <Input value={formData.businessTagline} onChange={e => setFormData({ ...formData, businessTagline: e.target.value })} className="placeholder:text-neutral-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase tracking-wider text-neutral-500">Description</label>
                  <Textarea required value={formData.businessDescription} onChange={e => setFormData({ ...formData, businessDescription: e.target.value })} className="min-h-[100px] placeholder:text-neutral-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-mono text-xs uppercase tracking-wider text-neutral-500">Sector</label>
                    <CustomSelect className="text-black bg-white border-black/20 focus:border-black" value={formData.businessType} onChange={e => setFormData({ ...formData, businessType: e.target.value })}>
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
                    <CustomSelect className="text-black bg-white border-black/20 focus:border-black" value={formData.contentLanguage} onChange={e => setFormData({ ...formData, contentLanguage: e.target.value })}>
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
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    // Logo Logic
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64 = reader.result as string;
                      setFormData(prev => ({ ...prev, logo_base64: base64 }));

                      // CLIENT-SIDE COLOR EXTRACTION (Naive)
                      // We create a hidden image to sample colors
                      const img = new Image();
                      img.src = base64;
                      img.onload = () => {
                        // Simple logic: just grab center pixel as primary, offset as secondary?
                        // Or just default to Black/Grey to let user choose.
                        // Since we don't have ColorThief browser lib easy, we'll let user edit.
                        // Actually, let's try a simple canvas sample.
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          canvas.width = 1; canvas.height = 1;
                          ctx.drawImage(img, 0, 0, 1, 1);
                          const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
                          const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

                          // Update Palette State (We need to add this state!)
                          // See note below: I will update formData state structure first.
                          setFormData(prev => ({
                            ...prev,
                            palette: {
                              primary: hex,
                              secondary: '#333333',
                              accent: '#3b82f6'
                            }
                          }));
                          toast.success("Logo Colors Extracted (Adjust below)");
                        }
                      };
                    };
                    reader.readAsDataURL(file);
                  }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />

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

                {/* COLOR PALETTE EDITOR (NEW) */}
                <div className="space-y-4 border-t border-black/10 pt-4">
                  <label className="font-mono text-xs uppercase tracking-wider text-neutral-500 block">Brand Palette</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-neutral-400 uppercase">Primary</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.palette?.primary || '#000000'}
                          onChange={(e) => setFormData({ ...formData, palette: { ...formData.palette, primary: e.target.value } })}
                          className="w-10 h-10 border border-black/20 rounded cursor-pointer p-1 bg-white"
                        />
                        <span className="text-xs font-mono">{formData.palette?.primary || '#000'}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-neutral-400 uppercase">Secondary</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.palette?.secondary || '#333333'}
                          onChange={(e) => setFormData({ ...formData, palette: { ...formData.palette, secondary: e.target.value } })}
                          className="w-10 h-10 border border-black/20 rounded cursor-pointer p-1 bg-white"
                        />
                        <span className="text-xs font-mono">{formData.palette?.secondary || '#333'}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-neutral-400 uppercase">Accent</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.palette?.accent || '#3b82f6'}
                          onChange={(e) => setFormData({ ...formData, palette: { ...formData.palette, accent: e.target.value } })}
                          className="w-10 h-10 border border-black/20 rounded cursor-pointer p-1 bg-white"
                        />
                        <span className="text-xs font-mono">{formData.palette?.accent || '#3b8'}</span>
                      </div>
                    </div>
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
