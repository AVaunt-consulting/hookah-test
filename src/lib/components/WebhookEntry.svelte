<script lang="ts">
  import type { WebhookEvent, WebhookEventData } from '../../routes/api/webhook/+server';
  import ResourceInfo from './ResourceInfo.svelte';
  
  export let event: WebhookEvent;
  
  let expanded = false;
  
  function formatJson(json: unknown): string {
    try {
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return String(json);
    }
  }
  
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
  
  function toggleExpanded() {
    expanded = !expanded;
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleExpanded();
    }
  }

  // Define interfaces for webhook event data
  interface ResourceField {
    value: string;
    kind: string;
    type_name?: string;
    field_name?: string;
  }

  interface EventDataWithFields {
    fields?: ResourceField[];
    data?: {
      fields?: ResourceField[];
    };
  }

  // Extract resource addresses from webhook event, if available
  function extractResourceAddresses(event: WebhookEvent): string[] {
    const resourceAddresses: string[] = [];
    
    if (event.body && typeof event.body === 'object' && 'events' in event.body) {
      const events = (event.body as { events: EventDataWithFields[] }).events;
      
      if (Array.isArray(events)) {
        events.forEach(eventData => {
          // Check direct fields
          if (eventData.fields) {
            extractResourceFromFields(eventData.fields, resourceAddresses);
          }
          
          // Check nested data fields
          if (eventData.data?.fields) {
            extractResourceFromFields(eventData.data.fields, resourceAddresses);
          }
        });
      }
    }
    
    return [...new Set(resourceAddresses)]; // Remove duplicates
  }
  
  function extractResourceFromFields(fields: ResourceField[], resourceAddresses: string[]): void {
    fields.forEach(field => {
      // Look for Reference type fields with ResourceAddress type_name
      if (field.kind === 'Reference' && 
          field.type_name === 'ResourceAddress' && 
          field.value && 
          field.value.startsWith('resource_')) {
        resourceAddresses.push(field.value);
      }
    });
  }
  
  const resourceAddresses = extractResourceAddresses(event);
</script>

<div class="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
  <div 
    class="bg-gray-100 dark:bg-gray-700 px-4 py-3 flex justify-between items-center cursor-pointer"
    on:click={toggleExpanded}
    on:keydown={handleKeyDown}
    role="button"
    tabindex="0"
    aria-expanded={expanded}
  >
    <div>
      <span class="font-mono text-sm px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 mr-2">
        {event.method}
      </span>
      <span class="font-mono text-sm text-gray-700 dark:text-gray-300">
        {event.path}
      </span>
    </div>
    <div class="flex items-center">
      <div class="text-sm text-gray-600 dark:text-gray-400 mr-3">
        {formatDate(event.timestamp)}
      </div>
      <svg 
        class="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 {expanded ? 'transform rotate-180' : ''}" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
  
  {#if expanded}
    <div class="p-4">
      {#if resourceAddresses.length > 0}
        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Resource Information</h3>
          <div class="bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto">
            <div class="space-y-2">
              {#each resourceAddresses as resourceAddress}
                <ResourceInfo {resourceAddress} />
              {/each}
            </div>
          </div>
        </div>
      {/if}
    
      <div class="mb-4">
        <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Headers</h3>
        <pre class="bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto text-sm text-gray-800 dark:text-gray-300">{formatJson(event.headers)}</pre>
      </div>
      
      {#if Object.keys(event.query).length > 0}
        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Query Parameters</h3>
          <pre class="bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto text-sm text-gray-800 dark:text-gray-300">{formatJson(event.query)}</pre>
        </div>
      {/if}
      
      {#if event.body}
        <div>
          <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Body</h3>
          <pre class="bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto text-sm text-gray-800 dark:text-gray-300">{formatJson(event.body)}</pre>
        </div>
      {/if}
    </div>
  {/if}
</div> 