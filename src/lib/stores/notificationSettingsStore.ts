import { writable } from 'svelte/store';

// Define notification settings interface
export interface NotificationSettings {
  enabled: boolean;
  email: {
    enabled: boolean;
    address: string;
  };
  sms: {
    enabled: boolean;
    phoneNumber: string;
  };
  telegram: {
    enabled: boolean;
    chatId: string;
  };
}

// Local storage key for notification settings
const STORAGE_KEY = 'notificationSettings';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Initialize with default settings or load from localStorage
function getInitialSettings(): NotificationSettings {
  const defaultSettings = {
    enabled: false,
    email: { enabled: false, address: '' },
    sms: { enabled: false, phoneNumber: '' },
    telegram: { enabled: false, chatId: '' }
  };
  
  if (!isBrowser) {
    return defaultSettings;
  }
  
  try {
    const storedSettings = localStorage.getItem(STORAGE_KEY);
    if (storedSettings) {
      // Parse the stored settings
      const parsedSettings = JSON.parse(storedSettings);
      
      // Ensure the settings have all required properties
      // Handle migration for users who had settings before Telegram was added
      return {
        enabled: parsedSettings.enabled ?? defaultSettings.enabled,
        email: {
          enabled: parsedSettings.email?.enabled ?? defaultSettings.email.enabled,
          address: parsedSettings.email?.address ?? defaultSettings.email.address
        },
        sms: {
          enabled: parsedSettings.sms?.enabled ?? defaultSettings.sms.enabled,
          phoneNumber: parsedSettings.sms?.phoneNumber ?? defaultSettings.sms.phoneNumber
        },
        telegram: {
          enabled: parsedSettings.telegram?.enabled ?? defaultSettings.telegram.enabled,
          chatId: parsedSettings.telegram?.chatId ?? defaultSettings.telegram.chatId
        }
      };
    }
  } catch (error) {
    console.error('Error loading notification settings from localStorage:', error);
  }
  
  return defaultSettings;
}

// Create the writable store
export const notificationSettings = writable<NotificationSettings>(getInitialSettings());

// Save settings to localStorage when they change
notificationSettings.subscribe(settings => {
  if (isBrowser) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings to localStorage:', error);
    }
  }
});

// Helper function to update notification settings
export function updateNotificationSettings(newSettings: Partial<NotificationSettings>) {
  notificationSettings.update(current => ({
    ...current,
    ...newSettings
  }));
}

// Helper function to update email settings
export function updateEmailSettings(address: string, enabled: boolean) {
  notificationSettings.update(current => ({
    ...current,
    email: {
      address,
      enabled
    }
  }));
}

// Helper function to update SMS settings
export function updateSmsSettings(phoneNumber: string, enabled: boolean) {
  notificationSettings.update(current => ({
    ...current,
    sms: {
      phoneNumber,
      enabled
    }
  }));
}

// Helper function to update Telegram settings
export function updateTelegramSettings(chatId: string, enabled: boolean) {
  notificationSettings.update(current => ({
    ...current,
    telegram: {
      chatId,
      enabled
    }
  }));
}

// Helper function to toggle all notifications
export function toggleNotifications(enabled: boolean) {
  notificationSettings.update(current => ({
    ...current,
    enabled
  }));
} 