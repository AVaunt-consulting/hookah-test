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
      return { name: 'Unknown Resource', iconUrl: null };
    }

    const item = apiResponse.items[0];
    
    // Extract resource name
    let name = 'Unknown Resource';
    if (item.metadata?.items) {
      const nameMetadata = item.metadata.items.find((meta: MetadataItem) => 
        meta.key === 'name' || meta.key === 'symbol'
      );
      if (nameMetadata) {
        name = nameMetadata.value;
      }
    }
    
    // Extract icon URL
    let iconUrl = null;
    if (item.metadata?.items) {
      const iconMetadata = item.metadata.items.find((meta: MetadataItem) => 
        meta.key === 'icon_url' || meta.key === 'icon'
      );
      if (iconMetadata) {
        iconUrl = iconMetadata.value;
      }
    }
    
    return { name, iconUrl };
  } catch (error) {
    console.error('Error extracting resource metadata:', error);
    return { name: 'Unknown Resource', iconUrl: null };
  }
} 