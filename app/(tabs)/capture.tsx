import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

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
import { services } from '@/src/services/appServices';

export default function CaptureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const initialMode: CaptureMode = params.mode === 'label' ? 'label' : 'plate';
  const [mode, setMode] = useState<CaptureMode>(initialMode);
  const [uri, setUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modeLabel = useMemo(
    () => (mode === 'plate' ? 'Plate vision' : 'Label OCR'),
    [mode],
  );

  async function pick(fromCamera: boolean) {
    setError(null);
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Permission is required to capture or pick a photo.');
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.7,
        });

    if (!result.canceled && result.assets[0]?.uri) {
      setUri(result.assets[0].uri);
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
        <Muted>Photo source</Muted>
        <View style={styles.row}>
          <View style={styles.flex}>
            <PrimaryButton label="Camera" onPress={() => pick(true)} />
          </View>
          <View style={styles.flex}>
            <SecondaryButton label="Gallery" onPress={() => pick(false)} />
          </View>
        </View>
        {uri ? (
          <Image source={{ uri }} style={styles.preview} />
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
  row: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
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
