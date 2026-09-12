import { NextResponse } from 'next/server';
import { handleWhatsAppMessage } from '@/agent/orchestrator';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'toothfy_local_token';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse('Forbidden', { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value.messages && change.value.messages[0]) {
            const message = change.value.messages[0];
            const phoneNumber = change.value.contacts[0].wa_id;
            
            // Executamos o orquestrador de forma assíncrona para liberar o webhook rápido
            // A Meta exige retorno 200 OK muito rápido
            handleWhatsAppMessage(phoneNumber, message).catch(console.error);
          }
        }
      }
      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    } else {
      return new NextResponse('Not a WhatsApp API event', { status: 404 });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Error handling webhook', { status: 500 });
  }
}
