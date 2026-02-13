import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const CUSTOM_ICONS_DIR = FileSystem.documentDirectory + 'custom_icons/';

/**
 * Ensures the custom icons directory exists.
 */
const ensureDirExists = async () => {
  if (Platform.OS === 'web') return;
  const dirInfo = await FileSystem.getInfoAsync(CUSTOM_ICONS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CUSTOM_ICONS_DIR, { intermediates: true });
  }
};

/**
 * Saves an image from a temporary URI to the permanent storage.
 * @param tempUri The temporary URI of the image (e.g., from ImagePicker).
 * @returns The new permanent URI of the saved image.
 */
export const saveCustomIcon = async (tempUri: string): Promise<string> => {
  if (Platform.OS === 'web') {
    // On web, we can't save to file system easily.
    // For now, we return the data URI or blob URL as is.
    // Note: Blob URLs might expire. Converting to Base64 is safer for persistence in localStorage.
    return tempUri;
  }

  try {
    await ensureDirExists();
    const fileName = tempUri.split('/').pop() || `icon_${Date.now()}.jpg`;
    const newPath = CUSTOM_ICONS_DIR + fileName;
    await FileSystem.copyAsync({
      from: tempUri,
      to: newPath
    });
    return newPath;
  } catch (error) {
    console.error('Error saving custom icon:', error);
    throw error;
  }
};
