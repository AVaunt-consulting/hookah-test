import { writable } from 'svelte/store';
import type { WebhookEvent, WebhookEventData } from '../../routes/api/webhook/+server';

// Define field structure
interface Field {
  value: string;
  kind: string;
  field_name?: string;
  type_name?: string;
}

// Define the message object structure
interface MessageObject {
  type?: string;
  content?: {
    type?: string;
    value?: string;
  };
  value?: string;
  mime_type?: string;
}

// Define extended WebhookEventData type with rootMessageObject
interface ExtendedWebhookEventData extends WebhookEventData {
  rootMessageObject?: MessageObject;
}

// Define toast notification type
export interface ToastNotification {
  id: string;
  event: ExtendedWebhookEventData;
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
  console.log('ADD TOAST: Processing webhook event', webhookEvent.id);
  
  // Only add toast for webhook events with proper structure
  if (!webhookEvent.body || typeof webhookEvent.body !== 'object' || !('events' in webhookEvent.body)) {
    console.log('ADD TOAST: Invalid webhook body structure, missing events array');
    return;
  }
  
  const payload = webhookEvent.body as { 
    events: WebhookEventData[],
    message?: MessageObject
  };
  
  // Extract the message object to pass to the notification
  const messageObject = payload.message;
  console.log('ADD TOAST: Extracted message object:', JSON.stringify(messageObject, null, 2));
  
  // Make sure we have events
  if (payload.events && payload.events.length > 0) {
    // Get the base event (first event)
    const baseEvent = payload.events[0];
    console.log('ADD TOAST: Base event:', baseEvent.eventName);
    
    // Find the first event with a ResourceAddress field if it exists
    // This helps ensure we show resource info in the notification
    const resourceEvent = payload.events.find(event => {
      if (event.data?.fields) {
        return event.data.fields.some((field: Field) => 
          field.type_name === 'ResourceAddress' && 
          field.kind === 'Reference' && 
          field.value && 
          field.value.startsWith('resource_')
        );
      }
      return false;
    });
    
    // Use resource event if found, otherwise use base event
    const eventToUse = resourceEvent || baseEvent;
    console.log('ADD TOAST: Using event for notification:', eventToUse.eventName);
    
    // Create extended event with rootMessageObject
    const extendedEvent: ExtendedWebhookEventData = {
      ...eventToUse,
      rootMessageObject: messageObject
    };
    
    if (extendedEvent.rootMessageObject?.content?.value) {
      console.log('ADD TOAST: Message content value is available:', extendedEvent.rootMessageObject.content.value);
    } else {
      console.log('ADD TOAST: No message content value available in rootMessageObject');
    }
    
    const toastId = generateUniqueId();
    
    toasts.update(currentToasts => {
      const newToast: ToastNotification = {
        id: toastId,
        event: extendedEvent,
        timestamp: webhookEvent.timestamp,
        read: false,
        visible: true
      };
      
      // Log the event in the toast before adding
      console.log('ADD TOAST: Created toast with event ID:', extendedEvent.eventName);
      
      // Add new toast to the beginning of the array
      return [newToast, ...currentToasts].slice(0, 10); // Keep only the 10 most recent toasts
    });
    
    // Auto-hide toast after 10 seconds
    setTimeout(() => {
      dismissToastById(toastId);
    }, TOAST_DISPLAY_TIME);
  } else {
    console.log('ADD TOAST: No events found in webhook payload');
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