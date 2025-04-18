<script lang="ts">
  import { onMount } from 'svelte';

  let webhookUrl = '';
  let copied = false;
  let uniqueId = '';
  let curlCommand = '';

  onMount(() => {
    generateNewUrl();
  });

  function generateNewUrl() {
    uniqueId = crypto.randomUUID();
    const baseUrl = window.location.origin;
    webhookUrl = `${baseUrl}/api/webhook?id=${uniqueId}`;
    curlCommand = `curl -X POST ${webhookUrl} -H "Content-Type: application/json" -d '{"message":"Hello World"}'`;
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(webhookUrl).then(() => {
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 2000);
    });
  }
</script>

<div class="max-w-3xl mx-auto">
  <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Generate Webhook URL</h1>

  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
    <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Your Unique Webhook URL</h2>
    
    <div class="mb-6">
      <div class="flex">
        <input 
          type="text" 
          readonly
          value={webhookUrl}
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button 
          on:click={copyToClipboard}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-r-lg transition duration-150 ease-in-out"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>

    <div class="flex justify-between items-center">
      <button 
        on:click={generateNewUrl}
        class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-gray-800 dark:text-white transition duration-150 ease-in-out"
      >
        Generate New URL
      </button>
      
      <a 
        href="/requests?id={uniqueId}" 
        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-150 ease-in-out"
      >
        View Webhook Requests
      </a>
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">How to use your webhook URL</h2>
    
    <ol class="list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300">
      <li>
        <strong>Copy your unique webhook URL</strong>
        <p class="mt-1 ml-6">Use the button above to copy your webhook URL to the clipboard.</p>
      </li>
      
      <li>
        <strong>Configure your service</strong>
        <p class="mt-1 ml-6">Set up the service you want to test to send webhooks to this URL.</p>
      </li>
      
      <li>
        <strong>View incoming requests</strong>
        <p class="mt-1 ml-6">Click the "View Webhook Requests" button to see webhook requests as they arrive.</p>
      </li>
      
      <li>
        <strong>Test different HTTP methods</strong>
        <p class="mt-1 ml-6">This URL accepts GET, POST, PUT, DELETE, and any other HTTP methods.</p>
      </li>
    </ol>
  </div>

  <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Testing your webhook</h2>
    
    <p class="mb-4 text-gray-700 dark:text-gray-300">
      You can quickly test your webhook URL with curl:
    </p>
    
    <div class="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-x-auto">
      <pre class="text-sm text-gray-800 dark:text-gray-300">{curlCommand}</pre>
    </div>
  </div>
</div> 