import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

// Note: In a production environment, you would implement a real email service
// Such as SendGrid, Mailgun, Amazon SES, etc.
// For this demo, we'll just log the email that would be sent

interface EmailPayload {
  to: string;
  subject: string;
  message: string;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const payload = await request.json() as EmailPayload;
    
    // Validate payload
    if (!payload.to || !payload.subject || !payload.message) {
      return json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.to)) {
      return json({ success: false, error: 'Invalid email address' }, { status: 400 });
    }
    
    // In a real implementation, you would send an actual email here
    // For now, we'll just log it
    console.log('Email would be sent:');
    console.log(`To: ${payload.to}`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`Message: ${payload.message}`);
    
    // Return success response
    return json({ 
      success: true, 
      message: 'Email notification would be sent in production',
      to: payload.to
    });
    
  } catch (error) {
    console.error('Error processing email notification:', error);
    return json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}; 