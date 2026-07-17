import * as SecureStore from 'expo-secure-store';

/**
 * Encrypt and save a string value securely.
 */
export const saveSecurely = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
    return true;
  } catch (error) {
    console.error(`SecureStore Error saving key ${key}:`, error);
    return false;
  }
};

/**
 * Retrieve an encrypted string value.
 */
export const getSecurely = async (key) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`SecureStore Error getting key ${key}:`, error);
    return null;
  }
};

/**
 * Remove a securely stored key.
 */
export const deleteSecurely = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (error) {
    console.error(`SecureStore Error deleting key ${key}:`, error);
    return false;
  }
};
