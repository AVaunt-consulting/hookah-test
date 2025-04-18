import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: { 
		adapter: adapter({
			edge: false,
			split: false
		}),
		paths: {
			base: ''
		},
		// Define the production URL
		alias: {
			$lib: './src/lib'
		}
	}
};

export default config;
