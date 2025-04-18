<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fetchResourceDetails, extractResourceMetadata } from '$lib/api/radixApi';
  
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
    // Simplified message structure
    messageValue?: string; // The value from message.content.value
  }

  export let event: Event;
  export let standalone = false; // Whether this is a standalone notification or in a container
  
  console.log('WEBHOOK NOTIFICATION: Rendered with event:', event.eventName);
  console.log('WEBHOOK NOTIFICATION: messageValue:', event.messageValue);
  
  // Resource information
  let resourceAddress = '';
  let resourceName = '';
  let resourceIconUrl: string | null = null;
  let isLoadingResource = false;
  
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
  
  // Find resource address in the data fields
  $: {
    const resourceField = event.data.fields?.find(field => 
      field.type_name === 'ResourceAddress' && 
      field.kind === 'Reference' && 
      field.value && 
      field.value.startsWith('resource_')
    );
    
    if (resourceField?.value) {
      resourceAddress = resourceField.value;
      loadResourceInfo(resourceAddress);
    }
  }
  
  // Load resource information from the Radix API
  async function loadResourceInfo(address: string) {
    if (!address) return;
    
    try {
      isLoadingResource = true;
      const resourceDetails = await fetchResourceDetails(address);
      
      if (resourceDetails) {
        const metadata = extractResourceMetadata(resourceDetails);
        resourceName = metadata.name;
        resourceIconUrl = metadata.iconUrl;
      }
    } catch (error) {
      console.error('Error loading resource info:', error);
    } finally {
      isLoadingResource = false;
    }
  }
  
  // Generate a basic message if no custom message is available
  function generateMessage(evt: Event): string {
    // Try to generate a meaningful message from the event data
    const resourceField = evt.data.fields?.find(field => field.type_name === 'ResourceAddress');
    const resourceAddress = resourceField?.value || '';
    
    // Create a truncated version of the resource address if it exists
    const truncatedResource = resourceAddress ? 
      truncateEmitter(resourceAddress) : '';
    
    // Use resource name if available
    const displayResource = resourceName || truncatedResource;
    
    // Build a message based on the event type and available data
    if (evt.eventName === 'DepositEvent') {
      return `Deposited ${amount} ${displayResource}`;
    } else if (evt.eventName === 'WithdrawEvent') {
      return `Withdrew ${amount} ${displayResource}`;
    } else if (evt.eventName === 'TransferEvent') {
      return `Transferred ${amount} ${displayResource}`;
    } else {
      // Default message for other event types
      const typeName = evt.data.type_name || evt.data.kind || '';
      return `${evt.eventName}${typeName ? ' of type ' + typeName : ''}${amount !== '0' ? ' with amount ' + amount : ''}`;
    }
  }
  
  // Use either the provided message value or generate a default one
  $: displayMessage = event.messageValue || generateMessage(event);
  $: console.log('WEBHOOK NOTIFICATION: Using display message:', displayMessage, 
      'Source:', event.messageValue ? 'messageValue' : 'generated');
  
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
            <!-- Amount -->
            <div class="text-sm text-gray-600 dark:text-gray-300">
              <span class="font-medium">Amount:</span> {amount}
            </div>
            
            <!-- Resource information -->
            {#if resourceAddress}
              <div class="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span class="font-medium mr-1">Resource:</span>
                {#if isLoadingResource}
                  <div class="w-4 h-4 mr-1 rounded-full bg-gray-200 animate-pulse"></div>
                  <span>Loading...</span>
                {:else}
                  {#if resourceIconUrl}
                    <img src={resourceIconUrl} alt={resourceName} class="w-4 h-4 mr-1 rounded-full" />
                  {:else}
                    <div class="w-4 h-4 mr-1 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                      {resourceName ? resourceName.charAt(0) : 'R'}
                    </div>
                  {/if}
                  <span>{resourceName || truncateEmitter(resourceAddress)}</span>
                {/if}
              </div>
            {/if}
            
            <!-- Message -->
            <div class="text-sm text-gray-600 dark:text-gray-300 break-words max-h-24 overflow-y-auto">
              <span class="font-medium">Message:</span> 
              <span class="inline-block max-w-full">{displayMessage}</span>
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