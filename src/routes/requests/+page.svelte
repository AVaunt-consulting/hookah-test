<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { webhookEvents, isLoading, error, fetchWebhookEvents, clearWebhookEvents } from '$lib/stores/webhookStore';
  import type { WebhookEvent } from '../api/webhook/+server';
  import WebhookEntry from '$lib/components/WebhookEntry.svelte';

  let filteredEvents: WebhookEvent[] = [];
  let filterId = '';
  let intervalId: number | undefined;
  let pollingEnabled = true;
  let pollingInterval = 3000;

  // Subscribe to store changes
  $: filteredEvents = filterId
    ? $webhookEvents.filter(event => event.query.id === filterId)
    : $webhookEvents;

  // Get the id from URL query parameter and load persisted events
  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    filterId = urlParams.get('id') || '';
    
    // Check if polling settings are saved in localStorage
    const savedPollingEnabled = localStorage.getItem('pollingEnabled');
    if (savedPollingEnabled !== null) {
      pollingEnabled = savedPollingEnabled === 'true';
    }
    
    const savedPollingInterval = localStorage.getItem('pollingInterval');
    if (savedPollingInterval) {
      pollingInterval = parseInt(savedPollingInterval, 10);
    }
    
    // Fetch initial data
    fetchWebhookEvents();
    
    // Set up polling if enabled
    if (pollingEnabled) {
      startPolling();
    }
  });

  function startPolling() {
    // Clear any existing interval
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    // Set up new polling interval
    intervalId = window.setInterval(fetchWebhookEvents, pollingInterval);
  }
  
  function togglePolling() {
    pollingEnabled = !pollingEnabled;
    localStorage.setItem('pollingEnabled', pollingEnabled.toString());
    
    if (pollingEnabled) {
      startPolling();
    } else if (intervalId) {
      clearInterval(intervalId);
      intervalId = undefined;
    }
  }
  
  function updatePollingInterval(newInterval: number) {
    pollingInterval = newInterval;
    localStorage.setItem('pollingInterval', pollingInterval.toString());
    
    if (pollingEnabled) {
      startPolling();
    }
  }

  onDestroy(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });
</script>

<div class="max-w-6xl mx-auto">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Webhook Requests</h1>
    
    <div class="flex space-x-4">
      <div class="flex items-center mr-4">
        <label class="inline-flex items-center cursor-pointer">
          <input type="checkbox" bind:checked={pollingEnabled} on:change={togglePolling} class="sr-only peer">
          <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Auto refresh</span>
        </label>
      </div>
      
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
    <div class="space-y-4">
      {#each filteredEvents as event (event.id)}
        <WebhookEntry {event} />
      {/each}
    </div>
  {/if}
</div> 