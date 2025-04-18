<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
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
  }

  export let event: Event;
  export let standalone = false; // Whether this is a standalone notification or in a container

  // Extract account ID from the globalEmitter
  $: accountId = event.emitter.globalEmitter.split('_')[1]?.substring(0, 8) || '';
  
  // Find the amount field in the data fields
  $: amountField = event.data.fields?.find(field => field.field_name === 'amount') || 
                   event.data.fields?.find(field => field.kind === 'Decimal');
  $: amount = amountField?.value || '0';
  
  // Handle dismissal
  function handleDismiss() {
    dispatch('dismiss');
  }
</script>

<div class={standalone ? "fixed top-4 right-4 z-50 max-w-sm w-full" : "max-w-sm w-full"}>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-l-4 border-green-500">
    <div class="p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <!-- Success Icon -->
          <svg class="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div class="ml-3 w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {event.eventName} <span class="text-gray-500 dark:text-gray-400 text-xs">({accountId})</span>
          </p>
          <div class="mt-2 flex justify-between items-center">
            <div class="text-sm text-gray-600 dark:text-gray-300">
              <span class="font-medium">Amount:</span> {amount}
            </div>
            <span class="inline-flex rounded-md text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {event.data.kind || "Transaction"}
            </span>
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