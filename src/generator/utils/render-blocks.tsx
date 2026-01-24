import React from 'react';

export const renderBlocks = (blocks: any[]): React.ReactNode => {
    if (!Array.isArray(blocks)) return null;
    return (
        <>
            {blocks.map((block, index) => {
                try {
                    if (typeof block === 'string') return <div key={index} dangerouslySetInnerHTML={{ __html: block }} />;
                    if (block.originalContent) return <div key={index} dangerouslySetInnerHTML={{ __html: block.originalContent }} />;
                    return (
                        <div key={index} className="wp-block-fallback" data-block-name={block.name}>
                            {block.innerHTML ? <div dangerouslySetInnerHTML={{ __html: block.innerHTML }} /> : null}
                        </div>
                    );
                } catch (e) {
                    console.error(`Error rendering block at index ${index}:`, e);
                    return null;
                }
            })}
        </>
    );
};
