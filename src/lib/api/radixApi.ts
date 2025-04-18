/**
 * Radix API Utilities
 * 
 * This file provides functions to interact with the Radix Gateway API
 * to retrieve resource information like names and icons.
 */

// Radix Gateway URLs
const RADIX_MAINNET_GATEWAY_URL = 'https://mainnet.radixdlt.com';

// Define types for API responses
interface MetadataValue {
  typed: {
    value: string;
    type: string;
  };
}

interface MetadataItem {
  key: string;
  value: MetadataValue;
}

interface EntityResponse {
  items: MetadataItem[];
  address: string;
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
    const response = await fetch(`${RADIX_MAINNET_GATEWAY_URL}/state/entity/page/metadata`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address: resourceAddress
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

    // Extract resource name - prioritize symbol over name
    let name = 'Unknown Resource';
    const symbolItem = apiResponse.items.find(item => item.key === 'symbol');
    if (symbolItem?.value?.typed?.value) {
      name = symbolItem.value.typed.value;
    } else {
      // Try finding name as fallback
      const nameItem = apiResponse.items.find(item => item.key === 'name');
      if (nameItem?.value?.typed?.value) {
        name = nameItem.value.typed.value;
      }
    }
    
    // Extract icon URL
    let iconUrl = null;
    const iconItem = apiResponse.items.find(item => item.key === 'icon_url');
    if (iconItem?.value?.typed?.value) {
      iconUrl = iconItem.value.typed.value;
    }
    
    return { name, iconUrl };
  } catch (error) {
    console.error('Error extracting resource metadata:', error);
    return { name: 'Unknown Resource', iconUrl: null };
  }
} 