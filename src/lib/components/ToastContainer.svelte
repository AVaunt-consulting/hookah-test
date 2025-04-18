<script lang="ts">
  import { toasts, dismissToastById } from "$lib/stores/toastStore";
  import WebhookNotification from "./WebhookNotification.svelte";
  import type { WebhookEventData } from "../../routes/api/webhook/+server";

  // Define the same interfaces as in toastStore for consistency
  interface MessageObject {
    type?: string;
    content?: {
      type?: string;
      value?: string;
    };
    value?: string;
    mime_type?: string;
  }

  interface ExtendedWebhookEventData extends WebhookEventData {
    rootMessageObject?: MessageObject;
  }
  
  // Convert from ExtendedWebhookEventData to the Event type expected by WebhookNotification
  function convertToNotificationEvent(webhookEvent: ExtendedWebhookEventData) {
    if (!webhookEvent) return null;
    
    // Extract fields for the notification
    const fields = Array.isArray(webhookEvent.data?.fields) 
      ? webhookEvent.data.fields 
      : [];
    
    let kind = undefined;
    let typeName = undefined;
    let messageValue = undefined;
    
    // Extract message.content.value if it exists
    if (webhookEvent.rootMessageObject) {
      const msgObj = webhookEvent.rootMessageObject;
      if (msgObj.content?.value) {
        // This is the primary location of the message in webhook
        messageValue = String(msgObj.content.value);
      }
    }
    
    // Extract other data properties
    if (webhookEvent.data && typeof webhookEvent.data === 'object') {
      kind = webhookEvent.data.kind;
      typeName = webhookEvent.data.type_name;
    }
    
    // Return simplified event object
    return {
      eventName: webhookEvent.eventName || 'Unknown Event',
      emitter: webhookEvent.emitter || { globalEmitter: 'unknown' },
      data: {
        fields,
        kind,
        type_name: typeName
      },
      messageValue
    };
  }
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-4 w-auto max-h-screen overflow-y-auto pb-4">
  {#each $toasts as toast (toast.id)}
    {#if toast.visible}
      {#if toast.event}
        {@const notificationEvent = convertToNotificationEvent(toast.event)}
        {#if notificationEvent}
          <div class="transform transition-all duration-300 ease-in-out max-w-xl w-full" 
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