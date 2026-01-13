import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Send data to n8n Production Webhook
        const n8nResponse = await fetch('https://n8n.presspilotapp.com/webhook/build-site', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...body,
                business_name: body.businessName,
                industry: body.businessType,
                // Pass through logo_base64 as 'logo_base64' (frontend sends it as 'logo', let's fix that mapping too if needed)
                // Frontend sends: businessName, tagline, description, contentLanguage, businessType, logo
                // n8n expects: business_name, industry, logo_base64 (from existing JS node logic)
                logo_base64: body.logo
            }),
        });

        if (!n8nResponse.ok) {
            return NextResponse.json({ error: 'n8n failed' }, { status: 500 });
        }

        // Check if response is JSON
        const contentType = n8nResponse.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await n8nResponse.json();
        } else {
            console.log('n8n returned non-JSON:', contentType);
            data = { status: 'success' };
        }

        // Enforce Preview URLs (Fix for "Dimmed" buttons if n8n doesn't return them)
        if (!data.original) data.original = 'https://factory.presspilotapp.com';
        if (!data.high_contrast) data.high_contrast = 'https://factory.presspilotapp.com';
        if (!data.inverted) data.inverted = 'https://factory.presspilotapp.com';

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
    }
}
