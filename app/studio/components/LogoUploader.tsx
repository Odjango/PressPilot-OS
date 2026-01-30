'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle2, Palette } from 'lucide-react';
import { toast } from 'sonner';

interface LogoUploaderProps {
    value?: string; // Base64 string
    onChange: (value: string, colors?: string[]) => void;
}

export default function LogoUploader({ value, onChange }: LogoUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [extractedColors, setExtractedColors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const colorPickerRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const extractColors = (base64: string): Promise<string[]> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return resolve([]);

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                const colorMap: Record<string, number> = {};

                // Helper to check color similarity
                const getDistance = (c1: string, c2: string) => {
                    const r1 = parseInt(c1.slice(1, 3), 16);
                    const g1 = parseInt(c1.slice(3, 5), 16);
                    const b1 = parseInt(c1.slice(5, 7), 16);
                    const r2 = parseInt(c2.slice(1, 3), 16);
                    const g2 = parseInt(c2.slice(3, 5), 16);
                    const b2 = parseInt(c2.slice(5, 7), 16);
                    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
                };

                // Sample pixels
                for (let i = 0; i < imageData.length; i += 40) {
                    const r = imageData[i];
                    const g = imageData[i + 1];
                    const b = imageData[i + 2];
                    const a = imageData[i + 3];

                    if (a < 128) continue;
                    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                    if (brightness < 20 || brightness > 240) continue;

                    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
                    colorMap[hex] = (colorMap[hex] || 0) + 1;
                }

                const sorted = Object.entries(colorMap).sort(([, a], [, b]) => b - a);
                const distinct: string[] = [];

                for (const [color] of sorted) {
                    if (distinct.length >= 3) break;
                    const isNew = distinct.every(d => getDistance(d, color) > 45); // Threshold for distinctness
                    if (isNew) distinct.push(color);
                }

                resolve(distinct);
            };
            img.src = base64;
        });
    };

    const updateSingleColor = (index: number, newHex: string) => {
        const next = [...extractedColors];
        next[index] = newHex;
        setExtractedColors(next);
        onChange(value || '', next);
    };

    const processFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Logo file must be smaller than 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target?.result as string;
            const colors = await extractColors(base64);
            setExtractedColors(colors);
            onChange(base64, colors);
            toast.success('Logo uploaded and colors analyzed');
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    return (
        <div className="space-y-4">
            <label className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-black text-[10px] text-white">3</span>
                Brand Logo & DNA
            </label>

            {!value ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 transition-all duration-300
                        flex flex-col items-center justify-center gap-3 text-center
                        ${isDragging ? 'border-black bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50/50'}
                    `}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />

                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-neutral-400 group-hover:text-black transition-colors" />
                    </div>

                    <div>
                        <p className="text-sm font-bold text-neutral-900">Click to upload or drag logo</p>
                        <p className="text-xs text-neutral-400 mt-1">SVG, PNG, JPG (max 2MB)</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="relative group rounded-2xl border border-neutral-200 p-4 bg-white shadow-sm flex items-center gap-4">
                        <div className="w-16 h-16 bg-neutral-50 rounded-lg flex items-center justify-center overflow-hidden border border-neutral-100 p-2">
                            <img src={value} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Logo Attached</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                {extractedColors.map((color, i) => (
                                    <div key={i} className="relative group/swatch">
                                        <button
                                            className="h-6 w-6 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-125 cursor-pointer"
                                            style={{ backgroundColor: color }}
                                            title="Click to edit color"
                                            onClick={() => colorPickerRefs.current[i]?.click()}
                                        />
                                        <input
                                            ref={(el) => { colorPickerRefs.current[i] = el; }}
                                            type="color"
                                            value={color}
                                            onChange={(e) => updateSingleColor(i, e.target.value)}
                                            className="opacity-0 pointer-events-none absolute"
                                        />
                                    </div>
                                ))}
                                {extractedColors.length > 0 && (
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase ml-1">
                                        Edit Brand DNA
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setExtractedColors([]);
                                onChange('', []);
                            }}
                            className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Remove logo"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="text-[10px] text-neutral-400 italic px-2">
                        Colors from your logo will be used to intelligently generate your site's color palettes in the next step.
                    </p>
                </div>
            )}
        </div>
    );
}
