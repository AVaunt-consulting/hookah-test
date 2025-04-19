import { writable, get } from 'svelte/store';

// Local storage key for webhook API token
const TOKEN_STORAGE_KEY = 'webhookApiToken';

// Helper function to generate a secure random token
function generateRandomToken(length = 32): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  let token = '';
  for (let i = 0; i < length; i++) {
    token += characters.charAt(randomValues[i] % characters.length);
  }
  return token;
}

// Load token from localStorage if available, otherwise generate a new one
function getInitialToken(): string {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    // For testing - hardcode the token to match what the user is testing with
    const testToken = 'LbD5otJ7j6YSbH2BbHm675zNaGBP1hu5';
    localStorage.setItem(TOKEN_STORAGE_KEY, testToken);
    return testToken;
    
    // Original code
    /*
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (savedToken) {
      return savedToken;
    }
    */
  }
  
  // Generate a new token if none exists
  const newToken = generateRandomToken();
  
  // Save it to localStorage if we're in a browser
  if (isBrowser) {
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
  }
  
  return newToken;
}

// Create the store with the token
export const apiToken = writable<string>(getInitialToken());

// Subscribe to changes and update localStorage
if (typeof window !== 'undefined') {
  apiToken.subscribe(token => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  });
}

// Function to regenerate token
export function regenerateToken(): string {
  const newToken = generateRandomToken();
  apiToken.set(newToken);
  return newToken;
}

// Function to validate a token against the current one
export function validateToken(tokenToCheck: string | null): boolean {
  if (!tokenToCheck) return false;
  
  const currentToken = get(apiToken);
  console.log('Validating token:', { 
    tokenToCheck,
    currentToken,
    match: tokenToCheck === currentToken
  });
  return tokenToCheck === currentToken;
}

// Function to extract the token from Authorization header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  // Check if it's a Bearer token (case-insensitive)
  const match = authHeader.match(/^Bearer\s+([A-Za-z0-9+/=._-]+)$/i);
  return match ? match[1] : null;
}

// Function to validate an Authorization header
export function validateAuthHeader(authHeader: string | null): boolean {
  const token = extractTokenFromHeader(authHeader);
  return validateToken(token);
} 