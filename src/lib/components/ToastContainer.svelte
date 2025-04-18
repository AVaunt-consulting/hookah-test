<script lang="ts">
  import { toasts, dismissToastById } from "$lib/stores/toastStore";
  import WebhookNotification from "./WebhookNotification.svelte";
  import type { WebhookEventData } from "../../routes/api/webhook/+server";
  
  // Convert from WebhookEventData to the Event type expected by WebhookNotification
  function convertToNotificationEvent(webhookEvent: WebhookEventData) {
    if (!webhookEvent) return null;
    
    console.log('Debug: Converting webhook event to notification (FULL EVENT):', JSON.stringify(webhookEvent, null, 2));
    
    const fields = Array.isArray(webhookEvent.data?.fields) 
      ? webhookEvent.data.fields 
      : [];
    
    let kind = undefined;
    let typeName = undefined;
    let message = undefined;
    
    // Check for root message first (from the message field in the webhook payload root)
    if ('rootMessage' in webhookEvent) {
      message = webhookEvent.rootMessage;
      console.log('Debug: Using rootMessage from event:', message);
    }
    
    // Try to extract a message from direct message.value at root level if present
    if (!message && 'rootMessageObject' in webhookEvent) {
      const rootMsgObj = webhookEvent.rootMessageObject;
      console.log('Debug: Found rootMessageObject (FULL OBJECT):', JSON.stringify(rootMsgObj, null, 2));
      
      if (rootMsgObj && typeof rootMsgObj === 'object') {
        // Primary path: extract content.value (this is where the message body is stored)
        if ('content' in rootMsgObj && 
            rootMsgObj.content && 
            typeof rootMsgObj.content === 'object' && 
            'value' in rootMsgObj.content) {
          message = String(rootMsgObj.content.value);
          console.log('Debug: Extracted content.value from rootMessageObject (PRIMARY):', message);
        } 
        // Fallback: direct value
        else if ('value' in rootMsgObj) {
          message = String(rootMsgObj.value);
          console.log('Debug: Extracted value from rootMessageObject (fallback):', message);
        }
      }
    }
    
    if (webhookEvent.data && typeof webhookEvent.data === 'object' && webhookEvent.data !== null) {
      kind = 'kind' in webhookEvent.data ? String(webhookEvent.data.kind) : undefined;
      typeName = 'type_name' in webhookEvent.data ? String(webhookEvent.data.type_name) : undefined;
      
      // Try to extract a message from the data if it exists and we don't already have a message
      if (!message) {
        if ('message' in webhookEvent.data) {
          message = String(webhookEvent.data.message);
        } else if ('fields' in webhookEvent.data) {
          // Check if any field has field_name 'message'
          const messageField = fields.find(field => field.field_name === 'message');
          if (messageField) {
            message = messageField.value;
          }
        }
      }
    }
    
    const result = {
      eventName: webhookEvent.eventName || 'Unknown Event',
      emitter: webhookEvent.emitter || { globalEmitter: 'unknown' },
      data: {
        fields,
        kind,
        type_name: typeName
      },
      message,
      rootMessage: 'rootMessage' in webhookEvent ? (webhookEvent as any).rootMessage : undefined,
      rootMessageObject: 'rootMessageObject' in webhookEvent ? (webhookEvent as any).rootMessageObject : undefined,
      // Explicitly add the content.value for direct access
      messageContentValue: message // This will contain the extracted content.value
    };
    
    console.log('Debug: Final notification event object:', JSON.stringify(result, null, 2));
    
    return result;
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