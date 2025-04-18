<script lang="ts">
	import '../app.css';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import { onMount } from 'svelte';
	import { fetchWebhookEvents } from '$lib/stores/webhookStore';
	
	// Set up a polling interval to check for new webhook events
	onMount(() => {
		// Initial fetch
		fetchWebhookEvents();
		
		// Set up polling every 5 seconds
		const interval = setInterval(() => {
			fetchWebhookEvents();
		}, 5000);
		
		// Clear interval on component unmount
		return () => {
			clearInterval(interval);
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
