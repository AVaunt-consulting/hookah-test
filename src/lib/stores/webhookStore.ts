import { writable } from 'svelte/store';
import type { WebhookEvent } from '../../routes/api/webhook/+server';

export const webhookEvents = writable<WebhookEvent[]>([]);
export const isLoading = writable<boolean>(false);
export const error = writable<string>('');

export async function fetchWebhookEvents() {
  try {
    isLoading.set(true);
    const response = await fetch('/api/webhook');
    if (!response.ok) {
      throw new Error('Failed to fetch webhook events');
    }
    
    const data = await response.json();
    webhookEvents.set(data);
    error.set('');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    error.set(errorMessage);
    console.error(errorMessage);
  } finally {
    isLoading.set(false);
  }
}

export async function clearWebhookEvents() {
  try {
    const response = await fetch('/api/webhook', { method: 'DELETE' });
    if (!response.ok) {
      throw new Error('Failed to clear webhook events');
    }
    
    webhookEvents.set([]);
    error.set('');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    error.set(errorMessage);
    console.error(errorMessage);
  }
}

export function filterWebhookEvents(filterId: string) {
  webhookEvents.update(events => {
    if (!filterId) return events;
    return events.filter(event => event.query.id === filterId);
  });
} 