import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { fetchResourceDetails, extractResourceMetadata } from '$lib/api/radixApi';

// Note: In a production environment, you would implement a real Telegram bot
// You need to create a bot via BotFather and get an API token
// For this demo, we'll just log the messages that would be sent

// Telegram Bot Configuration
// Bot name: @shardspace_bot
// Created via BotFather (https://t.me/botfather)
// Users must first start a chat with this bot before they can receive messages
const TELEGRAM_BOT_TOKEN = '7512843852:AAETKyz_AYSq-2Tib8tJtVw318SDpvEL9XI';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

interface TelegramPayload {
  chatId: string;
  message: string;
}

// Helper function to extract resource address from message
function extractResourceAddress(message: string): string | null {
  const resourceMatch = message.match(/Resource: (resource_[a-zA-Z0-9]+)/);
  return resourceMatch ? resourceMatch[1] : null;
}

// Helper function to extract account address from message
function extractAccountAddress(message: string): string | null {
  const accountMatch = message.match(/Account: (account_[a-zA-Z0-9]+\.\.\.)/);
  if (accountMatch) {
    // Extract the full address from the truncated form to get the original account
    const truncatedAccount = accountMatch[1];
    // Extract first part (before ellipsis)
    const firstPart = truncatedAccount.substring(0, truncatedAccount.indexOf('...'));
    if (firstPart.startsWith('account_')) {
      return firstPart;
    }
  }
  return null;
}

// Helper function to enhance message with resource metadata
async function enhanceMessageWithResourceMetadata(message: string): Promise<string> {
  let enhancedMessage = message;
  
  // Extract resource address if present
  const resourceAddress = extractResourceAddress(message);
  
  if (resourceAddress) {
    try {
      // Fetch resource details from Radix API
      const resourceDetails = await fetchResourceDetails(resourceAddress);
      
      if (resourceDetails) {
        // Extract resource name and symbol
        const metadata = extractResourceMetadata(resourceDetails);
        
        if (metadata.name !== 'Unknown Resource') {
          // Replace the plain resource address with name and symbol
          let resourceInfo = `${metadata.name}`;
          
          // Use symbol if it's different from name (some tokens use the same value for both)
          if (metadata.name.toUpperCase() !== metadata.name) {
            resourceInfo = `${metadata.name} (${metadata.name.toUpperCase()})`;
          }
          
          // Replace the resource address line with enhanced information
          enhancedMessage = enhancedMessage.replace(
            new RegExp(`Resource: ${resourceAddress}`), 
            `Resource: ${resourceInfo} [${resourceAddress.substring(0, 10)}...${resourceAddress.substring(resourceAddress.length - 6)}]`
          );
        }
      }
    } catch (error) {
      console.error('Error enhancing message with resource metadata:', error);
    }
  }
  
  // Extract and format the account address if present
  const accountAddress = extractAccountAddress(message);
  if (accountAddress) {
    try {
      // Format account address more nicely (may add account metadata here in future)
      enhancedMessage = enhancedMessage.replace(
        /Account: account_[a-zA-Z0-9]+\.\.\.[a-zA-Z0-9]+/,
        `Account: ${accountAddress.substring(0, 11)}...${accountAddress.substring(accountAddress.length - 5)}`
      );
    } catch (error) {
      console.error('Error enhancing account address:', error);
    }
  }
  
  return enhancedMessage;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const payload = await request.json() as TelegramPayload;
    
    // Validate payload
    if (!payload.chatId || !payload.message) {
      return json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    // Basic validation of chat ID format
    // Chat IDs are usually numeric values, can be positive or negative
    if (!/^-?\d+$/.test(payload.chatId)) {
      return json({ success: false, error: 'Invalid Telegram chat ID format' }, { status: 400 });
    }
    
    try {
      // Enhance message with resource metadata
      const enhancedMessage = await enhanceMessageWithResourceMetadata(payload.message);
      
      // Send message using Telegram Bot API
      const response = await fetch(TELEGRAM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: payload.chatId,
          text: enhancedMessage,
          parse_mode: 'HTML'
        }),
      });
      
      const result = await response.json();
      
      if (!result.ok) {
        console.error('Telegram API error:', result);
        
        // Handle common Telegram errors
        if (result.error_code === 403) {
          return json({
            success: false,
            error: 'Bot cannot send messages to this chat. Please make sure you have started a chat with @shardspace_bot first.'
          }, { status: 403 });
        }
        
        if (result.error_code === 400 && result.description?.includes('chat not found')) {
          return json({
            success: false,
            error: 'Chat ID not found. Please verify your Chat ID is correct and that you have started a chat with @shardspace_bot.'
          }, { status: 400 });
        }
        
        throw new Error(result.description || 'Failed to send Telegram message');
      }
      
      // Log successful message
      console.log('Telegram message sent successfully to chat ID:', payload.chatId);
      
      // Return success response with Telegram API result
      return json({ 
        success: true, 
        message: 'Telegram notification sent successfully',
        chatId: payload.chatId,
        telegramResponse: result
      });
    } catch (telegramError) {
      console.error('Telegram API error:', telegramError);
      return json(
        { 
          success: false, 
          error: telegramError instanceof Error ? telegramError.message : 'Failed to send Telegram message'
        }, 
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error processing Telegram notification:', error);
    return json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}; 