<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { webhookEvents, isLoading, error, fetchWebhookEvents, clearWebhookEvents } from '$lib/stores/webhookStore';
  import type { WebhookEvent } from '../api/webhook/+server';
  import WebhookEntry from '$lib/components/WebhookEntry.svelte';

  let filteredEvents: WebhookEvent[] = [];
  let filterId = '';
  let intervalId: number;

  // Subscribe to store changes
  $: filteredEvents = filterId
    ? $webhookEvents.filter(event => event.query.id === filterId)
    : $webhookEvents;

  // Get the id from URL query parameter
  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    filterId = urlParams.get('id') || '';
    
    // Fetch initial data
    fetchWebhookEvents();
    
    // Set up polling every 3 seconds
    intervalId = window.setInterval(fetchWebhookEvents, 3000);
  });

  onDestroy(() => {
    clearInterval(intervalId);
  });
</script>

<div class="max-w-6xl mx-auto">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Webhook Requests</h1>
    
    <div class="flex space-x-4">
      <button 
        on:click={fetchWebhookEvents}
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-150 ease-in-out"
      >
        Refresh
      </button>
      
      <button 
        on:click={clearWebhookEvents}
        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md transition duration-150 ease-in-out"
      >
        Clear All
      </button>
    </div>
  </div>

  {#if filterId}
    <div class="mb-6 bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
      <p class="text-blue-800 dark:text-blue-200">
        Filtering requests with ID: <span class="font-mono font-bold">{filterId}</span>
        <a href="/requests" class="ml-2 text-blue-600 dark:text-blue-400 underline">Clear filter</a>
      </p>
    </div>
  {/if}

  {#if $error}
    <div class="mb-6 bg-red-50 dark:bg-red-900 p-4 rounded-lg">
      <p class="text-red-800 dark:text-red-200">{$error}</p>
    </div>
  {/if}

  {#if $isLoading && filteredEvents.length === 0}
    <div class="flex justify-center items-center h-64">
      <div class="text-gray-600 dark:text-gray-400">Loading webhook events...</div>
    </div>
  {:else if filteredEvents.length === 0}
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
      <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">No webhook requests yet</h2>
      <p class="text-gray-700 dark:text-gray-300">
        Try sending a request to your webhook URL to see it appear here.
      </p>
      <div class="mt-4">
        <a href="/generate" class="text-blue-600 dark:text-blue-400 hover:underline">Generate a webhook URL</a>
      </div>
    </div>
  {:else}
    {#each filteredEvents as event (event.id)}
      <WebhookEntry {event} />
    {/each}
  {/if}
</div> 