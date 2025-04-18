import { writable } from 'svelte/store';
import type { WebhookEvent } from '../../routes/api/webhook/+server';
import { addToast } from './toastStore';

// Local storage key for webhook events
const STORAGE_KEY = 'webhookEvents';
const MAX_STORED_EVENTS = 100;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Initialize the store with data from localStorage if available
const initialEvents = loadFromLocalStorage();

export const webhookEvents = writable<WebhookEvent[]>(initialEvents);
export const isLoading = writable<boolean>(false);
export const error = writable<string>('');
export const lastEventTimestamp = writable<string>(
  isBrowser ? localStorage.getItem('lastEventTimestamp') || '' : ''
);

// Helper function to check if polling is enabled
export function isPollingEnabled(): boolean {
  if (!isBrowser) return false;
  
  const savedPollingEnabled = localStorage.getItem('pollingEnabled');
  return savedPollingEnabled === null ? true : savedPollingEnabled === 'true';
}

// Load webhook events from localStorage
function loadFromLocalStorage(): WebhookEvent[] {
  if (!isBrowser) return [];
  
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error loading webhook events from localStorage:', error);
  }
  return [];
}

// Save webhook events to localStorage
function saveToLocalStorage(events: WebhookEvent[]) {
  if (!isBrowser) return;
  
  try {
    // Limit the number of events stored to prevent excessive storage use
    const eventsToStore = events.slice(0, MAX_STORED_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsToStore));
  } catch (error) {
    console.error('Error saving webhook events to localStorage:', error);
  }
}

// Subscribe to the store and save changes to localStorage
webhookEvents.subscribe(events => {
  saveToLocalStorage(events);
});

export async function fetchWebhookEvents() {
  try {
    isLoading.set(true);
    const response = await fetch('/api/webhook');
    if (!response.ok) {
      throw new Error('Failed to fetch webhook events');
    }
    
    const data = await response.json() as WebhookEvent[];
    
    // Check for new events by comparing timestamps
    const lastTimestamp = isBrowser ? localStorage.getItem('lastEventTimestamp') : null;
    
    if (data.length > 0) {
      // Store the timestamp of the most recent event
      const mostRecentTimestamp = data[0].timestamp;
      if (isBrowser) {
        localStorage.setItem('lastEventTimestamp', mostRecentTimestamp);
      }
      lastEventTimestamp.set(mostRecentTimestamp);
      
      // If there are new events (newer than the last timestamp we've seen)
      if (!lastTimestamp || mostRecentTimestamp > lastTimestamp) {
        // Compare with stored events to find truly new ones
        const storedEvents = loadFromLocalStorage();
        const storedIds = new Set(storedEvents.map(e => e.id));
        
        // Filter to only include events that don't already exist in our local storage
        const newEvents = data.filter((event: WebhookEvent) => !storedIds.has(event.id));
        
        // Create toast notifications for new events
        newEvents.forEach((event: WebhookEvent) => {
          addToast(event);
        });
      }
    }
    
    // Update the store with the new data
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
    
    // Clear both the store and localStorage
    webhookEvents.set([]);
    if (isBrowser) {
      localStorage.removeItem(STORAGE_KEY);
    }
    error.set('');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    error.set(errorMessage);
    console.error(errorMessage);
  }
}

export function filterWebhookEvents(filterId: string) {
  // This function doesn't modify localStorage directly
  // as it's a temporary filter that doesn't affect the actual data
  webhookEvents.update(events => {
    if (!filterId) return events;
    return events.filter(event => event.query.id === filterId);
  });
} 