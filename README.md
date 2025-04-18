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

This project is configured for easy deployment to Netlify. The application uses the Netlify adapter for SvelteKit, which ensures your webhook endpoints will work correctly in a serverless environment.

### Automatic Deployment (recommended)

1. Fork or clone this repository to your GitHub account
2. Log in to Netlify and click "New site from Git"
3. Select your GitHub repository
4. Configure the following build settings:
   - Build command: `pnpm run build`
   - Publish directory: `.netlify/server`
5. Add the following environment variables (if needed):
   - `NODE_VERSION`: `18.0.0` (or your preferred Node.js version)
6. Click "Deploy site"

### Manual Deployment

1. Install the Netlify CLI: `npm install -g netlify-cli`
2. Build your site: `pnpm run build`
3. Login to Netlify: `netlify login`
4. Initialize your site: `netlify init`
5. Deploy to Netlify: `netlify deploy --prod`

### Important Notes for Deployment

- Webhook data is stored in memory and will be cleared when the serverless function is recycled
- For a production application, you would want to implement a database for persistent storage
- The Netlify free tier has function execution limits that might affect high-volume usage

## How It Works

This webhook tester provides you with unique URLs that you can use as endpoints for your webhook integrations. When a webhook request is sent to one of these URLs, the application captures and displays the request details in a user-friendly interface.

In the serverless environment:
1. Your webhook request is received by a Netlify serverless function
2. The request details are captured and stored
3. The web app retrieves and displays these details in real-time using polling

## License

MIT
