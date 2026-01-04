import React from 'react';

interface BlueprintGridProps {
    children: React.ReactNode;
    className?: string;
}

export const BlueprintGrid: React.FC<BlueprintGridProps> = ({ children, className = '' }) => {
    return (
        <div className={`relative w-full min-h-screen bg-cream ${className}`}>
            {/* Vertical Grid Lines */}
            <div className="absolute inset-0 flex justify-between pointer-events-none z-0 px-6 max-w-7xl mx-auto">
                <div className="w-px h-full bg-black/5" />
                <div className="w-px h-full bg-black/5" />
                <div className="w-px h-full bg-black/5" />
                <div className="w-px h-full bg-black/5" />
                <div className="w-px h-full bg-black/5 hidden md:block" />
            </div>

            {/* Horizontal Grid Lines (Optional Pattern) */}
            <div className="absolute inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: 'linear-gradient(to bottom, transparent 99%, rgba(0,0,0,0.03) 100%)',
                    backgroundSize: '100% 100px'
                }}
            />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
                {children}
            </div>
        </div>
    );
};
