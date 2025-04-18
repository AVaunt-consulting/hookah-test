<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { get } from 'svelte/store';
  import { webhookEvents } from '$lib/stores/webhookStore';
  
  const dispatch = createEventDispatcher();

  interface Field {
    value: string;
    kind: string;
    field_name?: string;
    type_name?: string;
  }

  interface EventData {
    fields: Field[];
    kind?: string;
    type_name?: string;
    variant_id?: string;
    variant_name?: string;
  }

  interface Emitter {
    globalEmitter: string;
    methodEmitter?: string;
    outerEmitter?: string;
  }

  interface Event {
    eventName: string;
    emitter: Emitter;
    data: EventData;
    message?: string; // Optional message field
    rootMessage?: string; // Optional root message field
    rootMessageObject?: {
      type?: string;
      content?: {
        type?: string;
        value?: string;
      };
      value?: string;
      mime_type?: string;
    }; // Optional rootMessageObject field
  }

  export let event: Event;
  export let standalone = false; // Whether this is a standalone notification or in a container

  // Function to truncate globalEmitter to first 11 chars + ellipsis + last 5 chars
  function truncateEmitter(emitter: string): string {
    if (!emitter || emitter.length <= 16) return emitter;
    return `${emitter.substring(0, 11)}...${emitter.substring(emitter.length - 5)}`;
  }

  // Extract and truncate the full globalEmitter
  $: truncatedEmitter = truncateEmitter(event.emitter.globalEmitter);
  $: fullEmitter = event.emitter.globalEmitter;
  
  // Find the amount field in the data fields
  $: amountField = event.data.fields?.find(field => field.field_name === 'amount') || 
                   event.data.fields?.find(field => field.kind === 'Decimal');
  $: amount = amountField?.value || '0';
  
  // Function to check for a root message in the latest webhook event
  function getRootMessage(): string | undefined {
    try {
      // Get the latest webhook event
      const events = get(webhookEvents);
      if (events.length === 0) {
        console.log('Debug: No events found in webhookEvents store');
        return undefined;
      }
      
      const latestEvent = events[0];
      console.log('Debug: Latest event:', latestEvent);
      
      // Check if it has a message property at the root level
      if (latestEvent.body && 
          typeof latestEvent.body === 'object' && 
          'message' in latestEvent.body) {
        
        const message = latestEvent.body.message;
        console.log('Debug: Found message property:', message);
        
        // Handle structure like { message: { content: { value: "Text" } } }
        if (message && typeof message === 'object' && 
            'content' in message && 
            message.content && 
            typeof message.content === 'object' && 
            'value' in message.content) {
          const messageValue = String(message.content.value);
          console.log('Debug: Extracted message value from content:', messageValue);
          return messageValue;
        }
        
        // Check for direct value property in message object
        if (message && typeof message === 'object' && 'value' in message) {
          const directValue = String(message.value);
          console.log('Debug: Extracted direct value from message object:', directValue);
          return directValue;
        }
        
        // Direct string value
        if (typeof message === 'string') {
          console.log('Debug: Message is a direct string:', message);
          return message;
        }

        console.log('Debug: Message found but structure not recognized:', message);
      } else {
        console.log('Debug: No message property found in event body:', latestEvent.body);
      }
      
      return undefined;
    } catch (error) {
      console.error('Error getting root message:', error);
      return undefined;
    }
  }
  
  // Direct debug for current event
  $: console.log('Debug: Current event being rendered:', event);
  
  // Generate a message from event data or root message
  $: rootMessage = getRootMessage();
  $: console.log('Debug: Root message from event:', rootMessage);
  $: console.log('Debug: Direct message from event object:', event.message);
  $: hasRootMessageObject = 'rootMessageObject' in event && event.rootMessageObject !== undefined;
  $: rootMessageObjectValue = hasRootMessageObject && 
     typeof event.rootMessageObject === 'object' &&
     'value' in event.rootMessageObject ? 
     String(event.rootMessageObject.value) : undefined;
  $: message = event.message || rootMessage || generateMessage(event);
  $: messageSource = event.message ? 'event' : (rootMessage ? 'root' : 'generated');
  $: console.log('Debug: Final message being displayed:', message);
  
  function generateMessage(evt: Event): string {
    // Try to generate a meaningful message from the event data
    const resourceField = evt.data.fields?.find(field => field.type_name === 'ResourceAddress');
    const resourceAddress = resourceField?.value || '';
    
    // Create a truncated version of the resource address if it exists
    const truncatedResource = resourceAddress ? 
      truncateEmitter(resourceAddress) : '';
    
    // Build a message based on the event type and available data
    if (evt.eventName === 'DepositEvent') {
      return `Deposited ${amount} ${truncatedResource ? 'of ' + truncatedResource : ''}`;
    } else if (evt.eventName === 'WithdrawEvent') {
      return `Withdrew ${amount} ${truncatedResource ? 'of ' + truncatedResource : ''}`;
    } else if (evt.eventName === 'TransferEvent') {
      return `Transferred ${amount} ${truncatedResource ? 'of ' + truncatedResource : ''}`;
    } else {
      // Default message for other event types
      const typeName = evt.data.type_name || evt.data.kind || '';
      return `${evt.eventName}${typeName ? ' of type ' + typeName : ''}${amount !== '0' ? ' with amount ' + amount : ''}`;
    }
  }
  
  // Handle dismissal
  function handleDismiss() {
    dispatch('dismiss');
  }
</script>

<div class={standalone ? "fixed top-4 right-4 z-50 w-full max-w-md" : "w-full max-w-md"}>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-l-4 border-green-500">
    <div class="p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <!-- Success Icon -->
          <svg class="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div class="ml-3 flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {event.eventName} <span class="text-gray-500 dark:text-gray-400 text-xs group relative">
              <span title={fullEmitter}>({truncatedEmitter})</span>
            </span>
          </p>
          <div class="mt-2 flex flex-col gap-2">
            <div class="text-sm text-gray-600 dark:text-gray-300">
              <span class="font-medium">Amount:</span> {amount}
            </div>
            {#if rootMessage}
            <div class="text-sm text-gray-600 dark:text-gray-300 break-words max-h-20 overflow-y-auto">
              <span class="font-medium">Root Message:</span> 
              <span class="inline-block max-w-full">{rootMessage}</span>
            </div>
            {/if}
            {#if rootMessageObjectValue && rootMessageObjectValue !== rootMessage}
            <div class="text-sm text-gray-600 dark:text-gray-300 break-words max-h-20 overflow-y-auto">
              <span class="font-medium">Direct Value:</span> 
              <span class="inline-block max-w-full">{rootMessageObjectValue}</span>
            </div>
            {/if}
            <div class="text-sm text-gray-600 dark:text-gray-300 break-words max-h-24 overflow-y-auto">
              <span class="font-medium">Message:</span> 
              <span class="inline-block max-w-full">{message || "No message found"}</span>
              <span class="text-xs text-gray-400 ml-1">[{messageSource}]</span>
            </div>
            <div class="flex justify-end">
              <span class="inline-flex rounded-md text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {event.data.kind || "Transaction"}
              </span>
            </div>
          </div>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <!-- Close button -->
          <button 
            on:click={handleDismiss}
            class="bg-white dark:bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <span class="sr-only">Close</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</div> 