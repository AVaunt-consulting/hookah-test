/**
 * Radix API Utilities
 * 
 * This file provides functions to interact with the Radix Gateway API
 * to retrieve resource information like names and icons.
 */

// Radix Gateway URLs
const RADIX_MAINNET_GATEWAY_URL = 'https://mainnet.radixdlt.com';

// Define types for API responses
interface MetadataItem {
  key: string;
  value: string;
}

interface EntityMetadata {
  items: MetadataItem[];
}

interface EntityDetails {
  address: string;
  metadata?: EntityMetadata;
}

interface EntityResponse {
  items: EntityDetails[];
}

interface ResourceMetadata {
  name: string;
  iconUrl: string | null;
}

/**
 * Fetch resource details from the Radix Gateway API
 * 
 * @param resourceAddress The Radix resource address to look up
 * @returns Information about the resource including name and icon if available
 */
export async function fetchResourceDetails(resourceAddress: string): Promise<EntityResponse | null> {
  try {
    console.log(`RADIX API: Fetching details for ${resourceAddress}`);
    
    const response = await fetch(`${RADIX_MAINNET_GATEWAY_URL}/state/entity/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        addresses: [resourceAddress],
        aggregation_level: "global"
      })
    });

    if (!response.ok) {
      throw new Error(`Gateway API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Log the full response
    console.log('RADIX API: Full response for resource', resourceAddress);
    console.log(JSON.stringify(data, null, 2));
    
    return data as EntityResponse;
  } catch (error) {
    console.error('Error fetching resource details:', error);
    return null;
  }
}

/**
 * Extract resource metadata from the API response
 * 
 * @param apiResponse The response from the Radix Gateway API
 * @returns An object containing the resource name and icon URL
 */
export function extractResourceMetadata(apiResponse: EntityResponse | null): ResourceMetadata {
  try {
    if (!apiResponse || !apiResponse.items || apiResponse.items.length === 0) {
      console.log('RADIX API: No items found in API response');
      return { name: 'Unknown Resource', iconUrl: null };
    }

    const item = apiResponse.items[0];
    console.log('RADIX API: Processing item with address:', item.address);
    
    // Check if metadata exists
    if (!item.metadata?.items) {
      console.log('RADIX API: No metadata items found for resource');
      return { name: 'Unknown Resource', iconUrl: null };
    }
    
    // Log all metadata items for debugging
    console.log('RADIX API: All metadata items:');
    item.metadata.items.forEach(meta => {
      console.log(`- ${meta.key}: ${meta.value}`);
    });
    
    // Extract resource name
    let name = 'Unknown Resource';
    const nameMetadata = item.metadata.items.find((meta: MetadataItem) => 
      meta.key === 'name' || meta.key === 'symbol'
    );
    if (nameMetadata) {
      name = nameMetadata.value;
      console.log('RADIX API: Found name:', name);
    } else {
      console.log('RADIX API: No name or symbol found in metadata');
    }
    
    // Extract icon URL
    let iconUrl = null;
    const iconMetadata = item.metadata.items.find((meta: MetadataItem) => 
      meta.key === 'icon_url' || meta.key === 'icon'
    );
    if (iconMetadata) {
      iconUrl = iconMetadata.value;
      console.log('RADIX API: Found icon URL:', iconUrl);
    } else {
      console.log('RADIX API: No icon URL found in metadata');
    }
    
    console.log('RADIX API: Final resource metadata:', { name, iconUrl });
    return { name, iconUrl };
  } catch (error) {
    console.error('Error extracting resource metadata:', error);
    return { name: 'Unknown Resource', iconUrl: null };
  }
} 