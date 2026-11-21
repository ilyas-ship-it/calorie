import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

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
import { newId, roundMacros } from '@/src/domain/macros';
import type { LabelParseResult, Macros, MealEntry } from '@/src/domain/types';
import { checkFlags } from '@/src/flags/checkFlags';
import { services } from '@/src/services/appServices';

export default function LabelReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ photoUri?: string; payload?: string }>();
  const initial = useMemo(() => {
    try {
      return JSON.parse(String(params.payload ?? '{}')) as LabelParseResult;
    } catch {
      return null;
    }
  }, [params.payload]);

  const [label, setLabel] = useState(initial?.items[0]?.label ?? 'Packaged food');
  const [totals, setTotals] = useState<Macros>(
    initial?.totals ?? { kcal: 0, protein_g: 0, carb_g: 0, fat_g: 0 },
  );
  const [ingredients, setIngredients] = useState(initial?.ingredientsText ?? '');
  const [rawText, setRawText] = useState(initial?.rawText ?? '');
  const [saving, setSaving] = useState(false);

  function setNum(key: keyof Macros, value: string) {
    const num = Number(value);
    setTotals((prev) => ({ ...prev, [key]: Number.isFinite(num) ? num : 0 }));
  }

  async function confirm() {
    setSaving(true);
    try {
      const user = await services.storage.getUser();
      const rounded = roundMacros(totals);
      const items = [
        {
          label,
          grams: initial?.items[0]?.grams,
          servingCount: initial?.items[0]?.servingCount ?? 1,
          confidence: initial?.confidence ?? 0.5,
          macros: rounded,
        },
      ];
      const flags = [
        ...(initial?.flags ?? []),
        ...checkFlags({
          user,
          totals: rounded,
          items,
          ingredientsText: ingredients || rawText,
        }),
      ];
      const meal: MealEntry = {
        id: newId('meal'),
        userId: user.id,
        loggedAt: new Date().toISOString(),
        source: 'label_ocr',
        photoUri: params.photoUri ? String(params.photoUri) : undefined,
        rawOcrText: rawText,
        items,
        totals: rounded,
        flags,
        userConfirmed: true,
        providerMeta: initial?.providerMeta,
      };
      await services.storage.saveMeal(meal);
      Alert.alert('Logged', 'Label meal confirmed and saved locally.');
      router.replace('/(tabs)/history');
    } finally {
      setSaving(false);
    }
  }

  if (!initial) {
    return (
      <Screen>
        <Title>Missing OCR result</Title>
        <Muted>Go back and capture a nutrition label.</Muted>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Title>Review label</Title>
        <Subtitle>
          OCR confidence {(initial.confidence * 100).toFixed(0)}% — edit printed values before
          logging.
        </Subtitle>

        {(initial.flags ?? []).map((f, i) => (
          <FlagChip key={i} message={f.message} severity={f.severity} />
        ))}

        <Card>
          <Field label="Product / serving" value={label} onChangeText={setLabel} />
          <Field
            label="Calories"
            value={String(totals.kcal)}
            keyboardType="numeric"
            onChangeText={(v) => setNum('kcal', v)}
          />
          <Field
            label="Protein (g)"
            value={String(totals.protein_g)}
            keyboardType="numeric"
            onChangeText={(v) => setNum('protein_g', v)}
          />
          <Field
            label="Carbs (g)"
            value={String(totals.carb_g)}
            keyboardType="numeric"
            onChangeText={(v) => setNum('carb_g', v)}
          />
          <Field
            label="Fat (g)"
            value={String(totals.fat_g)}
            keyboardType="numeric"
            onChangeText={(v) => setNum('fat_g', v)}
          />
          <Field
            label="Sugar (g)"
            value={String(totals.sugar_g ?? 0)}
            keyboardType="numeric"
            onChangeText={(v) => setNum('sugar_g', v)}
          />
          <Field
            label="Sodium (mg)"
            value={String(totals.sodium_mg ?? 0)}
            keyboardType="numeric"
            onChangeText={(v) => setNum('sodium_mg', v)}
          />
          <Field
            label="Ingredients"
            value={ingredients}
            onChangeText={setIngredients}
            multiline
          />
        </Card>

        <Card>
          <Text style={styles.section}>Raw OCR text</Text>
          <Field label="Editable OCR dump" value={rawText} onChangeText={setRawText} multiline />
        </Card>

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
});
