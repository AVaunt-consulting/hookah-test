import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: { 
		adapter: adapter({
			// if true, will create a Netlify Edge Function rather than using standard Node-based functions
			edge: false,
			split: false // Make sure all routes are bundled in the same function
		}),
		files: {
			assets: 'static'
		}
	}
};

export default config;
