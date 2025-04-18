import { writable } from 'svelte/store';
import type { WebhookEvent } from '../../routes/api/webhook/+server';
import { addToast } from './toastStore';

export const webhookEvents = writable<WebhookEvent[]>([]);
export const isLoading = writable<boolean>(false);
export const error = writable<string>('');
export const lastEventTimestamp = writable<string>('');

export async function fetchWebhookEvents() {
  try {
    isLoading.set(true);
    const response = await fetch('/api/webhook');
    if (!response.ok) {
      throw new Error('Failed to fetch webhook events');
    }
    
    const data = await response.json() as WebhookEvent[];
    
    // Check for new events by comparing timestamps
    const lastTimestamp = localStorage.getItem('lastEventTimestamp');
    
    if (data.length > 0) {
      // Store the timestamp of the most recent event
      const mostRecentTimestamp = data[0].timestamp;
      localStorage.setItem('lastEventTimestamp', mostRecentTimestamp);
      lastEventTimestamp.set(mostRecentTimestamp);
      
      // If there are new events (newer than the last timestamp we've seen)
      if (!lastTimestamp || mostRecentTimestamp > lastTimestamp) {
        // Find new events that are newer than the last one we've seen
        const newEvents = lastTimestamp
          ? data.filter((event: WebhookEvent) => event.timestamp > lastTimestamp)
          : [data[0]]; // Only show toast for the most recent event on first load
          
        // Create toast notifications for new events
        newEvents.forEach((event: WebhookEvent) => {
          addToast(event);
        });
      }
    }
    
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