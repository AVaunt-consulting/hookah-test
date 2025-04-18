<script lang="ts">
	import '../app.css';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import { onMount } from 'svelte';
	import { fetchWebhookEvents } from '$lib/stores/webhookStore';
	
	// Create a test notification function
	function createTestNotification() {
		console.log('Creating test notification from keyboard shortcut');
		
		// Create an element to hold our test notification
		const container = document.createElement('div');
		container.className = 'fixed top-4 right-4 z-50 w-full max-w-md';
		
		// Set a unique ID to manage dismissal
		const id = 'test-notification-' + Date.now();
		container.id = id;
		
		// Add the notification content
		container.innerHTML = `
			<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-l-4 border-green-500">
				<div class="p-4">
					<div class="flex items-start">
						<div class="flex-shrink-0">
							<svg class="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<div class="ml-3 flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900 dark:text-white truncate">
								Test Event <span class="text-gray-500 dark:text-gray-400 text-xs">(test)</span>
							</p>
							<div class="mt-2 flex flex-col gap-2">
								<div class="text-sm text-gray-600 dark:text-gray-300">
									<span class="font-medium">Amount:</span> 10
								</div>
								<div class="text-sm text-gray-600 dark:text-gray-300 break-words max-h-24 overflow-y-auto">
									<span class="font-medium">Message:</span> 
									<span class="inline-block max-w-full">Test message from ShardSpace</span>
								</div>
								<div class="flex justify-end">
									<span class="inline-flex rounded-md text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
										Test
									</span>
								</div>
							</div>
						</div>
						<div class="ml-4 flex-shrink-0 flex">
							<button 
								class="bg-white dark:bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
								onclick="document.getElementById('${id}').remove()"
							>
								<span class="sr-only">Close</span>
								<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
									<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>
		`;
		
		// Add to the document
		document.body.appendChild(container);
		
		// Auto-remove after 10 seconds
		setTimeout(() => {
			const el = document.getElementById(id);
			if (el) el.remove();
		}, 10000);
	}
	
	// Set up keyboard shortcut listener for testing
	function keyboardShortcutHandler(event: KeyboardEvent) {
		// Ctrl+Alt+T to trigger test notification
		if (event.ctrlKey && event.altKey && event.key === 't') {
			createTestNotification();
		}
	}
	
	onMount(() => {
		// Initial fetch
		fetchWebhookEvents();
		
		// Set up polling every 5 seconds
		const interval = setInterval(() => {
			fetchWebhookEvents();
		}, 5000);
		
		// Add keyboard shortcut listener
		window.addEventListener('keydown', keyboardShortcutHandler);
		
		// Clear interval on component unmount
		return () => {
			clearInterval(interval);
			window.removeEventListener('keydown', keyboardShortcutHandler);
		};
	});
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
	<header class="bg-white dark:bg-gray-800 shadow">
		<div class="container mx-auto px-4 py-4">
			<div class="flex justify-between items-center">
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
					<a href="/">Webhook Tester</a>
				</h1>
				<nav class="flex space-x-4">
					<a href="/" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Home</a>
					<a href="/generate" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Generate URL</a>
					<a href="/requests" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Requests</a>
					<button 
						on:click={createTestNotification}
						class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
					>
						Test Notification
					</button>
				</nav>
			</div>
		</div>
	</header>
	
	<main class="container mx-auto px-4 py-8">
		<slot />
	</main>
	
	<!-- Toast notifications will appear on every page -->
	<ToastContainer />
</div>
