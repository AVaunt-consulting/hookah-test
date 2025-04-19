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
}

// Local storage key for notification settings
const STORAGE_KEY = 'notificationSettings';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Initialize with default settings or load from localStorage
function getInitialSettings(): NotificationSettings {
  if (!isBrowser) {
    return {
      enabled: false,
      email: { enabled: false, address: '' },
      sms: { enabled: false, phoneNumber: '' }
    };
  }
  
  try {
    const storedSettings = localStorage.getItem(STORAGE_KEY);
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }
  } catch (error) {
    console.error('Error loading notification settings from localStorage:', error);
  }
  
  return {
    enabled: false,
    email: { enabled: false, address: '' },
    sms: { enabled: false, phoneNumber: '' }
  };
}

// Create the writable store
export const notificationSettings = writable<NotificationSettings>(getInitialSettings());

// Save settings to localStorage when they change
notificationSettings.subscribe(settings => {
  if (isBrowser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
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

// Helper function to toggle all notifications
export function toggleNotifications(enabled: boolean) {
  notificationSettings.update(current => ({
    ...current,
    enabled
  }));
} 