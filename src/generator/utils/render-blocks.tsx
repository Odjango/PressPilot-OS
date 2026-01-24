import * as React from 'react';

/**
 * Safe Block Renderer Utility
 * satisfy: conversionMap valid object with React values
 */

export interface HelperProps {
    blockName: string;
    attributes?: Record<string, any>;
    innerHtml?: string;
}

export function renderBlock(props: HelperProps): React.JSX.Element {
    const { blockName, attributes, innerHtml } = props;

    try {
        // Just a basic pass-through or safe render
        // This is a placeholder for future logic if the user wants dedicated React rendering
        return (
            <div data-block={blockName} className={attributes?.className}>
                {innerHtml ? <div dangerouslySetInnerHTML={{ __html: innerHtml }} /> : null}
            </div>
        );
    } catch (e) {
        console.error(`[renderBlock] Failed to render ${blockName}`, e);
        return <div className="block-render-error">Error rendering {blockName}</div>;
    }
}
