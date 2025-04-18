<script lang="ts">
  import { toasts, dismissToastById } from "$lib/stores/toastStore";
  import WebhookNotification from "./WebhookNotification.svelte";
  import type { WebhookEventData } from "../../routes/api/webhook/+server";
  
  // Convert from WebhookEventData to the Event type expected by WebhookNotification
  function convertToNotificationEvent(webhookEvent: WebhookEventData) {
    if (!webhookEvent) return null;
    
    const fields = Array.isArray(webhookEvent.data?.fields) 
      ? webhookEvent.data.fields 
      : [];
    
    let kind = undefined;
    let typeName = undefined;
    
    if (webhookEvent.data && typeof webhookEvent.data === 'object' && webhookEvent.data !== null) {
      kind = 'kind' in webhookEvent.data ? String(webhookEvent.data.kind) : undefined;
      typeName = 'type_name' in webhookEvent.data ? String(webhookEvent.data.type_name) : undefined;
    }
    
    return {
      eventName: webhookEvent.eventName || 'Unknown Event',
      emitter: webhookEvent.emitter || { globalEmitter: 'unknown' },
      data: {
        fields,
        kind,
        type_name: typeName
      }
    };
  }
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-3 w-auto">
  {#each $toasts as toast (toast.id)}
    {#if toast.visible}
      {#if toast.event}
        {@const notificationEvent = convertToNotificationEvent(toast.event)}
        {#if notificationEvent}
          <div class="transform transition-all duration-300 ease-in-out max-w-md w-full" 
              class:opacity-0={!toast.visible} 
              class:translate-x-full={!toast.visible}>
            <WebhookNotification 
              event={notificationEvent} 
              on:dismiss={() => dismissToastById(toast.id)} 
            />
          </div>
        {/if}
      {/if}
    {/if}
  {/each}
</div> 