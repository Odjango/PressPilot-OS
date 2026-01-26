/**
 * Hero Template Generator
 * Creates lightweight HTML for hero section previews
 */

export interface HeroData {
    businessName: string;
    tagline: string;
    description: string;
    ctaText: string;
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
}

/**
 * Split Hero Template
 * Image on left (50%), content on right (50%)
 */
export function generateSplitHero(data: HeroData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.businessName} - Split Hero</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #ffffff;
        }
        .hero-container {
            display: flex;
            min-height: 600px;
            max-width: 1400px;
            margin: 0 auto;
        }
        .hero-image {
            flex: 1;
            background: linear-gradient(135deg, ${data.primaryColor}20, ${data.secondaryColor}20);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 3rem;
        }
        .hero-image img {
            max-width: 100%;
            height: auto;
            max-height: 400px;
        }
        .hero-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 4rem;
            background: #ffffff;
        }
        .hero-tagline {
            font-size: 0.875rem;
            font-weight: 600;
            color: ${data.primaryColor};
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 1rem;
        }
        .hero-title {
            font-size: 3.5rem;
            font-weight: 700;
            line-height: 1.1;
            color: #1a1a1a;
            margin-bottom: 1.5rem;
        }
        .hero-description {
            font-size: 1.25rem;
            line-height: 1.6;
            color: #666;
            margin-bottom: 2rem;
        }
        .hero-cta {
            display: inline-block;
            padding: 1rem 2.5rem;
            background: ${data.primaryColor};
            color: #ffffff;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.125rem;
            border-radius: 8px;
            transition: transform 0.2s;
            align-self: flex-start;
        }
        .hero-cta:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="hero-container">
        <div class="hero-image">
            ${data.logoUrl ? `<img src="${data.logoUrl}" alt="${data.businessName} Logo">` : `
                <svg width="200" height="200" viewBox="0 0 200 200">
                    <rect width="200" height="200" fill="${data.primaryColor}20"/>
                    <text x="100" y="100" text-anchor="middle" dominant-baseline="middle" 
                          font-size="48" font-weight="bold" fill="${data.primaryColor}">
                        ${data.businessName.charAt(0)}
                    </text>
                </svg>
            `}
        </div>
        <div class="hero-content">
            <div class="hero-tagline">${data.tagline}</div>
            <h1 class="hero-title">${data.businessName}</h1>
            <p class="hero-description">${data.description}</p>
            <a href="#" class="hero-cta">${data.ctaText}</a>
        </div>
    </div>
</body>
</html>
    `.trim();
}

/**
 * Centered Hero Template
 * Full-width background with centered content
 */
export function generateCenteredHero(data: HeroData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.businessName} - Centered Hero</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .hero-container {
            min-height: 600px;
            background: linear-gradient(135deg, ${data.primaryColor}15, ${data.secondaryColor}15);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .hero-container::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, ${data.primaryColor}10, transparent);
        }
        .hero-logo {
            margin-bottom: 2rem;
            z-index: 1;
        }
        .hero-logo img {
            max-width: 120px;
            height: auto;
        }
        .hero-content {
            max-width: 800px;
            z-index: 1;
        }
        .hero-tagline {
            font-size: 0.875rem;
            font-weight: 600;
            color: ${data.primaryColor};
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 1rem;
        }
        .hero-title {
            font-size: 4rem;
            font-weight: 700;
            line-height: 1.1;
            color: #1a1a1a;
            margin-bottom: 1.5rem;
        }
        .hero-description {
            font-size: 1.375rem;
            line-height: 1.6;
            color: #666;
            margin-bottom: 2.5rem;
        }
        .hero-cta {
            display: inline-block;
            padding: 1.125rem 3rem;
            background: ${data.primaryColor};
            color: #ffffff;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.125rem;
            border-radius: 8px;
            transition: transform 0.2s;
        }
        .hero-cta:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="hero-container">
        ${data.logoUrl ? `
            <div class="hero-logo">
                <img src="${data.logoUrl}" alt="${data.businessName} Logo">
            </div>
        ` : ''}
        <div class="hero-content">
            <div class="hero-tagline">${data.tagline}</div>
            <h1 class="hero-title">${data.businessName}</h1>
            <p class="hero-description">${data.description}</p>
            <a href="#" class="hero-cta">${data.ctaText}</a>
        </div>
    </div>
</body>
</html>
    `.trim();
}

/**
 * Minimal Hero Template
 * Clean, text-focused design with minimal imagery
 */
export function generateMinimalHero(data: HeroData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.businessName} - Minimal Hero</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #ffffff;
        }
        .hero-container {
            min-height: 600px;
            max-width: 900px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 4rem 2rem;
        }
        .hero-logo {
            width: 60px;
            height: 60px;
            background: ${data.primaryColor};
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 2rem;
        }
        .hero-logo-text {
            color: #ffffff;
            font-size: 1.5rem;
            font-weight: 700;
        }
        .hero-tagline {
            font-size: 0.875rem;
            font-weight: 600;
            color: ${data.primaryColor};
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 1rem;
        }
        .hero-title {
            font-size: 5rem;
            font-weight: 700;
            line-height: 1.05;
            color: #1a1a1a;
            margin-bottom: 1.5rem;
            letter-spacing: -0.02em;
        }
        .hero-description {
            font-size: 1.5rem;
            line-height: 1.6;
            color: #666;
            margin-bottom: 2.5rem;
            max-width: 700px;
        }
        .hero-cta-group {
            display: flex;
            gap: 1rem;
            align-items: center;
        }
        .hero-cta {
            padding: 1rem 2rem;
            background: #1a1a1a;
            color: #ffffff;
            text-decoration: none;
            font-weight: 600;
            font-size: 1rem;
            border-radius: 6px;
            transition: transform 0.2s;
        }
        .hero-cta:hover {
            transform: translateY(-2px);
        }
        .hero-cta-secondary {
            color: #666;
            text-decoration: none;
            font-weight: 500;
            font-size: 1rem;
        }
    </style>
</head>
<body>
    <div class="hero-container">
        <div class="hero-logo">
            <div class="hero-logo-text">${data.businessName.charAt(0)}</div>
        </div>
        <div class="hero-tagline">${data.tagline}</div>
        <h1 class="hero-title">${data.businessName}</h1>
        <p class="hero-description">${data.description}</p>
        <div class="hero-cta-group">
            <a href="#" class="hero-cta">${data.ctaText}</a>
            <a href="#" class="hero-cta-secondary">Learn More →</a>
        </div>
    </div>
</body>
</html>
    `.trim();
}
