'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, FileText, Briefcase, Upload, Palette, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const INDUSTRIES = [
    { value: 'saas', label: 'SaaS / Software' },
    { value: 'restaurant', label: 'Restaurant / Food Service' },
    { value: 'ecommerce', label: 'E-commerce / Online Store' },
    { value: 'portfolio', label: 'Portfolio / Creative' },
    { value: 'agency', label: 'Agency / Consulting' },
    { value: 'fitness', label: 'Fitness / Wellness' }
];

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        businessName: '',
        description: '',
        industry: 'saas',
        logoFile: null as File | null,
        logoPreview: '',
        primaryColor: '#1a1a1a',
        secondaryColor: '#666666'
    });

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Logo file must be under 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({
                ...prev,
                logoFile: file,
                logoPreview: reader.result as string
            }));
            toast.success('Logo uploaded successfully');
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.businessName || !formData.description) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/generate-hero-previews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessName: formData.businessName,
                    description: formData.description,
                    industry: formData.industry,
                    logoUrl: formData.logoPreview,
                    primaryColor: formData.primaryColor,
                    secondaryColor: formData.secondaryColor
                })
            });

            const data = await response.json();

            if (response.ok && data.previewId) {
                // Store preview data in session storage
                sessionStorage.setItem(`preview-${data.previewId}`, JSON.stringify(data));

                // Redirect to preview page
                router.push(`/preview?id=${data.previewId}`);
            } else {
                throw new Error(data.error || 'Failed to generate previews');
            }

        } catch (error: any) {
            console.error('[Generation Error]', error);
            toast.error(error.message || 'Failed to generate previews');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Toaster position="top-center" />

            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">PRESSPILOT<span className="text-gray-400">OS</span></h1>
                            <p className="text-sm text-gray-600 mt-1">Professional WordPress. Zero Hassle.</p>
                        </div>
                        <nav className="flex gap-6 text-sm">
                            <a href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
                            <a href="/docs" className="text-gray-600 hover:text-gray-900">Docs</a>
                            <a href="/auth/signin" className="text-gray-600 hover:text-gray-900">Sign in</a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h2 className="text-5xl font-bold text-gray-900 mb-4">
                        Define Your Site Structure
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Provide a few details about your business. PressPilot uses this information to generate a clean, structured, production-ready WordPress theme.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Business Name */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                <Building2 className="w-5 h-5 text-gray-400" />
                                Business Name *
                            </label>
                            <input
                                type="text"
                                value={formData.businessName}
                                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                                placeholder="e.g., Acme Coffee Roasters"
                                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                <FileText className="w-5 h-5 text-gray-400" />
                                Business Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe your business in a few sentences..."
                                rows={4}
                                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors resize-none"
                                required
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                Used to define site structure, page hierarchy, and core messaging across the theme.
                            </p>
                        </div>

                        {/* Industry */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                <Briefcase className="w-5 h-5 text-gray-400" />
                                Industry *
                            </label>
                            <select
                                value={formData.industry}
                                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors bg-white"
                            >
                                {INDUSTRIES.map(industry => (
                                    <option key={industry.value} value={industry.value}>
                                        {industry.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-sm text-gray-500 mt-2">
                                Industry selection influences layout structure, default sections, and content patterns.
                            </p>
                        </div>

                        {/* Logo Upload */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                <Upload className="w-5 h-5 text-gray-400" />
                                Logo (Optional)
                            </label>
                            <div className="flex items-center gap-4">
                                {formData.logoPreview && (
                                    <div className="w-20 h-20 border-2 border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={formData.logoPreview}
                                            alt="Logo preview"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                )}
                                <label className="flex-1 cursor-pointer">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">
                                            {formData.logoPreview ? 'Change logo' : 'Click to upload logo'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG (max 5MB)</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                If provided, the logo is automatically integrated into the header and theme styles.
                            </p>
                        </div>

                        {/* Color Preferences */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                <Palette className="w-5 h-5 text-gray-400" />
                                Brand Colors (Optional)
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">Primary Color</label>
                                    <p className="text-xs text-gray-500 mb-2">Used for primary actions, links, and emphasis.</p>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={formData.primaryColor}
                                            onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                                            className="w-16 h-16 rounded-lg border-2 border-gray-200 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.primaryColor}
                                            onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">Secondary Color</label>
                                    <p className="text-xs text-gray-500 mb-2">Used for accents, UI elements, and supporting styles.</p>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={formData.secondaryColor}
                                            onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                                            className="w-16 h-16 rounded-lg border-2 border-gray-200 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.secondaryColor}
                                            onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-black text-white rounded-lg font-semibold text-lg hover:bg-gray-800 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating Previews...
                                    </>
                                ) : (
                                    'Preview Theme Structure'
                                )}
                            </button>
                            <p className="text-sm text-gray-500 text-center mt-3">
                                Preview how your homepage structure and hero styles are generated. (~5 seconds)
                            </p>
                        </div>
                    </form>
                </div>

                {/* Info Section */}
                <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
                    <div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">~5 sec</div>
                        <p className="text-sm text-gray-600">Preview generation</p>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">3 styles</div>
                        <p className="text-sm text-gray-600">Professional hero structure variations</p>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">$29.99</div>
                        <p className="text-sm text-gray-600">One-time purchase · Own it forever</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
