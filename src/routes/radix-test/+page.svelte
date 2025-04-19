<script lang="ts">
  import { onMount } from 'svelte';
  
  let resourceAddress = 'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd';
  let apiResponse: any = null;
  let isLoading = false;
  let error: string | null = null;
  
  async function testResource() {
    if (!resourceAddress) {
      error = 'Please enter a resource address';
      return;
    }
    
    try {
      isLoading = true;
      error = null;
      
      const response = await fetch(`/api/radix-test?address=${encodeURIComponent(resourceAddress)}`);
      apiResponse = await response.json();
      
      if (!response.ok) {
        error = apiResponse.error || 'Unknown error occurred';
        apiResponse = null;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error occurred';
      apiResponse = null;
    } finally {
      isLoading = false;
    }
  }
  
  onMount(() => {
    // Test the default resource on load
    testResource();
  });
</script>

<div class="max-w-6xl mx-auto p-3 sm:p-6">
  <h1 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">Radix Resource API Tester</h1>
  
  <div class="mb-4 sm:mb-6">
    <label class="block mb-2 font-medium text-white">Resource Address</label>
    <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0">
      <input 
        bind:value={resourceAddress}
        type="text" 
        class="w-full px-3 py-2 border border-gray-300 sm:rounded-none sm:rounded-l-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
        placeholder="Enter a resource address (resource_rdx...)"
      />
      <button 
        on:click={testResource}
        class="px-4 py-2 bg-blue-600 text-white sm:rounded-none sm:rounded-r-lg rounded-lg hover:bg-blue-700 transition"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Test'}
      </button>
    </div>
  </div>
  
  {#if error}
    <div class="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-100 text-red-800 rounded-lg text-sm sm:text-base">
      {error}
    </div>
  {/if}
  
  {#if apiResponse}
    <div class="mb-4 sm:mb-6">
      <h2 class="text-lg sm:text-xl font-bold mb-2 text-white">Resource Metadata</h2>
      <div class="bg-gray-100 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
        <p><strong>Name:</strong> {apiResponse.metadata.name}</p>
        {#if apiResponse.metadata.iconUrl}
          <div class="mt-2">
            <p><strong>Icon URL:</strong> <span class="break-all">{apiResponse.metadata.iconUrl}</span></p>
            <img src={apiResponse.metadata.iconUrl} alt="Resource Icon" class="w-12 h-12 sm:w-16 sm:h-16 mt-2 rounded-full" />
          </div>
        {:else}
          <p class="mt-2 text-gray-600">No icon URL found</p>
        {/if}
      </div>
    </div>
    
    <div>
      <h2 class="text-lg sm:text-xl font-bold mb-2 text-white">Full API Response</h2>
      <div class="bg-gray-100 p-3 sm:p-4 rounded-lg overflow-x-auto">
        <pre class="text-xs sm:text-sm whitespace-pre-wrap sm:whitespace-pre">{JSON.stringify(apiResponse, null, 2)}</pre>
      </div>
    </div>
  {/if}
</div> 