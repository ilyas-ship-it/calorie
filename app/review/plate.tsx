import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import {
  Card,
  Field,
  FlagChip,
  Muted,
  PrimaryButton,
  Screen,
  Subtitle,
  Title,
} from '@/components/ui';
import { newId, roundMacros, totalsFromItems } from '@/src/domain/macros';
import type { MealEntry, PlateEstimateResult, PortionEstimate } from '@/src/domain/types';
import { checkFlags } from '@/src/flags/checkFlags';
import { services } from '@/src/services/appServices';

export default function PlateReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ photoUri?: string; payload?: string }>();
  const initial = useMemo(() => {
    try {
      return JSON.parse(String(params.payload ?? '{}')) as PlateEstimateResult;
    } catch {
      return null;
    }
  }, [params.payload]);

  const [items, setItems] = useState<PortionEstimate[]>(initial?.items ?? []);
  const [saving, setSaving] = useState(false);

  const totals = roundMacros(totalsFromItems(items));

  function updateItem(index: number, patch: Partial<PortionEstimate>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function updateMacro(index: number, key: 'kcal' | 'protein_g' | 'carb_g' | 'fat_g', value: string) {
    const num = Number(value);
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              macros: {
                kcal: item.macros?.kcal ?? 0,
                protein_g: item.macros?.protein_g ?? 0,
                carb_g: item.macros?.carb_g ?? 0,
                fat_g: item.macros?.fat_g ?? 0,
                sugar_g: item.macros?.sugar_g,
                sodium_mg: item.macros?.sodium_mg,
                [key]: Number.isFinite(num) ? num : 0,
              },
            }
          : item,
      ),
    );
  }

  async function confirm() {
    if (items.length === 0) {
      Alert.alert('Nothing to log', 'Add or keep at least one item.');
      return;
    }
    setSaving(true);
    try {
      const user = await services.storage.getUser();
      const flags = [
        ...(initial?.flags ?? []),
        ...checkFlags({ user, totals, items }),
      ];
      const meal: MealEntry = {
        id: newId('meal'),
        userId: user.id,
        loggedAt: new Date().toISOString(),
        source: 'plate_vision',
        photoUri: params.photoUri ? String(params.photoUri) : undefined,
        items,
        totals,
        flags,
        userConfirmed: true,
        providerMeta: initial?.providerMeta,
      };
      await services.storage.saveMeal(meal);
      const tips = await services.recommendations.recommend(user, meal);
      Alert.alert(
        'Logged',
        tips[0]?.message ?? 'Meal saved. Estimates are assistive — you confirmed them.',
      );
      router.replace('/(tabs)/history');
    } finally {
      setSaving(false);
    }
  }

  if (!initial) {
    return (
      <Screen>
        <Title>Missing estimate</Title>
        <Muted>Go back and capture a plate photo.</Muted>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Title>Review plate</Title>
        <Subtitle>
          Confidence {(initial.confidence * 100).toFixed(0)}% — edit before confirm. AI never
          silent-commits.
        </Subtitle>

        <Card>
          <Text style={styles.section}>
            Totals · {totals.kcal} kcal · P {totals.protein_g} · C {totals.carb_g} · F{' '}
            {totals.fat_g}
          </Text>
          {(initial.flags ?? []).map((f, i) => (
            <FlagChip key={`base-${i}`} message={f.message} severity={f.severity} />
          ))}
        </Card>

        {items.map((item, index) => (
          <Card key={`${item.label}-${index}`}>
            <Field
              label="Food name"
              value={item.label}
              onChangeText={(label) => updateItem(index, { label })}
            />
            <Field
              label="Grams"
              value={String(item.grams ?? '')}
              keyboardType="numeric"
              onChangeText={(v) => updateItem(index, { grams: Number(v) || undefined })}
            />
            <View style={styles.macroRow}>
              <View style={styles.flex}>
                <Field
                  label="kcal"
                  value={String(item.macros?.kcal ?? 0)}
                  keyboardType="numeric"
                  onChangeText={(v) => updateMacro(index, 'kcal', v)}
                />
              </View>
              <View style={styles.flex}>
                <Field
                  label="Protein"
                  value={String(item.macros?.protein_g ?? 0)}
                  keyboardType="numeric"
                  onChangeText={(v) => updateMacro(index, 'protein_g', v)}
                />
              </View>
            </View>
            <Muted>Item confidence {(item.confidence * 100).toFixed(0)}%</Muted>
          </Card>
        ))}

        <PrimaryButton
          label={saving ? 'Saving…' : 'Confirm & log'}
          onPress={confirm}
          disabled={saving}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, paddingBottom: 40 },
  section: { fontSize: 16, fontWeight: '700' },
  macroRow: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
});
