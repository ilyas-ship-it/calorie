import { Asset } from 'expo-asset';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Platform, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import {
  Card,
  Muted,
  PrimaryButton,
  SecondaryButton,
  Screen,
  Subtitle,
  Title,
} from '@/components/ui';
import type { CaptureMode } from '@/src/domain/types';
import { env } from '@/src/config/env';
import {
  DEMO_PHOTO,
  captureMealPhoto,
  isWeb,
  resolveDemoPhotoUri,
} from '@/src/platform/captureMedia';
import { services } from '@/src/services/appServices';

export default function CaptureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const initialMode: CaptureMode = params.mode === 'label' ? 'label' : 'plate';
  const [mode, setMode] = useState<CaptureMode>(initialMode);
  const [uri, setUri] = useState<string | null>(null);
  const [previewSource, setPreviewSource] = useState<
    { uri: string } | number | null
  >(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modeLabel = useMemo(
    () => (mode === 'plate' ? 'Plate vision' : 'Label OCR'),
    [mode],
  );

  async function pick(preferred: 'camera' | 'library') {
    setError(null);

    // On web, camera is unreliable — steer users to file picker first when they tap Camera.
    if (isWeb() && preferred === 'camera') {
      setError(
        'Browser camera is limited. Use Choose file, or Demo photo to run the full flow.',
      );
    }

    const result = await captureMealPhoto(preferred);
    if (!result.ok) {
      if (result.error !== 'Picker canceled.' && result.error !== 'Camera canceled.') {
        setError(result.error);
      }
      return;
    }
    setUri(result.uri);
    setPreviewSource({ uri: result.uri });
  }

  async function useDemoPhoto() {
    setError(null);
    try {
      const asset = Asset.fromModule(DEMO_PHOTO);
      await asset.downloadAsync();
      const demoUri = asset.localUri ?? asset.uri ?? resolveDemoPhotoUri();
      setUri(demoUri);
      setPreviewSource(DEMO_PHOTO);
    } catch {
      const fallback = resolveDemoPhotoUri();
      setUri(fallback);
      setPreviewSource(DEMO_PHOTO);
    }
  }

  async function analyze() {
    if (!uri) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === 'plate') {
        const estimate = await services.vision.estimatePlate(uri);
        router.push({
          pathname: '/review/plate',
          params: {
            photoUri: uri,
            payload: JSON.stringify(estimate),
          },
        });
      } else {
        const parsed = await services.ocr.parseLabel(uri);
        router.push({
          pathname: '/review/label',
          params: {
            photoUri: uri,
            payload: JSON.stringify(parsed),
          },
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title>Capture</Title>
      <Subtitle>
        {modeLabel} stub — UI talks to ports only. Confirm estimates on the next screen.
        {isWeb() || env.webDemo
          ? ' Web/demo: use Choose file or Demo photo.'
          : ''}
      </Subtitle>

      <View style={styles.row}>
        <View style={styles.flex}>
          <PrimaryButton
            label="Plate"
            onPress={() => setMode('plate')}
            disabled={mode === 'plate'}
          />
        </View>
        <View style={styles.flex}>
          <SecondaryButton label="Label" onPress={() => setMode('label')} />
        </View>
      </View>

      <Card>
        <Muted>Photo source{isWeb() ? ' (browser)' : ''}</Muted>
        <View style={styles.row}>
          {!isWeb() && (
            <View style={styles.flex}>
              <PrimaryButton label="Camera" onPress={() => pick('camera')} />
            </View>
          )}
          <View style={styles.flex}>
            <PrimaryButton
              label={isWeb() ? 'Choose file' : 'Gallery'}
              onPress={() => pick('library')}
            />
          </View>
          <View style={styles.flex}>
            <SecondaryButton label="Demo photo" onPress={useDemoPhoto} />
          </View>
        </View>
        {Platform.OS !== 'web' && (
          <Muted>If camera fails, use Gallery or Demo photo — same review flow.</Muted>
        )}
        {previewSource ? (
          <Image source={previewSource} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Muted>No photo yet</Muted>
          </View>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
        {busy ? (
          <ActivityIndicator />
        ) : (
          <PrimaryButton
            label={mode === 'plate' ? 'Estimate plate' : 'Parse label'}
            onPress={analyze}
            disabled={!uri}
          />
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  flex: { flex: 1, minWidth: 110 },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    backgroundColor: '#ddd',
  },
  placeholder: {
    height: 160,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#A8BDB0',
  },
  error: { color: '#B42318' },
});
