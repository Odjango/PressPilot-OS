// lib/beesoPizzaBlocks.ts
import type { BlockNode } from "./wpBlockRenderer";

/**
 * Shared helpers to keep markup DRY.
 */

const brandHeading: BlockNode = {
    name: "heading",
    attributes: {
        level: 1,
        fontSize: "xx-large",
        textAlign: "center",
    },
    innerBlocks: [
        {
            name: "text",
            // NOTE: core/text isn't a real block; WP uses core/paragraph + markup.
            // To stay safe we use core/paragraph for text content.
            // We'll override content via inner HTML in your static renderer.
            // For block templates, WP expects the inner HTML between comments.
            // Here we keep the structure; static renderer will handle actual text.
            innerBlocks: [],
        },
    ],
};

/**
 * Beeso Pizza hero section – structure only.
 * Actual text content comes from your data layer / static generator,
 * but the *layout* and block types must be valid.
 */
export function createHeroSection(
    title: string,
    subtitle: string,
    primaryLabel: string,
    secondaryLabel: string
): BlockNode {
    return {
        name: "group",
        attributes: {
            tagName: "section",
            layout: {
                type: "constrained",
                contentSize: "960px",
            },
            style: {
                spacing: {
                    padding: {
                        top: "80px",
                        bottom: "80px",
                    },
                },
            },
        },
        innerBlocks: [
            {
                name: "paragraph",
                attributes: {
                    textAlign: "center",
                    fontSize: "small",
                },
                innerBlocks: [],
            },
            {
                name: "heading",
                attributes: {
                    level: 1,
                    textAlign: "center",
                    fontSize: "xx-large",
                },
                innerBlocks: [],
            },
            {
                name: "paragraph",
                attributes: {
                    textAlign: "center",
                    fontSize: "medium",
                },
                innerBlocks: [],
            },
            {
                name: "buttons",
                attributes: {
                    layout: {
                        type: "flex",
                        justifyContent: "center",
                    },
                },
                innerBlocks: [
                    {
                        name: "button",
                        attributes: {
                            text: primaryLabel,
                            backgroundColor: "brand",
                            textColor: "base-0",
                        },
                        innerBlocks: [],
                    },
                    {
                        name: "button",
                        attributes: {
                            text: secondaryLabel,
                            variant: "outline",
                            textColor: "brand",
                        },
                        innerBlocks: [],
                    },
                ],
            },
        ],
    };
}

/**
 * 4-card feature grid under "Why Beeso Pizza?"
 */
export function createFeaturesSection(
    features: { title: string; body: string }[]
): BlockNode {
    return {
        name: "group",
        attributes: {
            tagName: "section",
            layout: { type: "constrained", contentSize: "1120px" },
            style: {
                spacing: {
                    padding: {
                        top: "40px",
                        bottom: "40px",
                    },
                },
            },
        },
        innerBlocks: [
            {
                name: "heading",
                attributes: {
                    level: 2,
                    textAlign: "center",
                    fontSize: "x-large",
                },
                innerBlocks: [],
            },
            {
                name: "columns",
                attributes: {
                    isStackedOnMobile: true,
                },
                innerBlocks: features.slice(0, 4).map((feature) => ({
                    name: "column",
                    attributes: {},
                    innerBlocks: [
                        {
                            name: "group",
                            attributes: {
                                style: {
                                    border: { radius: "20px" },
                                    spacing: {
                                        padding: {
                                            top: "24px",
                                            right: "24px",
                                            bottom: "24px",
                                            left: "24px",
                                        },
                                    },
                                },
                            },
                            innerBlocks: [
                                {
                                    name: "heading",
                                    attributes: {
                                        level: 3,
                                        fontSize: "medium",
                                    },
                                    innerBlocks: [],
                                },
                                {
                                    name: "paragraph",
                                    attributes: {
                                        fontSize: "small",
                                    },
                                    innerBlocks: [],
                                },
                            ],
                        },
                    ],
                })),
            },
        ],
    };
}

/**
 * Flat header navigation (no dropdowns).
 * Uses custom links so it doesn’t depend on menu IDs.
 */
export const headerNavigation: BlockNode = {
    name: "group",
    attributes: {
        tagName: "header",
        layout: {
            type: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },
        style: {
            spacing: {
                padding: {
                    top: "16px",
                    bottom: "16px",
                    left: "32px",
                    right: "32px",
                },
            },
        },
    },
    innerBlocks: [
        {
            name: "site-title",
            attributes: {},
            innerBlocks: [],
        },
        {
            name: "navigation",
            attributes: {
                overlayMenu: "never",
                layout: {
                    type: "flex",
                    justifyContent: "right",
                },
            },
            innerBlocks: [
                navLink("Home", "/"),
                navLink("Menu", "/menu"),
                navLink("About", "/about"),
                navLink("Services", "/services"),
                navLink("Blog", "/blog"),
                navLink("Contact", "/contact"),
            ],
        },
    ],
};

function navLink(label: string, url: string): BlockNode {
    return {
        name: "navigation-link",
        attributes: {
            label,
            url,
            kind: "custom",
            // let WP derive type automatically, but we can be explicit:
            type: "custom",
        },
        innerBlocks: [],
    };
}
