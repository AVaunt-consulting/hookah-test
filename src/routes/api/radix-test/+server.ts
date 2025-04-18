import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchResourceDetails, extractResourceMetadata } from '$lib/api/radixApi';

/**
 * GET handler to test the Radix API for a specific resource
 * Example: /api/radix-test?address=resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd
 */
export const GET: RequestHandler = async ({ url }) => {
  const resourceAddress = url.searchParams.get('address');
  
  if (!resourceAddress) {
    return json({ 
      error: 'Missing resource address. Please provide it as a query parameter, e.g., ?address=resource_rdx...' 
    }, { status: 400 });
  }
  
  try {
    console.log(`RADIX TEST API: Testing resource ${resourceAddress}`);
    
    // Fetch resource details
    const resourceDetails = await fetchResourceDetails(resourceAddress);
    
    // Extract metadata
    const metadata = extractResourceMetadata(resourceDetails);
    
    // Return all data for debugging
    return json({
      success: true,
      resourceAddress,
      metadata,
      fullResponse: resourceDetails
    });
  } catch (error) {
    console.error('Error in Radix test API:', error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      resourceAddress 
    }, { status: 500 });
  }
}; 