<script lang="ts">
	import '../app.css';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import { onMount } from 'svelte';
	import { fetchWebhookEvents, isPollingEnabled } from '$lib/stores/webhookStore';
	
	let intervalId: number | undefined;
	
	onMount(() => {
		// Initial fetch
		fetchWebhookEvents();
		
		// Create function to check if polling should be active
		function updatePolling() {
			if (isPollingEnabled()) {
				// If polling is enabled but no interval, start it
				if (!intervalId) {
					console.log('Layout: Starting global polling');
					intervalId = setInterval(() => {
						if (isPollingEnabled()) {
							fetchWebhookEvents();
						}
					}, 5000);
				}
			} else {
				// If polling is disabled but interval exists, clear it
				if (intervalId) {
					console.log('Layout: Stopping global polling');
					clearInterval(intervalId);
					intervalId = undefined;
				}
			}
		}
		
		// Initial setup
		updatePolling();
		
		// Watch for changes to the pollingEnabled setting in localStorage
		window.addEventListener('storage', (event) => {
			if (event.key === 'pollingEnabled') {
				updatePolling();
			}
		});
		
		// Clear interval on component unmount
		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	});
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
	<header class="bg-white dark:bg-gray-800 shadow">
		<div class="container mx-auto px-4 py-4">
			<div class="flex justify-between items-center">
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
					<a href="/">Hookah Webhook Tester</a>
				</h1>
				<nav class="flex space-x-4">
					<a href="/" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Home</a>
					<a href="/generate" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Generate URL</a>
					<a href="/requests" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Requests</a>
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
