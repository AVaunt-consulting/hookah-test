/**
 * Validates a webhook payload against the expected schema
 * @param payload The webhook payload to validate
 * @returns An object with validation result and any errors
 */
export function validateWebhookPayload(payload: unknown): { 
  valid: boolean; 
  errors?: string[];
} {
  const errors: string[] = [];

  // Type guard to check if payload is an object
  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Payload must be an object'] };
  }
  
  const typedPayload = payload as Record<string, unknown>;
  
  // Check required fields
  if (!typedPayload.eventWatcherId || typeof typedPayload.eventWatcherId !== 'string') {
    errors.push('eventWatcherId is required and must be a string');
  }
  
  if (!typedPayload.transactionId || typeof typedPayload.transactionId !== 'string') {
    errors.push('transactionId is required and must be a string');
  }
  
  if (!typedPayload.events || !Array.isArray(typedPayload.events)) {
    errors.push('events is required and must be an array');
  } else {
    // Validate each event in the array
    (typedPayload.events as unknown[]).forEach((event, index) => {
      if (!event || typeof event !== 'object') {
        errors.push(`events[${index}] must be an object`);
        return;
      }
      
      const typedEvent = event as Record<string, unknown>;
      
      // Check event data
      if (!typedEvent.data || typeof typedEvent.data !== 'object') {
        errors.push(`events[${index}].data is required and must be an object`);
      }
      
      // Check emitter structure
      if (!typedEvent.emitter || typeof typedEvent.emitter !== 'object') {
        errors.push(`events[${index}].emitter is required and must be an object`);
      } else {
        const emitter = typedEvent.emitter as Record<string, unknown>;
        if (!emitter.globalEmitter || typeof emitter.globalEmitter !== 'string') {
          errors.push(`events[${index}].emitter.globalEmitter is required and must be a string`);
        }
        if (!emitter.methodEmitter || typeof emitter.methodEmitter !== 'string') {
          errors.push(`events[${index}].emitter.methodEmitter is required and must be a string`);
        }
        if (!emitter.outerEmitter || typeof emitter.outerEmitter !== 'string') {
          errors.push(`events[${index}].emitter.outerEmitter is required and must be a string`);
        }
      }
      
      // Check event name
      if (!typedEvent.eventName || typeof typedEvent.eventName !== 'string') {
        errors.push(`events[${index}].eventName is required and must be a string`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
} 