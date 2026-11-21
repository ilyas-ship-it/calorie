import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export type CaptureSource = 'camera' | 'library' | 'demo';

export type CaptureResult =
  | { ok: true; uri: string; source: CaptureSource }
  | { ok: false; error: string; recoverable: boolean };

/** Bundled demo asset so the confirm-before-log loop works without a camera. */
export const DEMO_PHOTO = require('../../assets/images/demo-meal.png');

export function isWeb(): boolean {
  return Platform.OS === 'web';
}

/**
 * Pick or mock a meal photo. On web, camera often fails or is unavailable —
 * fall back to file picker guidance or a demo asset so the MVP flow still works.
 */
export async function captureMealPhoto(
  preferred: 'camera' | 'library',
): Promise<CaptureResult> {
  if (preferred === 'library' || isWeb()) {
    try {
      if (!isWeb()) {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          return {
            ok: false,
            error: 'Photo library permission is required. You can still use a demo photo.',
            recoverable: true,
          };
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        // Web: opens the browser file picker.
        allowsEditing: false,
      });

      if (result.canceled) {
        return { ok: false, error: 'Picker canceled.', recoverable: true };
      }
      const uri = result.assets[0]?.uri;
      if (!uri) {
        return { ok: false, error: 'No image selected.', recoverable: true };
      }
      return { ok: true, uri, source: 'library' };
    } catch (e) {
      return {
        ok: false,
        error:
          e instanceof Error
            ? e.message
            : 'Could not open the file picker. Use a demo photo instead.',
        recoverable: true,
      };
    }
  }

  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return {
        ok: false,
        error: 'Camera permission denied. Try Gallery or Demo photo.',
        recoverable: true,
      };
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (result.canceled) {
      return { ok: false, error: 'Camera canceled.', recoverable: true };
    }
    const uri = result.assets[0]?.uri;
    if (!uri) {
      return { ok: false, error: 'No photo captured.', recoverable: true };
    }
    return { ok: true, uri, source: 'camera' };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? `${e.message} — try Gallery or Demo photo.`
          : 'Camera unavailable. Try Gallery or Demo photo.',
      recoverable: true,
    };
  }
}

/** Resolve the bundled demo image to a URI usable by Image + stub adapters. */
export function resolveDemoPhotoUri(): string {
  const asset = DEMO_PHOTO as number | { uri: string };
  if (typeof asset === 'number') {
    // Metro asset module id — Image accepts { uri } from Asset, but stubs only need a string.
    return `demo://meal/${asset}`;
  }
  if (asset && typeof asset === 'object' && 'uri' in asset && asset.uri) {
    return asset.uri;
  }
  return 'demo://meal/placeholder';
}
