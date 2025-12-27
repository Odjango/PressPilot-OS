import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Send data to n8n Production Webhook (Server-to-Server is NOT blocked by CORS)
        const n8nResponse = await fetch('https://n8n.presspilotapp.com/webhook/build-site', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!n8nResponse.ok) {
            return NextResponse.json({ error: 'n8n failed' }, { status: 500 });
        }

        const data = await n8nResponse.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
    }
}
