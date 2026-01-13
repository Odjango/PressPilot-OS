import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log('[proxy-n8n] Received request:', JSON.stringify(body, null, 2));

        // Map frontend businessType to Factory API category
        const categoryMap: Record<string, string> = {
            'Restaurant / Food Service': 'restaurant',
            'Real Estate / Architecture': 'realestate',
            'Tech / SaaS': 'startup',
            'Health / Wellness': 'fitness',
            'Creative Agency': 'agency',
            'E-commerce': 'ecommerce',
            'Personal Portfolio': 'corporate',
        };

        const category = categoryMap[body.businessType] || 'corporate';

        // Build Factory API payload
        const factoryPayload = {
            businessName: body.businessName || 'My Business',
            tagline: body.tagline || '',
            description: body.description || '',
            category: category,
            colors: {
                primary: '#1e40af',
                secondary: '#64748b',
                accent: '#f59e0b',
                background: '#ffffff',
                text: '#1f2937'
            }
        };

        console.log('[proxy-n8n] Calling Factory API with:', JSON.stringify(factoryPayload, null, 2));

        // Call Factory API directly (bypass n8n for reliability)
        const factoryResponse = await fetch('https://factory.presspilotapp.com/wp-json/presspilot/v1/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-PressPilot-Key': 'pp_factory_2026_109540718b67c8f1acb967948eecf2e1'
            },
            body: JSON.stringify(factoryPayload),
        });

        console.log('[proxy-n8n] Factory API response status:', factoryResponse.status);

        if (!factoryResponse.ok) {
            const errorText = await factoryResponse.text();
            console.error('[proxy-n8n] Factory API error:', errorText);
            return NextResponse.json({ error: 'Factory API failed', details: errorText }, { status: 500 });
        }

        const factoryData = await factoryResponse.json();
        console.log('[proxy-n8n] Factory API response:', JSON.stringify(factoryData, null, 2));

        if (!factoryData.success) {
            return NextResponse.json({ error: factoryData.error || 'Generation failed' }, { status: 500 });
        }

        // Return response in format expected by frontend
        const response = {
            success: true,
            original: factoryData.downloads?.theme_zip || 'https://factory.presspilotapp.com',
            high_contrast: factoryData.downloads?.theme_zip || 'https://factory.presspilotapp.com',
            inverted: factoryData.downloads?.static_zip || 'https://factory.presspilotapp.com',
            theme_zip: factoryData.downloads?.theme_zip,
            static_zip: factoryData.downloads?.static_zip,
            generation_id: factoryData.generation_id,
            pages_created: factoryData.pages_created,
            duration: factoryData.duration
        };

        console.log('[proxy-n8n] Returning to frontend:', JSON.stringify(response, null, 2));
        return NextResponse.json(response);

    } catch (error) {
        console.error('[proxy-n8n] Error:', error);
        return NextResponse.json({
            error: 'Proxy failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
