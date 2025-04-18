<script lang="ts">
  import { onMount } from 'svelte';
  
  let resourceAddress = 'resource_rdx1qspx7zxmnrh36q33av24srdfzg7m3cj65968erpjuh7ja3rm3vwcz9';
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

<div class="max-w-6xl mx-auto p-6">
  <h1 class="text-2xl font-bold mb-6">Radix Resource API Tester</h1>
  
  <div class="mb-6">
    <label class="block mb-2 font-medium">Resource Address</label>
    <div class="flex">
      <input 
        bind:value={resourceAddress}
        type="text" 
        class="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
        placeholder="Enter a resource address (resource_rdx...)"
      />
      <button 
        on:click={testResource}
        class="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Test'}
      </button>
    </div>
  </div>
  
  {#if error}
    <div class="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
      {error}
    </div>
  {/if}
  
  {#if apiResponse}
    <div class="mb-6">
      <h2 class="text-xl font-bold mb-2">Resource Metadata</h2>
      <div class="bg-gray-100 p-4 rounded-lg">
        <p><strong>Name:</strong> {apiResponse.metadata.name}</p>
        {#if apiResponse.metadata.iconUrl}
          <div class="mt-2">
            <p><strong>Icon URL:</strong> {apiResponse.metadata.iconUrl}</p>
            <img src={apiResponse.metadata.iconUrl} alt="Resource Icon" class="w-16 h-16 mt-2 rounded-full" />
          </div>
        {:else}
          <p class="mt-2 text-gray-600">No icon URL found</p>
        {/if}
      </div>
    </div>
    
    <div>
      <h2 class="text-xl font-bold mb-2">Full API Response</h2>
      <pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        {JSON.stringify(apiResponse, null, 2)}
      </pre>
    </div>
  {/if}
</div> 