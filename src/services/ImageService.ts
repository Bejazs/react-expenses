import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

let customIconsDir: FileSystem.Directory | null = null;

if (Platform.OS !== 'web') {
  try {
    const { Directory, Paths } = FileSystem;
    customIconsDir = new Directory(Paths.document, 'custom_icons/');
  } catch (e) {
    console.warn('Failed to initialize FileSystem for images:', e);
  }
}

/**
 * Ensures the custom icons directory exists.
 */
const ensureDirExists = async () => {
  if (Platform.OS === 'web' || !customIconsDir) return;
  if (!customIconsDir.exists) {
    customIconsDir.create();
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
    // Converting Blob URLs to Base64 ensures they do not expire and can be safely persisted in localStorage.
    try {
      const response = await fetch(tempUri);
      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting Blob to Base64:', error);
      return tempUri; // Fallback to original URI if conversion fails
    }
  }

  try {
    await ensureDirExists();
    const fileName = tempUri.split('/').pop() || `icon_${Date.now()}.jpg`;
    const sourceFile = new FileSystem.File(tempUri);
    const destFile = new FileSystem.File(customIconsDir!, fileName);
    sourceFile.copy(destFile);
    return destFile.uri;
  } catch (error) {
    console.error('Error saving custom icon:', error);
    throw error;
  }
};
