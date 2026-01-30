'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export interface HeroPreview {
    style: string;
    name: string;
    description: string;
    imageUrl?: string;
    renderItem?: () => React.ReactNode;
}

interface HeroCarouselProps {
    previews: HeroPreview[];
    onSelect: (style: string) => void;
}

export function HeroCarousel({ previews, onSelect }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

    const currentPreview = previews[currentIndex];

    // Safety check if previews is empty
    if (!currentPreview) return null;

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? previews.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === previews.length - 1 ? 0 : prev + 1));
    };

    const handleSelect = () => {
        setSelectedStyle(currentPreview.style);
        onSelect(currentPreview.style);
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
            {/* Preview Counter */}
            <div className="text-center mb-6">
                <p className="text-sm font-medium text-gray-500">
                    Hero Style {currentIndex + 1} of {previews.length}
                </p>
            </div>

            {/* Main Preview Area */}
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-100">
                {/* Preview Content */}
                <div className="relative aspect-[7/3] bg-gray-50">
                    {currentPreview.renderItem ? (
                        <div className="absolute inset-0 w-full h-full">
                            {currentPreview.renderItem()}
                        </div>
                    ) : currentPreview.imageUrl ? (
                        <Image
                            src={currentPreview.imageUrl}
                            alt={currentPreview.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                            No Preview Available
                        </div>
                    )}
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-20 border border-neutral-100"
                    aria-label="Previous hero style"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>

                <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-20 border border-neutral-100"
                    aria-label="Next hero style"
                >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                </button>
            </div>

            {/* Hero Info */}
            <div className="mt-8 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    {currentPreview.name}
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    {currentPreview.description}
                </p>

                {/* Select Button */}
                <button
                    onClick={handleSelect}
                    disabled={selectedStyle === currentPreview.style}
                    className={`
                        px-8 py-4 rounded-lg font-semibold text-lg transition-all
                        ${selectedStyle === currentPreview.style
                            ? 'bg-green-600 text-white cursor-not-allowed'
                            : 'bg-black text-white hover:bg-gray-800 hover:scale-105'
                        }
                    `}
                >
                    {selectedStyle === currentPreview.style ? (
                        <span className="flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            Selected
                        </span>
                    ) : (
                        'Select This Style'
                    )}
                </button>
            </div>

            {/* Thumbnail Navigation */}
            <div className="mt-8 flex justify-center gap-4">
                {previews.map((preview, index) => (
                    <button
                        key={preview.style}
                        onClick={() => setCurrentIndex(index)}
                        className={`
                            relative w-24 h-16 rounded-lg overflow-hidden border-2 transition-all bg-neutral-50
                            ${currentIndex === index
                                ? 'border-black scale-110 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }
                        `}
                    >
                        {preview.renderItem ? (
                            <div className="w-full h-full opacity-50 scale-50 origin-top-left w-[200%] h-[200%] pointer-events-none">
                                {preview.renderItem()}
                            </div>
                        ) : preview.imageUrl ? (
                            <Image
                                src={preview.imageUrl}
                                alt={preview.name}
                                fill
                                className="object-cover"
                            />
                        ) : null}

                        {selectedStyle === preview.style && (
                            <div className="absolute inset-0 bg-green-600/20 flex items-center justify-center z-10">
                                <Check className="w-6 h-6 text-green-600 drop-shadow-sm" />
                            </div>
                        )}
                    </button>
                ))}
            </div>

        </div>
    );
}
