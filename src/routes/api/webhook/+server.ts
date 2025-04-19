import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ProgrammaticScryptoSborValue } from '$lib/types/sbor';
import { validateWebhookPayload } from '$lib/validation/schema';
import { validateAuthHeader } from '$lib/stores/authStore';

// Store for webhook events (would use a database in production)
let webhookEvents: WebhookEvent[] = [];

export interface WebhookEventData {
  data: ProgrammaticScryptoSborValue;
  emitter: {
    globalEmitter: string;
    methodEmitter: string;
    outerEmitter: string;
  };
  eventName: string;
  [key: string]: unknown; // Allow additional properties with unknown type
}

export interface WebhookPayload {
  eventWatcherId: string;
  transactionId: string;
  events: WebhookEventData[];
}

export type WebhookEvent = {
  id: string;
  timestamp: string;
  method: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: WebhookPayload | string | Record<string, unknown> | null;
  path: string;
};

// GET handler to retrieve stored webhook events
export const GET: RequestHandler = async () => {
  return json(webhookEvents);
};

// POST handler to receive and store webhook events
export const POST: RequestHandler = async ({ request, url }) => {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });
  
  // Check authorization header if not in test mode
  if (!url.searchParams.has('test')) {
    // Get authorization header (case-insensitive)
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    
    if (!validateAuthHeader(authHeader)) {
      return json(
        { 
          success: false, 
          error: 'Unauthorized. Please provide a valid Bearer token in the Authorization header.'
        }, 
        { status: 401 }
      );
    }
  }

  let body = null;
  let validationResult = { valid: true };
  
  try {
    const contentType = request.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const rawBody = await request.json();
      
      // CRITICAL DEBUG: Log entire webhook payload
      console.log('===================== WEBHOOK PAYLOAD =====================');
      console.log(JSON.stringify(rawBody, null, 2));
      console.log('==========================================================');
      
      // Explicitly check the message structure
      if (rawBody && typeof rawBody === 'object' && rawBody.message) {
        console.log('Message object from webhook:', rawBody.message);
        
        if (rawBody.message.content && rawBody.message.content.value) {
          console.log('FOUND MESSAGE.CONTENT.VALUE:', rawBody.message.content.value);
        } else {
          console.log('No message.content.value found in webhook payload');
        }
      }
      
      // Validate against the webhook payload schema
      validationResult = validateWebhookPayload(rawBody);
      
      // Store the body regardless of validation result
      body = rawBody;
    } else {
      body = await request.text();
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
  }

  const event: WebhookEvent = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    method: request.method,
    headers,
    query,
    body,
    path: url.pathname
  };

  // Add to the beginning of the array to show newest first
  webhookEvents = [event, ...webhookEvents].slice(0, 100); // Limit to 100 events

  return json({ 
    success: true, 
    message: validationResult.valid ? 'Webhook received' : 'Webhook received with validation errors',
    id: event.id,
    validationResult
  });
};

// DELETE handler to clear all webhook events
export const DELETE: RequestHandler = async () => {
  webhookEvents = [];
  return json({ success: true, message: 'All webhook events cleared' });
}; 