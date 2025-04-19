import { writable, get } from 'svelte/store';
import type { WebhookEvent } from '../../routes/api/webhook/+server';
import { addToast, generateNotificationMessage } from './toastStore';
import { notificationSettings } from './notificationSettingsStore';

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

// Async function to send a notification
async function sendExternalNotification(event: WebhookEvent) {
  const settings = get(notificationSettings);
  
  // Skip if notifications are globally disabled
  if (!settings.enabled) return;
  
  try {
    // Generate notification content using the shared generator
    const { title, message } = generateNotificationMessage(event);
    
    // Format the message with a title
    const formattedMessage = `${title}\n\n${message}`;

    // Send email notification if enabled
    if (settings.email.enabled && settings.email.address) {
      try {
        const emailResponse = await fetch('/api/notifications/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: settings.email.address,
            subject: title,
            message: formattedMessage,
          }),
        });
        
        const emailResult = await emailResponse.json();
        if (!emailResult.success) {
          console.error('Email notification failed:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
    }
    
    // Send SMS notification if enabled
    if (settings.sms.enabled && settings.sms.phoneNumber) {
      try {
        const smsResponse = await fetch('/api/notifications/sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: settings.sms.phoneNumber,
            message: formattedMessage,
          }),
        });
        
        const smsResult = await smsResponse.json();
        if (!smsResult.success) {
          console.error('SMS notification failed:', smsResult.error);
        }
      } catch (smsError) {
        console.error('Failed to send SMS notification:', smsError);
      }
    }
    
    // Send Telegram notification if enabled
    if (settings.telegram.enabled && settings.telegram.chatId) {
      try {
        const telegramResponse = await fetch('/api/notifications/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatId: settings.telegram.chatId,
            message: formattedMessage,
          }),
        });
        
        const telegramResult = await telegramResponse.json();
        if (!telegramResult.success) {
          console.error('Telegram notification failed:', telegramResult.error);
        }
      } catch (telegramError) {
        console.error('Failed to send Telegram notification:', telegramError);
      }
    }
  } catch (error) {
    console.error('Failed to send notifications:', error);
  }
}

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
          sendExternalNotification(event);
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