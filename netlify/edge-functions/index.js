// Netlify Edge Function to help with routing
export default async (request, context) => {
  const url = new URL(request.url);
  
  // Special handling for the root path
  if (url.pathname === '/' || url.pathname === '') {
    // Redirect to the SvelteKit handler
    return context.rewrite('/.netlify/functions/sveltekit-render');
  }
  
  // Let other routes proceed normally
  return;
}; 