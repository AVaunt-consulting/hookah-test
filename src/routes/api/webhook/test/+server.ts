import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * This is a diagnostic endpoint that will analyze the webhook payload structure
 * and return information about how the message is processed
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return json({
        success: false,
        error: 'Content-Type must be application/json'
      }, { status: 400 });
    }
    
    const body = await request.json();
    
    // Extract and analyze the message structure
    const messageAnalysis = analyzeMessageStructure(body);
    
    return json({
      success: true,
      messageAnalysis
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};

interface MessageAnalysisResult {
  hasMessage: boolean;
  messageType: string | null;
  hasContent: boolean;
  contentType: string | null;
  hasValue: boolean;
  value: string | number | boolean | null;
  extractionPath: string | null;
  messageObject: Record<string, unknown> | null;
}

/**
 * Analyze the message structure in the webhook payload
 */
function analyzeMessageStructure(payload: Record<string, unknown>): MessageAnalysisResult {
  const result: MessageAnalysisResult = {
    hasMessage: false,
    messageType: null,
    hasContent: false,
    contentType: null,
    hasValue: false,
    value: null,
    extractionPath: null,
    messageObject: null,
  };
  
  // Check if there's a message property
  if (payload && typeof payload === 'object' && 'message' in payload) {
    result.hasMessage = true;
    
    const message = payload.message;
    
    if (message && typeof message === 'object') {
      result.messageObject = message as Record<string, unknown>;
      
      // Check if message is an object with a type property
      if ('type' in message) {
        const typeValue = (message as Record<string, unknown>).type;
        result.messageType = typeof typeValue === 'string' ? typeValue : String(typeValue);
      } else {
        result.messageType = typeof message;
      }
      
      // Check if there's a content property
      if ('content' in message) {
        result.hasContent = true;
        const content = (message as Record<string, unknown>).content;
        
        // Check content type
        if (content && typeof content === 'object') {
          if ('type' in (content as Record<string, unknown>)) {
            const contentTypeValue = (content as Record<string, unknown>).type;
            result.contentType = typeof contentTypeValue === 'string' ? contentTypeValue : String(contentTypeValue);
          }
          
          // Check if there's a value property in content
          if ('value' in (content as Record<string, unknown>)) {
            result.hasValue = true;
            result.value = (content as Record<string, unknown>).value as string | number | boolean | null;
            result.extractionPath = 'message.content.value';
          }
        }
      }
      
      // Check if there's a direct value property
      if (!result.hasValue && 'value' in message) {
        result.hasValue = true;
        result.value = (message as Record<string, unknown>).value as string | number | boolean | null;
        result.extractionPath = 'message.value';
      }
    } else if (typeof message === 'string') {
      // If message is a direct string
      result.messageType = 'string';
      result.hasValue = true;
      result.value = message;
      result.extractionPath = 'message (direct string)';
    }
  }
  
  return result;
} 