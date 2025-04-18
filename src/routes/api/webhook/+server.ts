import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ProgrammaticScryptoSborValue } from '$lib/types/sbor';
import { validateWebhookPayload } from '$lib/validation/schema';

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

  let body = null;
  let validationResult = { valid: true };
  
  try {
    const contentType = request.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const rawBody = await request.json();
      
      // Debug the incoming message structure
      console.log('Debug: Incoming webhook JSON payload:', JSON.stringify(rawBody, null, 2));
      
      // Check if there's a message.content.value in the payload
      if (rawBody && typeof rawBody === 'object' && 'message' in rawBody) {
        const messageObj = rawBody.message;
        console.log('Debug: Found message object in webhook:', JSON.stringify(messageObj, null, 2));
        
        if (messageObj && typeof messageObj === 'object' && 'content' in messageObj) {
          const contentObj = messageObj.content;
          console.log('Debug: Found content object in message:', JSON.stringify(contentObj, null, 2));
          
          if (contentObj && typeof contentObj === 'object' && 'value' in contentObj) {
            console.log('Debug: Found value in content object:', contentObj.value);
          } else {
            console.log('Debug: No value found in content object');
          }
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