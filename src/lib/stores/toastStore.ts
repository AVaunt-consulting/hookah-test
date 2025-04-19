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

// Function to generate a notification message from a webhook event
// This is exported so it can be used by both toast and external notifications
export function generateNotificationMessage(webhookEvent: WebhookEvent): {
  title: string;
  message: string;
  eventInfo: ExtendedWebhookEventData | null;
} {
  // Default return values
  let eventInfo: ExtendedWebhookEventData | null = null;
  let title = 'New Webhook Event';
  let message = `Received request at ${new Date(webhookEvent.timestamp).toLocaleString()}`;
  
  // Process event data if it exists
  if (webhookEvent.body && typeof webhookEvent.body === 'object' && 'events' in webhookEvent.body) {
    const payload = webhookEvent.body as { 
      events: WebhookEventData[],
      message?: MessageObject
    };
    
    // Extract the message object
    const messageObject = payload.message;
    
    // Process events if they exist
    if (payload.events && payload.events.length > 0) {
      // Get the base event (first event)
      const baseEvent = payload.events[0];
      
      // Find the first event with a ResourceAddress field if it exists
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
      
      // Create extended event with rootMessageObject
      eventInfo = {
        ...eventToUse,
        rootMessageObject: messageObject
      };
      
      // Add event-specific information to the message
      title = `New ${eventToUse.eventName || 'Webhook'} Event`;
      
      // Build a more detailed message
      const detailParts = [];
      
      // Include event name if available
      if (eventToUse.eventName) {
        detailParts.push(`Type: ${eventToUse.eventName}`);
      }
      
      // Include account address if available
      if (eventToUse.emitter?.globalEmitter && eventToUse.emitter.globalEmitter.startsWith('account_')) {
        const accountAddress = eventToUse.emitter.globalEmitter;
        const shortAccount = `${accountAddress.substring(0, 15)}...${accountAddress.substring(accountAddress.length - 8)}`;
        detailParts.push(`Account: ${shortAccount}`);
      }
      
      // Include message content if available
      if (messageObject?.content?.value) {
        detailParts.push(`Memo: ${messageObject.content.value}`);
      }
      
      // Add amount information if available
      const amountField = eventToUse.data?.fields?.find((field: Field) => 
        field.field_name === 'amount' || field.kind === 'Decimal'
      );
      if (amountField?.value) {
        detailParts.push(`Amount: ${amountField.value}`);
      }
      
      // Add resource information if available
      if (resourceEvent?.data?.fields) {
        const resourceField = resourceEvent.data.fields.find((field: Field) => 
          field.type_name === 'ResourceAddress' && field.kind === 'Reference'
        );
        
        if (resourceField?.value) {
          const resourceAddress = resourceField.value;
          
          // Try to find resource name and symbol in the payload
          let resourceName = '';
          let resourceSymbol = '';
          
          // Check for resource name fields in all events
          for (const event of payload.events) {
            if (event.data?.fields) {
              // Look for name field
              const nameField = event.data.fields.find((field: Field) => 
                field.field_name === 'name' || 
                (field.field_name === 'metadata' && field.value?.includes('name'))
              );
              if (nameField?.value) {
                resourceName = String(nameField.value);
              }
              
              // Look for symbol field
              const symbolField = event.data.fields.find((field: Field) => 
                field.field_name === 'symbol' || 
                (field.field_name === 'metadata' && field.value?.includes('symbol'))
              );
              if (symbolField?.value) {
                resourceSymbol = String(symbolField.value);
              }
            }
          }
          
          // Construct the resource information
          let resourceInfo = `Resource: ${resourceAddress}`;
          if (resourceName && resourceSymbol) {
            resourceInfo = `Resource: ${resourceName} (${resourceSymbol})`;
          } else if (resourceName) {
            resourceInfo = `Resource: ${resourceName}`;
          } else if (resourceSymbol) {
            resourceInfo = `Resource: ${resourceSymbol}`;
          }
          
          detailParts.push(resourceInfo);
        }
      }
      
      // Add webhook ID and timestamp (removed Method and Endpoint as requested)
      detailParts.push(`ID: ${webhookEvent.query.id || 'none'}`);
      detailParts.push(`Time: ${new Date(webhookEvent.timestamp).toLocaleString()}`);
      
      // Combine all details into a message
      message = detailParts.join('\n');
    }
  }
  
  return { title, message, eventInfo };
}

// Function to add a new toast notification from a webhook event
export function addToast(webhookEvent: WebhookEvent) {
  console.log('ADD TOAST: Processing webhook event', webhookEvent.id);
  
  // Use the shared notification generator
  const { eventInfo, title, message } = generateNotificationMessage(webhookEvent);
  
  // Only proceed if we have event info
  if (eventInfo) {
    const toastId = generateUniqueId();
    
    toasts.update(currentToasts => {
      const newToast: ToastNotification = {
        id: toastId,
        event: eventInfo,
        timestamp: webhookEvent.timestamp,
        read: false,
        visible: true
      };
      
      // Log the event in the toast before adding
      console.log('ADD TOAST: Created toast notification', title);
      
      // Add new toast to the beginning of the array
      return [newToast, ...currentToasts].slice(0, 10); // Keep only the 10 most recent toasts
    });
    
    // Auto-hide toast after 10 seconds
    setTimeout(() => {
      dismissToastById(toastId);
    }, TOAST_DISPLAY_TIME);
    
    return { toastId, title, message, eventInfo };
  } else {
    console.log('ADD TOAST: Could not generate notification from event data');
    return null;
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