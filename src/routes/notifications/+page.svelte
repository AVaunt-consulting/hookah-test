<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    notificationSettings, 
    updateEmailSettings, 
    updateSmsSettings,
    updateTelegramSettings,
    toggleNotifications 
  } from '$lib/stores/notificationSettingsStore';
  
  let emailAddress = '';
  let phoneNumber = '';
  let telegramChatId = '';
  let notificationsEnabled = false;
  let emailEnabled = false;
  let smsEnabled = false;
  let telegramEnabled = false;
  
  let emailSaveSuccess = false;
  let smsSaveSuccess = false;
  let telegramSaveSuccess = false;
  
  let isTestingEmail = false;
  let isTestingSms = false;
  let isTestingTelegram = false;
  let testEmailResult = '';
  let testSmsResult = '';
  let testTelegramResult = '';
  
  // Load settings
  onMount(() => {
    emailAddress = $notificationSettings.email.address;
    phoneNumber = $notificationSettings.sms.phoneNumber;
    telegramChatId = $notificationSettings.telegram.chatId;
    notificationsEnabled = $notificationSettings.enabled;
    emailEnabled = $notificationSettings.email.enabled;
    smsEnabled = $notificationSettings.sms.enabled;
    telegramEnabled = $notificationSettings.telegram.enabled;
  });
  
  // Subscribe to store changes
  $: {
    emailAddress = $notificationSettings.email.address;
    phoneNumber = $notificationSettings.sms.phoneNumber;
    telegramChatId = $notificationSettings.telegram.chatId;
    notificationsEnabled = $notificationSettings.enabled;
    emailEnabled = $notificationSettings.email.enabled;
    smsEnabled = $notificationSettings.sms.enabled;
    telegramEnabled = $notificationSettings.telegram.enabled;
  }
  
  function saveEmailSettings() {
    updateEmailSettings(emailAddress, emailEnabled);
    emailSaveSuccess = true;
    setTimeout(() => {
      emailSaveSuccess = false;
    }, 3000);
  }
  
  function saveSmsSettings() {
    updateSmsSettings(phoneNumber, smsEnabled);
    smsSaveSuccess = true;
    setTimeout(() => {
      smsSaveSuccess = false;
    }, 3000);
  }
  
  function saveTelegramSettings() {
    updateTelegramSettings(telegramChatId, telegramEnabled);
    telegramSaveSuccess = true;
    setTimeout(() => {
      telegramSaveSuccess = false;
    }, 3000);
  }
  
  function toggleGlobalNotifications() {
    notificationsEnabled = !notificationsEnabled;
    toggleNotifications(notificationsEnabled);
  }
  
  async function testEmailNotification() {
    if (!emailAddress) {
      testEmailResult = 'Please enter an email address first';
      return;
    }
    
    isTestingEmail = true;
    testEmailResult = '';
    
    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailAddress,
          subject: 'Test Notification',
          message: 'This is a test notification from your webhook service.',
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        testEmailResult = 'Test email notification sent successfully!';
      } else {
        testEmailResult = `Error: ${result.error || 'Unknown error'}`;
      }
    } catch (error) {
      testEmailResult = `Error: ${error instanceof Error ? error.message : 'Failed to send test email'}`;
    } finally {
      isTestingEmail = false;
    }
  }
  
  async function testSmsNotification() {
    if (!phoneNumber) {
      testSmsResult = 'Please enter a phone number first';
      return;
    }
    
    isTestingSms = true;
    testSmsResult = '';
    
    try {
      const response = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          message: 'This is a test notification from your webhook service.',
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        testSmsResult = 'Test SMS notification sent successfully!';
      } else {
        testSmsResult = `Error: ${result.error || 'Unknown error'}`;
      }
    } catch (error) {
      testSmsResult = `Error: ${error instanceof Error ? error.message : 'Failed to send test SMS'}`;
    } finally {
      isTestingSms = false;
    }
  }
  
  async function testTelegramNotification() {
    if (!telegramChatId) {
      testTelegramResult = 'Please enter a Telegram chat ID first';
      return;
    }
    
    isTestingTelegram = true;
    testTelegramResult = '';
    
    try {
      const response = await fetch('/api/notifications/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: telegramChatId,
          message: 'This is a test notification from your webhook service.',
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        testTelegramResult = 'Test Telegram notification sent successfully!';
      } else {
        testTelegramResult = `Error: ${result.error || 'Unknown error'}`;
      }
    } catch (error) {
      testTelegramResult = `Error: ${error instanceof Error ? error.message : 'Failed to send Telegram message'}`;
    } finally {
      isTestingTelegram = false;
    }
  }
</script>

<div class="max-w-3xl mx-auto p-4">
  <h1 class="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-white">Notification Settings</h1>
  
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">External Notifications</h2>
      
      <button 
        on:click={toggleGlobalNotifications}
        class="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base {notificationsEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'} text-white font-medium rounded-lg transition duration-150 ease-in-out flex items-center"
      >
        <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        {notificationsEnabled ? 'Notifications ON' : 'Notifications OFF'}
      </button>
    </div>
    
    <p class="mb-6 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
      Configure external notifications to be alerted when new webhook events are received, even when you're not actively using the application.
    </p>
    
    {#if !notificationsEnabled}
      <div class="mb-6 bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 rounded">
        <p class="text-yellow-800 dark:text-yellow-200 text-sm sm:text-base">
          <strong>Note:</strong> External notifications are currently disabled. Enable them using the toggle above.
        </p>
      </div>
    {/if}
    
    <div class="flex flex-col space-y-6">
      <!-- Email Notifications -->
      <div class="border dark:border-gray-700 rounded-lg p-4">
        <div class="flex items-center mb-4">
          <input 
            type="checkbox" 
            id="email-toggle" 
            bind:checked={emailEnabled}
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label for="email-toggle" class="ml-2 text-lg font-medium text-gray-900 dark:text-white">Email Notifications</label>
        </div>
        
        <div class="mb-4">
          <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email Address</label>
          <input 
            type="email" 
            id="email" 
            bind:value={emailAddress}
            placeholder="your.email@example.com" 
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
        
        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button 
            on:click={saveEmailSettings}
            disabled={!emailAddress || isTestingEmail}
            class="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            Save Email Settings
          </button>
          
          <button 
            on:click={testEmailNotification}
            disabled={!emailAddress || isTestingEmail}
            class="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isTestingEmail ? 'Sending...' : 'Test Email Notification'}
          </button>
        </div>
        
        {#if emailSaveSuccess}
          <p class="mt-2 text-green-600 dark:text-green-400 text-sm">Settings saved successfully!</p>
        {/if}
        
        {#if testEmailResult}
          <p class="mt-2 text-sm {testEmailResult.includes('Error') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}">
            {testEmailResult}
          </p>
        {/if}
      </div>
      
      <!-- SMS Notifications -->
      <div class="border dark:border-gray-700 rounded-lg p-4">
        <div class="flex items-center mb-4">
          <input 
            type="checkbox" 
            id="sms-toggle" 
            bind:checked={smsEnabled}
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label for="sms-toggle" class="ml-2 text-lg font-medium text-gray-900 dark:text-white">SMS Notifications</label>
        </div>
        
        <div class="mb-4">
          <label for="phone" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone Number</label>
          <input 
            type="tel" 
            id="phone" 
            bind:value={phoneNumber}
            placeholder="+1234567890" 
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Enter in international format (e.g., +1234567890)</p>
        </div>
        
        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button 
            on:click={saveSmsSettings}
            disabled={!phoneNumber || isTestingSms}
            class="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            Save SMS Settings
          </button>
          
          <button 
            on:click={testSmsNotification}
            disabled={!phoneNumber || isTestingSms}
            class="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isTestingSms ? 'Sending...' : 'Test SMS Notification'}
          </button>
        </div>
        
        {#if smsSaveSuccess}
          <p class="mt-2 text-green-600 dark:text-green-400 text-sm">Settings saved successfully!</p>
        {/if}
        
        {#if testSmsResult}
          <p class="mt-2 text-sm {testSmsResult.includes('Error') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}">
            {testSmsResult}
          </p>
        {/if}
      </div>
      
      <!-- Telegram Notifications -->
      <div class="border dark:border-gray-700 rounded-lg p-4">
        <div class="flex items-center mb-4">
          <input 
            type="checkbox" 
            id="telegram-toggle" 
            bind:checked={telegramEnabled}
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label for="telegram-toggle" class="ml-2 text-lg font-medium text-gray-900 dark:text-white">Telegram Notifications</label>
        </div>
        
        <div class="mb-4">
          <label for="telegram-chat-id" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Telegram Chat ID</label>
          <input 
            type="text" 
            id="telegram-chat-id" 
            bind:value={telegramChatId}
            placeholder="123456789" 
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            To get started with Telegram notifications:
            <span class="block mt-1">1. Start a chat with <a href="https://t.me/shardspace_bot" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">@shardspace_bot</a> on Telegram</span>
            <span class="block">2. Get your Chat ID by chatting with <a href="https://t.me/userinfobot" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">@userinfobot</a></span>
            <span class="block">3. Enter your Chat ID above and save settings</span>
          </p>
        </div>
        
        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button 
            on:click={saveTelegramSettings}
            disabled={!telegramChatId || isTestingTelegram}
            class="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            Save Telegram Settings
          </button>
          
          <button 
            on:click={testTelegramNotification}
            disabled={!telegramChatId || isTestingTelegram}
            class="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isTestingTelegram ? 'Sending...' : 'Test Telegram Notification'}
          </button>
        </div>
        
        {#if telegramSaveSuccess}
          <p class="mt-2 text-green-600 dark:text-green-400 text-sm">Settings saved successfully!</p>
        {/if}
        
        {#if testTelegramResult}
          <p class="mt-2 text-sm {testTelegramResult.includes('Error') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}">
            {testTelegramResult}
          </p>
        {/if}
      </div>
    </div>
  </div>
  
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
    <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">How External Notifications Work</h2>
    
    <div class="space-y-4 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
      <p>
        When a new webhook event is received, you can be notified via email, SMS, and/or Telegram depending on your settings above.
      </p>
      
      <div class="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 p-4 rounded">
        <p class="text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> This is a demonstration implementation. In a production environment, you would use real service providers:
        </p>
        <ul class="list-disc pl-5 mt-2 space-y-1 text-blue-800 dark:text-blue-200">
          <li>Email: SendGrid, Mailgun, Amazon SES</li>
          <li>SMS: Twilio, Vonage (Nexmo)</li>
          <li>Telegram: Official Telegram Bot API</li>
        </ul>
      </div>
      
      <p>
        Notifications include basic information about the webhook event:
      </p>
      
      <ul class="list-disc pl-5 space-y-1">
        <li>HTTP method used (GET, POST, etc.)</li>
        <li>Webhook path</li>
        <li>Timestamp</li>
        <li>Webhook ID</li>
      </ul>
    </div>
  </div>
</div> 