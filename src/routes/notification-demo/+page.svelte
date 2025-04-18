<script lang="ts">
  import WebhookNotification from '$lib/components/WebhookNotification.svelte';

  // Sample webhook response
  const webhookResponse = {
    "transactionId": "txid_rdx1we00z2ldr2xrj6w7a3fvjluun3c4w73q5kw4rlpr2dudrqfzwxgsvgkv84",
    "triggerId": "81d2ccd4-274a-4f16-a5bd-8812fd958929",
    "events": [
      {
        "eventName": "DepositEvent",
        "emitter": {
          "globalEmitter": "account_rdx12y9rw7kkgs6t56fthrv70s58fszt7atjnsdvaygwu75t7q27lngp9v",
          "methodEmitter": "internal_vault_rdx1tp3gaegecmu7vxr4yx48fkjqsy33837kyy5ugk9we0kzdewt72spwn",
          "outerEmitter": "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd"
        },
        "data": {
          "fields": [
            {
              "value": "20",
              "kind": "Decimal",
              "field_name": "amount"
            }
          ],
          "kind": "Tuple",
          "type_name": "DepositEvent"
        }
      },
      {
        "eventName": "DepositEvent",
        "emitter": {
          "globalEmitter": "account_rdx12y9rw7kkgs6t56fthrv70s58fszt7atjnsdvaygwu75t7q27lngp9v",
          "methodEmitter": "account_rdx12y9rw7kkgs6t56fthrv70s58fszt7atjnsdvaygwu75t7q27lngp9v"
        },
        "data": {
          "variant_id": "0",
          "variant_name": "Fungible",
          "fields": [
            {
              "value": "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
              "kind": "Reference",
              "type_name": "ResourceAddress"
            },
            {
              "value": "20",
              "kind": "Decimal"
            }
          ],
          "kind": "Enum",
          "type_name": "DepositEvent"
        }
      }
    ]
  };

  let showNotifications = false;
</script>

<div class="max-w-3xl mx-auto p-6">
  <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Webhook Notification Demo</h1>
  
  <div class="mb-8">
    <button 
      on:click={() => showNotifications = !showNotifications}
      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-150 ease-in-out"
    >
      {showNotifications ? 'Hide Notifications' : 'Show Notifications'}
    </button>
  </div>

  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Sample Webhook Response</h2>
    
    <pre class="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-x-auto text-sm">
      {JSON.stringify(webhookResponse, null, 2)}
    </pre>
  </div>

  {#if showNotifications}
    {#each webhookResponse.events as event, index}
      <div class="mt-4" style="position: relative; top: {index * 100}px;">
        <WebhookNotification {event} />
      </div>
    {/each}
  {/if}
</div> 