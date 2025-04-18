# Webhook Tester

A simple webhook testing application built with SvelteKit, Svelte 5, TypeScript, and Tailwind CSS. This tool allows you to generate unique webhook URLs and test your webhook integrations by displaying incoming requests in real-time.

## Features

- Generate unique webhook testing URLs
- View incoming webhook requests in real-time
- Inspect headers, query parameters, and body payloads
- Filter requests by ID
- Support for multiple HTTP methods (GET, POST, PUT, DELETE, etc.)
- Dark mode support

## Local Development

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm run dev

# Build for production
pnpm run build

# Preview the production build
pnpm run preview
```

## Deploying to Netlify

This project is configured for easy deployment to Netlify.

### Automatic Deployment (recommended)

1. Fork or clone this repository to your GitHub account
2. Log in to Netlify and click "New site from Git"
3. Select your GitHub repository
4. Leave the default settings (build command: `pnpm run build`, publish directory: `.netlify/server`)
5. Click "Deploy site"

### Manual Deployment

1. Install the Netlify CLI: `npm install -g netlify-cli`
2. Build your site: `pnpm run build`
3. Deploy to Netlify: `netlify deploy --prod`

## How It Works

This webhook tester provides you with unique URLs that you can use as endpoints for your webhook integrations. When a webhook request is sent to one of these URLs, the application captures and displays the request details in a user-friendly interface.

The application stores webhook events in memory, which means they will be cleared when the application restarts. For production use, you might want to implement persistent storage.

## License

MIT
