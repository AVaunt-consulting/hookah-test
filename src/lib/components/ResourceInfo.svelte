<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchResourceDetails, extractResourceMetadata } from '$lib/api/radixApi';

  export let resourceAddress: string;
  
  let resourceName = 'Loading...';
  let resourceIconUrl: string | null = null;
  let isLoading = true;
  let error: string | null = null;
  
  onMount(async () => {
    try {
      isLoading = true;
      const resourceDetails = await fetchResourceDetails(resourceAddress);
      
      if (resourceDetails) {
        const metadata = extractResourceMetadata(resourceDetails);
        resourceName = metadata.name;
        resourceIconUrl = metadata.iconUrl;
      } else {
        resourceName = 'Unknown Resource';
      }
    } catch (err) {
      error = (err as Error).message;
      resourceName = 'Error loading resource';
    } finally {
      isLoading = false;
    }
  });
</script>

<div class="flex items-center">
  {#if isLoading}
    <div class="w-5 h-5 mr-2 rounded-full bg-gray-200 animate-pulse"></div>
    <span class="text-gray-500">Loading resource info...</span>
  {:else if error}
    <div class="text-red-500">{error}</div>
  {:else}
    {#if resourceIconUrl}
      <img src={resourceIconUrl} alt={resourceName} class="w-5 h-5 mr-2 rounded-full" />
    {:else}
      <div class="w-5 h-5 mr-2 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
        {resourceName.charAt(0)}
      </div>
    {/if}
    <span class="font-medium">{resourceName}</span>
    <span class="ml-2 text-xs text-gray-500 truncate max-w-[200px]" title={resourceAddress}>
      {resourceAddress.slice(0, 10)}...{resourceAddress.slice(-6)}
    </span>
  {/if}
</div> 