import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Store for webhook events (would use a database in production)
let webhookEvents: WebhookEvent[] = [];

export type WebhookEvent = {
  id: string;
  timestamp: string;
  method: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: string | Record<string, unknown> | null;
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
  try {
    const contentType = request.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      body = await request.json();
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

  return json({ success: true, message: 'Webhook received', id: event.id });
};

// DELETE handler to clear all webhook events
export const DELETE: RequestHandler = async () => {
  webhookEvents = [];
  return json({ success: true, message: 'All webhook events cleared' });
}; 