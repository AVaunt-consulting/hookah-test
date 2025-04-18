<script lang="ts">
  import { toasts, dismissToast } from "$lib/stores/toastStore";
  import WebhookNotification from "./WebhookNotification.svelte";
  import type { WebhookEventData } from "../../routes/api/webhook/+server";
  
  // Convert from WebhookEventData to the Event type expected by WebhookNotification
  function convertToNotificationEvent(webhookEvent: WebhookEventData) {
    return {
      eventName: webhookEvent.eventName,
      emitter: webhookEvent.emitter,
      data: {
        fields: Array.isArray(webhookEvent.data.fields) 
          ? webhookEvent.data.fields 
          : [],
        kind: typeof webhookEvent.data === 'object' && webhookEvent.data !== null 
          ? 'kind' in webhookEvent.data 
            ? String(webhookEvent.data.kind) 
            : undefined
          : undefined,
        type_name: typeof webhookEvent.data === 'object' && webhookEvent.data !== null 
          ? 'type_name' in webhookEvent.data 
            ? String(webhookEvent.data.type_name) 
            : undefined
          : undefined
      }
    };
  }
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-3 w-auto">
  {#each $toasts as toast (toast.id)}
    {#if toast.visible}
      <div class="transform transition-all duration-300 ease-in-out max-w-md w-full" 
          class:opacity-0={!toast.visible} 
          class:translate-x-full={!toast.visible}>
        <WebhookNotification 
          event={convertToNotificationEvent(toast.event)} 
          on:dismiss={() => dismissToast(toast.event)} 
        />
      </div>
    {/if}
  {/each}
</div> 