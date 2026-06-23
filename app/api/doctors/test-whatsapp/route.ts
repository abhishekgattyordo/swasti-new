// app/api/doctors/test-whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server';

// ✅ NO authentication required - public endpoint for testing
export async function POST(request: NextRequest) {
  try {
    const { phone, message, templateName, templateLanguage } = await request.json();
    
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const fromId = process.env.FROM_PHONE_NUMBER_ID;
    
    console.log('📱 Testing WhatsApp...');
    console.log('Token:', token ? '✅ Set' : '❌ Missing');
    console.log('From ID:', fromId ? '✅ Set' : '❌ Missing');
    console.log('Phone:', phone);
    console.log('Template:', templateName || 'Text message');
    
    if (!token || !fromId || !phone) {
      return NextResponse.json({ 
        error: 'Missing configuration',
        token: !!token,
        fromId: !!fromId,
        phone: !!phone
      }, { status: 400 });
    }

    // ✅ Build message payload based on type
    let payload: any = {
      messaging_product: 'whatsapp',
      to: phone.replace('+', ''),
    };

    // ✅ If templateName is provided, send template
    if (templateName) {
      payload.type = 'template';
      payload.template = {
        name: templateName,
        language: {
          code: templateLanguage || 'en_US',
        },
      };
    } else {
      // ✅ Otherwise send text message
      payload.type = 'text';
      payload.text = { 
        body: message || 'Test message from hospital' 
      };
    }

    console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(
      `https://graph.facebook.com/v25.0/${fromId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ WhatsApp API Error:', data);
      return NextResponse.json({ 
        success: false, 
        error: data.error?.message || 'WhatsApp API failed',
        details: data
      }, { status: response.status });
    }
    
    return NextResponse.json({ 
      success: true, 
      data,
      message: templateName 
        ? `✅ WhatsApp template "${templateName}" sent successfully!` 
        : '✅ WhatsApp message sent successfully!'
    });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

// ✅ Also support GET for testing
export async function GET() {
  return NextResponse.json({
    message: 'WhatsApp test endpoint. Use POST with:',
    examples: {
      text: { phone: 'number', message: 'text' },
      template: { phone: 'number', templateName: 'hello_world', templateLanguage: 'en_US' }
    }
  });
}