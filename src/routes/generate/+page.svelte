<script lang="ts">
  import { onMount } from 'svelte';
  import { apiToken, regenerateToken } from '$lib/stores/authStore';
  
  let webhookUrl = '';
  let copied = false;
  let tokenCopied = false;
  let tokenRegenerated = false;
  let uniqueId = '';
  let curlCommand = '';
  let isUrlGenerated = false;

  onMount(() => {
    // Check if we have a saved webhook URL in localStorage
    const savedUniqueId = localStorage.getItem('webhookUniqueId');
    if (savedUniqueId) {
      uniqueId = savedUniqueId;
      const baseUrl = window.location.origin;
      webhookUrl = `${baseUrl}/api/webhook?id=${uniqueId}&test=true`;
      updateCurlCommand();
      isUrlGenerated = true;
    }
  });

  function generateNewUrl() {
    uniqueId = crypto.randomUUID();
    const baseUrl = window.location.origin;
    webhookUrl = `${baseUrl}/api/webhook?id=${uniqueId}&test=true`;
    
    // Save to localStorage
    localStorage.setItem('webhookUniqueId', uniqueId);
    
    updateCurlCommand();
    isUrlGenerated = true;
  }

  function updateCurlCommand() {
    // Updated example payload
    const examplePayload = {
      eventWatcherId: "watch_123456789",
      transactionId: "tx_abcdef1234567890",
      events: [
        {
          data: {
            type: "Decimal",
            value: "123.456"
          },
          emitter: {
            globalEmitter: "global_address_123",
            methodEmitter: "method_001",
            outerEmitter: "outer_001"
          },
          eventName: "TokenTransfer"
        }
      ]
    };
    
    curlCommand = `curl -X POST ${webhookUrl} -H "Content-Type: application/json" -d '${JSON.stringify(examplePayload)}'`;
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(webhookUrl).then(() => {
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 2000);
    });
  }
  
  // Copy token to clipboard
  function copyToken() {
    navigator.clipboard.writeText($apiToken);
    tokenCopied = true;
    setTimeout(() => {
      tokenCopied = false;
    }, 2000);
  }
  
  // Regenerate token
  function handleRegenerateToken() {
    if (confirm('Are you sure you want to regenerate your API token? This will invalidate the current token.')) {
      regenerateToken();
      tokenRegenerated = true;
      updateCurlCommand();
      setTimeout(() => {
        tokenRegenerated = false;
      }, 2000);
    }
  }
  
  // Format examples with the current token
  function getNodeJsExample(token: string): string {
    return `const response = await fetch('${window.location.origin}/api/webhook?test=true', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${token}'
  },
  body: JSON.stringify({
    eventWatcherId: "watch_123456789",
    transactionId: "tx_abcdef1234567890",
    events: [
      {
        data: {
          type: "Decimal",
          value: "123.456"
        },
        emitter: {
          globalEmitter: "global_address_123",
          methodEmitter: "method_001",
          outerEmitter: "outer_001"
        },
        eventName: "TokenTransfer"
      }
    ]
  })
});`;
  }
  
  function getPythonExample(token: string): string {
    return `import requests

response = requests.post(
    '${window.location.origin}/api/webhook?test=true',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${token}'
    },
    json={
        'eventWatcherId': 'watch_123456789',
        'transactionId': 'tx_abcdef1234567890',
        'events': [
            {
                'data': {
                    'type': 'Decimal',
                    'value': '123.456'
                },
                'emitter': {
                    'globalEmitter': 'global_address_123',
                    'methodEmitter': 'method_001',
                    'outerEmitter': 'outer_001'
                },
                'eventName': 'TokenTransfer'
            }
        ]
    }
)`;
  }
</script>

<div class="max-w-3xl mx-auto">
  <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Generate Webhook URL</h1>

  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
    <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Your Unique Webhook URL</h2>
    
    {#if isUrlGenerated}
      <div class="mb-6">
        <div class="flex flex-col sm:flex-row">
          <input 
            type="text" 
            readonly
            value={webhookUrl}
            class="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-l-lg sm:rounded-r-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base mb-2 sm:mb-0"
          />
          <button 
            on:click={copyToClipboard}
            class="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg sm:rounded-l-none sm:rounded-r-lg transition duration-150 ease-in-out text-sm sm:text-base"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <button 
          on:click={generateNewUrl}
          class="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-gray-800 dark:text-white transition duration-150 ease-in-out text-sm sm:text-base"
        >
          Generate New URL
        </button>
        
        <a 
          href="/requests?id={uniqueId}" 
          class="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-150 ease-in-out text-center text-sm sm:text-base"
        >
          View Webhook Requests
        </a>
      </div>
    {:else}
      <div class="text-center py-6 sm:py-8">
        <p class="text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">Click the button below to generate a unique webhook URL</p>
        <button 
          on:click={generateNewUrl}
          class="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-150 ease-in-out text-sm sm:text-base"
        >
          Generate New URL
        </button>
      </div>
    {/if}
  </div>

  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
    <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">API Authentication Token (Optional)</h2>
    
    <div class="mb-6 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 p-4 rounded">
      <p class="text-blue-800 dark:text-blue-200 text-sm sm:text-base">
        <strong>Note:</strong> Your webhook URL includes <code class="text-xs sm:text-sm bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">test=true</code> by default, allowing requests without authentication. For secure endpoints in production, remove this parameter and use the API token below with the <code class="text-xs sm:text-sm bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">Authorization</code> header.
      </p>
    </div>
    
    <div class="mb-6">
      <label for="api-token" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">API Token</label>
      <div class="flex flex-col sm:flex-row">
        <input 
          type="text" 
          id="api-token" 
          value={$apiToken} 
          readonly
          class="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-l-lg sm:rounded-r-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base mb-2 sm:mb-0"
        />
        <button 
          on:click={copyToken}
          class="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg sm:rounded-l-none sm:rounded-r-lg transition duration-150 ease-in-out text-sm sm:text-base"
        >
          {tokenCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
    
    <div class="mb-6">
      <button 
        on:click={handleRegenerateToken}
        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition duration-150 ease-in-out text-sm sm:text-base"
      >
        {tokenRegenerated ? 'Token Regenerated!' : 'Regenerate Token'}
      </button>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Regenerating your token will invalidate the current one. If you're using token authentication, you'll need to update all services using this token.
      </p>
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
    <h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">How to use your webhook URL</h2>
    
    <ol class="list-decimal list-inside space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
      <li>
        <strong>Copy your unique webhook URL and API token</strong>
        <p class="mt-1 ml-4 sm:ml-6">Use the buttons above to copy your webhook URL and authentication token (if you need secure access).</p>
      </li>
      
      <li>
        <strong>Configure your service</strong>
        <p class="mt-1 ml-4 sm:ml-6">Set up the service you want to test to send webhooks to this URL. Add the token in the Authorization header for secure endpoints or append <code class="text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">?test=true</code> to your URL to bypass authentication.</p>
      </li>
      
      <li>
        <strong>View incoming requests</strong>
        <p class="mt-1 ml-4 sm:ml-6">Click the "View Webhook Requests" button to see webhook requests as they arrive.</p>
      </li>
      
      <li>
        <strong>Test different HTTP methods</strong>
        <p class="mt-1 ml-4 sm:ml-6">This URL accepts GET, POST, PUT, DELETE, and any other HTTP methods.</p>
      </li>
    </ol>
  </div>

  {#if isUrlGenerated}
    <div class="mt-6 sm:mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Testing your webhook</h2>
      
      <p class="mb-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        You can quickly test your webhook URL with curl using the Radix webhook event structure:
      </p>
      
      <p class="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        The payload should include <code class="text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">eventWatcherId</code>, <code class="text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">transactionId</code>, and an array of <code class="text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">events</code> with SBOR data.
      </p>
      
      <div class="bg-gray-100 dark:bg-gray-900 p-3 sm:p-4 rounded overflow-x-auto">
        <pre class="text-xs sm:text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap sm:whitespace-pre">{curlCommand}</pre>
      </div>
      
      <div class="mt-2 mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400 italic">
          Note: Authentication is bypassed with the <code class="text-xs bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">test=true</code> parameter included in your URL. For secure endpoints, remove this parameter and add the <code class="text-xs bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">Authorization</code> header.
        </p>
      </div>
      
      <div class="mt-4 flex justify-end">
        <button 
          on:click={() => navigator.clipboard.writeText(curlCommand)}
          class="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-150 ease-in-out text-xs sm:text-sm"
        >
          Copy Curl Command
        </button>
      </div>
    </div>
    
    <div class="mt-6 sm:mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Code Examples</h2>
      
      <div class="mb-3 text-sm text-gray-600 dark:text-gray-400 italic">
        <p>Note: These examples include the <code class="text-xs bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">test=true</code> parameter to bypass authentication. For secure endpoints, remove this parameter and use the <code class="text-xs bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">Authorization</code> header with your token.</p>
      </div>
      
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium mb-2 text-gray-900 dark:text-white">Node.js Example</h3>
          <div class="bg-gray-100 dark:bg-gray-900 p-3 sm:p-4 rounded overflow-x-auto">
            <pre class="text-xs sm:text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap sm:whitespace-pre">{getNodeJsExample($apiToken)}</pre>
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-medium mb-2 text-gray-900 dark:text-white">Python Example</h3>
          <div class="bg-gray-100 dark:bg-gray-900 p-3 sm:p-4 rounded overflow-x-auto">
            <pre class="text-xs sm:text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap sm:whitespace-pre">{getPythonExample($apiToken)}</pre>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 sm:mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Secure Authentication Testing</h2>
      
      <p class="mb-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        To test with token-based authentication instead of using <code class="text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">test=true</code>, use this curl command:
      </p>
      
      <div class="bg-gray-100 dark:bg-gray-900 p-3 sm:p-4 rounded overflow-x-auto">
        <pre class="text-xs sm:text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap sm:whitespace-pre">{`curl -X POST ${window.location.origin}/api/webhook -H "Content-Type: application/json" -H "Authorization: Bearer ${$apiToken}" -d '${JSON.stringify({
  eventWatcherId: "watch_123456789",
  transactionId: "tx_abcdef1234567890",
  events: [
    {
      data: {
        type: "Decimal",
        value: "123.456"
      },
      emitter: {
        globalEmitter: "global_address_123",
        methodEmitter: "method_001",
        outerEmitter: "outer_001"
      },
      eventName: "TokenTransfer"
    }
  ]
}, null, 2)}'`}</pre>
      </div>
      
      <p class="mt-3 mb-2 text-sm text-gray-600 dark:text-gray-400">
        <strong>Important:</strong> Note that this example removes the <code class="text-xs bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">test=true</code> parameter and instead uses the <code class="text-xs bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">Authorization</code> header with your token.
      </p>
      
      <div class="mt-4 flex justify-end">
        <button 
          on:click={() => navigator.clipboard.writeText(`curl -X POST ${window.location.origin}/api/webhook -H "Content-Type: application/json" -H "Authorization: Bearer ${$apiToken}" -d '${JSON.stringify({
  eventWatcherId: "watch_123456789",
  transactionId: "tx_abcdef1234567890",
  events: [
    {
      data: {
        type: "Decimal",
        value: "123.456"
      },
      emitter: {
        globalEmitter: "global_address_123",
        methodEmitter: "method_001",
        outerEmitter: "outer_001"
      },
      eventName: "TokenTransfer"
    }
  ]
}, null, 2)}'`)}
          class="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-150 ease-in-out text-xs sm:text-sm"
        >
          Copy Auth Command
        </button>
      </div>
    </div>
  {/if}
</div> 