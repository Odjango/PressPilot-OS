'use client';

import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { GlowButton } from '@/components/ui/glow-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CustomSelect } from '@/components/ui/custom-select';
import { Zap, Bot, Terminal, Paperclip } from 'lucide-react';
import { SitePreviewDeck } from '@/components/ui/site-preview-deck';

interface SitePreviews {
  original: string;
  high_contrast: string;
  inverted: string;
}

export default function StudioPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessTagline: '',
    businessDescription: '',
    contentLanguage: 'English',
    businessType: 'Restaurant / Food Service',
    logo_base64: '',
  });
  const [sitePreviews, setSitePreviews] = useState<SitePreviews | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Size Validation (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Please upload a logo smaller than 5MB.',
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.2)',
          color: '#f87171',
        },
      });
      return;
    }

    // 2. Type Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload a PNG or JPG file.',
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.2)',
          color: '#f87171',
        },
      });
      return;
    }

    // 3. Convert to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({ ...prev, logo_base64: base64String }));
      toast.success('Logo uploaded successfully', {
        description: 'Your brand is ready.',
        style: {
          background: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'rgba(16, 185, 129, 0.2)',
          color: '#34d399',
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Sending request to /api/proxy-n8n with payload:', {
        businessName: formData.businessName,
        tagline: formData.businessTagline,
        description: formData.businessDescription,
        contentLanguage: formData.contentLanguage,
        businessType: formData.businessType,
      });

      const response = await fetch('/api/proxy-n8n', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          tagline: formData.businessTagline,
          description: formData.businessDescription,
          contentLanguage: formData.contentLanguage,
          businessType: formData.businessType,
          logo: formData.logo_base64,
        }),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Received data from backend:', data);

        if (data.original && data.high_contrast && data.inverted) {
          setSitePreviews(data);
        } else {
          // Fallback or explicit error if data shape is wrong
          console.warn('Unexpected data shape:', data);
          setSitePreviews(data);
        }
      } else {
        const errorText = await response.text();
        console.error('Proxy responded with error:', response.status, errorText);
        throw new Error(`Signal failed: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Connection Failed.', {
        description: 'The factory could not be reached. Check console for details.',
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.2)',
          color: '#f87171',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-zinc-950 bg-mesh-gradient flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-center" theme="dark" />

      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-2xl relative z-10 my-8">
        <GlassCard className="space-y-8">
          {/* Header */}
          <div className="space-y-2 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20"
            >
              <Zap className="h-6 w-6 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Studio Command
            </h1>
            <p className="text-zinc-400 text-sm">
              Initiate site generation sequences. Enter precise data.
            </p>
          </div>

          {/* Form */}
          {sitePreviews ? (
            <SitePreviewDeck
              previews={sitePreviews}
              onReset={() => setSitePreviews(null)}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider pl-1">
                    Business Name <span className="text-indigo-400">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Luigi's Pizza"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>

                {/* Tagline */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider pl-1">
                    Tagline (Optional)
                  </label>
                  <Input
                    placeholder="Catchy phrase..."
                    value={formData.businessTagline}
                    onChange={(e) => setFormData({ ...formData, businessTagline: e.target.value })}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider pl-1">
                  Business Description <span className="text-indigo-400">*</span>
                </label>
                <Textarea
                  placeholder="Describe what your business does in 2-3 lines..."
                  required
                  rows={3}
                  value={formData.businessDescription}
                  onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Type */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider pl-1">
                    Sector
                  </label>
                  <CustomSelect
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  >
                    <option value="Restaurant / Food Service">Restaurant / Food Service</option>
                    <option value="Fitness / Gym / Wellness">Fitness / Gym / Wellness</option>
                    <option value="Corporate / Professional Services">Corporate / Professional Services</option>
                    <option value="E-commerce / Online Store">E-commerce / Online Store</option>
                    <option value="Portfolio / Creative">Portfolio / Creative</option>
                    <option value="Medical / Healthcare">Medical / Healthcare</option>
                    <option value="Tech / SaaS Startup">Tech / SaaS Startup</option>
                  </CustomSelect>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider pl-1">
                    Content Language
                  </label>
                  <CustomSelect
                    value={formData.contentLanguage}
                    onChange={(e) => setFormData({ ...formData, contentLanguage: e.target.value })}
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Italian">Italian</option>
                  </CustomSelect>
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider pl-1">
                  Business Logo <span className="text-zinc-600">(Optional)</span>
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleLogoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 group-hover:border-indigo-500/50 group-hover:bg-zinc-900/80 transition-all duration-300">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                      <Paperclip className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-200">
                        {formData.logo_base64 ? 'Logo Selected' : 'Upload Logo'}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formData.logo_base64 ? 'Click to replace' : 'PNG, JPG up to 5MB'}
                      </p>
                    </div>
                    {formData.logo_base64 && (
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center overflow-hidden">
                        <img src={formData.logo_base64} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <GlowButton isLoading={loading} loadingText="Initializing PressPilot Robot...">
                  <Bot className="h-5 w-5 mr-2" />
                  Generate Site
                </GlowButton>
              </div>
            </form>
          )}

          {/* Footer Status */}
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-600">
            <Terminal className="h-3 w-3" />
            <span>System Operational v2.1</span>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
