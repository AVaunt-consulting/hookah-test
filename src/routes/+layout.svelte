<script lang="ts">
	import '../app.css';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import { onMount } from 'svelte';
	import { fetchWebhookEvents, isPollingEnabled } from '$lib/stores/webhookStore';
	
	let intervalId: number | undefined;
	let mobileMenuOpen = false;
	
	// Toggle mobile menu
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
	
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
		
		// Close mobile menu on resize to desktop
		window.addEventListener('resize', () => {
			if (window.innerWidth >= 768 && mobileMenuOpen) {
				mobileMenuOpen = false;
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
				<h1 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
					<a href="/">Hookah Webhook Tester</a>
				</h1>
				
				<!-- Mobile menu button -->
				<button 
					class="md:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
					on:click={toggleMobileMenu}
					aria-label="Toggle menu"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						{#if mobileMenuOpen}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						{/if}
					</svg>
				</button>
				
				<!-- Desktop navigation -->
				<nav class="hidden md:flex space-x-4">
					<a href="/" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Home</a>
					<a href="/generate" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Generate URL</a>
					<a href="/requests" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Requests</a>
					<a href="/radix-test" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Radix Test</a>
				</nav>
			</div>
			
			<!-- Mobile navigation -->
			{#if mobileMenuOpen}
				<nav class="md:hidden mt-4 py-2 border-t border-gray-200 dark:border-gray-700">
					<div class="flex flex-col space-y-2">
						<a 
							href="/" 
							class="py-2 px-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
							on:click={() => mobileMenuOpen = false}
						>
							Home
						</a>
						<a 
							href="/generate" 
							class="py-2 px-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
							on:click={() => mobileMenuOpen = false}
						>
							Generate URL
						</a>
						<a 
							href="/requests" 
							class="py-2 px-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
							on:click={() => mobileMenuOpen = false}
						>
							Requests
						</a>
						<a 
							href="/radix-test" 
							class="py-2 px-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
							on:click={() => mobileMenuOpen = false}
						>
							Radix Test
						</a>
					</div>
				</nav>
			{/if}
		</div>
	</header>
	
	<main class="container mx-auto px-4 py-6 md:py-8">
		<slot />
	</main>
	
	<!-- Toast notifications will appear on every page -->
	<ToastContainer />
</div>
