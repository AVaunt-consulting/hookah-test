import { writable } from 'svelte/store';
import type { WebhookEvent, WebhookEventData } from '../../routes/api/webhook/+server';

// Define toast notification type
export interface ToastNotification {
  id: string;
  event: WebhookEventData;
  timestamp: string;
  read: boolean;
  visible: boolean;
}

// Create writable store for toast notifications
export const toasts = writable<ToastNotification[]>([]);

// Toast configuration
const TOAST_DISPLAY_TIME = 10000; // 10 seconds in milliseconds

// Function to generate a unique ID with fallback for browsers that don't support crypto.randomUUID()
function generateUniqueId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Fallback for browsers that don't support crypto.randomUUID()
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

// Function to add a new toast notification from a webhook event
export function addToast(webhookEvent: WebhookEvent) {
  // Only add toast for webhook events with proper structure
  if (!webhookEvent.body || typeof webhookEvent.body !== 'object' || !('events' in webhookEvent.body)) {
    return;
  }
  
  const payload = webhookEvent.body as { events: WebhookEventData[] };
  
  // Only process the first event in the webhook payload
  // This is intentional - we only want to show one notification per webhook,
  // even if the webhook contains multiple events
  if (payload.events && payload.events.length > 0) {
    const event = payload.events[0]; // Get only the first event
    const toastId = generateUniqueId();
    
    toasts.update(currentToasts => {
      const newToast: ToastNotification = {
        id: toastId,
        event: event,
        timestamp: webhookEvent.timestamp,
        read: false,
        visible: true
      };
      
      // Add new toast to the beginning of the array
      return [newToast, ...currentToasts].slice(0, 10); // Keep only the 10 most recent toasts
    });
    
    // Auto-hide toast after 10 seconds
    setTimeout(() => {
      dismissToastById(toastId);
    }, TOAST_DISPLAY_TIME);
  }
}

// Function to dismiss a toast by its ID (more reliable than object reference)
export function dismissToastById(toastId: string) {
  toasts.update(currentToasts => 
    currentToasts.map(toast => 
      toast.id === toastId ? { ...toast, visible: false } : toast
    )
  );
}

// Function to dismiss a toast by event (for backward compatibility)
export function dismissToast(event: WebhookEventData) {
  toasts.update(currentToasts => 
    currentToasts.map(toast => 
      toast.event === event ? { ...toast, visible: false } : toast
    )
  );
}

// Function to mark a toast as read
export function markAsRead(id: string) {
  toasts.update(currentToasts => 
    currentToasts.map(toast => 
      toast.id === id ? { ...toast, read: true } : toast
    )
  );
}

// Function to clear all toasts
export function clearAllToasts() {
  toasts.set([]);
} 