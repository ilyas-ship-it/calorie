import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import {
  Card,
  Field,
  Muted,
  PrimaryButton,
  Screen,
  Subtitle,
  Title,
} from '@/components/ui';
import { DEFAULT_SODIUM_MG, DEFAULT_SUGAR_G } from '@/src/domain/defaults';
import type { GoalType, User } from '@/src/domain/types';
import { services } from '@/src/services/appServices';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [calorieTarget, setCalorieTarget] = useState('2000');
  const [goalType, setGoalType] = useState<GoalType>('maintain');
  const [allergens, setAllergens] = useState('peanut');
  const [sugar, setSugar] = useState(String(DEFAULT_SUGAR_G));
  const [sodium, setSodium] = useState(String(DEFAULT_SODIUM_MG));
  const [email, setEmail] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const u = await services.storage.getUser();
        if (!active) return;
        setUser(u);
        setCalorieTarget(String(u.profile.calorieTarget));
        setGoalType(u.profile.goalType);
        setAllergens(u.allergens.join(', '));
        setSugar(String(u.preferences.flagThresholds?.sugar_g ?? DEFAULT_SUGAR_G));
        setSodium(String(u.preferences.flagThresholds?.sodium_mg ?? DEFAULT_SODIUM_MG));
        setEmail(u.email ?? '');
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  async function save() {
    if (!user) return;
    const next: User = {
      ...user,
      email: email.trim() || undefined,
      allergens: allergens
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      profile: {
        ...user.profile,
        goalType,
        calorieTarget: Number(calorieTarget) || 2000,
      },
      preferences: {
        ...user.preferences,
        flagThresholds: {
          sugar_g: Number(sugar) || DEFAULT_SUGAR_G,
          sodium_mg: Number(sodium) || DEFAULT_SODIUM_MG,
        },
      },
    };
    await services.storage.saveUser(next);
    setUser(next);
    Alert.alert('Saved', 'Profile and goals updated locally.');
  }

  async function stubSignIn() {
    const session = await services.auth.signInWithEmail(email || 'demo@calorie.ai', 'password');
    await services.storage.saveUser(session.user);
    setUser(session.user);
    Alert.alert('Auth stub', 'Signed in via AuthPort stub (no real backend).');
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Title>Profile & goals</Title>
        <Subtitle>
          Defaults: sugar {DEFAULT_SUGAR_G}g / sodium {DEFAULT_SODIUM_MG}mg per meal unless you
          change them.
        </Subtitle>

        <Card>
          <Field
            label="Daily calorie target"
            value={calorieTarget}
            onChangeText={setCalorieTarget}
            keyboardType="numeric"
          />
          <Muted>Goal type</Muted>
          <View style={styles.row}>
            {(['lose', 'maintain', 'gain'] as GoalType[]).map((g) => (
              <Text
                key={g}
                onPress={() => setGoalType(g)}
                style={[styles.goalChip, goalType === g && styles.goalActive]}>
                {g}
              </Text>
            ))}
          </View>
          <Field
            label="Allergens (comma-separated)"
            value={allergens}
            onChangeText={setAllergens}
            autoCapitalize="none"
          />
          <Field
            label="Sugar flag threshold (g)"
            value={sugar}
            onChangeText={setSugar}
            keyboardType="numeric"
          />
          <Field
            label="Sodium flag threshold (mg)"
            value={sodium}
            onChangeText={setSodium}
            keyboardType="numeric"
          />
          <PrimaryButton label="Save profile" onPress={save} />
        </Card>

        <Card>
          <Text style={styles.section}>Auth (stub)</Text>
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <PrimaryButton label="Sign in (stub)" onPress={stubSignIn} />
          <Muted>Swap StubAuthAdapter for Supabase / Clerk / Expo Auth later.</Muted>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  goalChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D5E2DA',
    textTransform: 'capitalize',
  },
  goalActive: {
    backgroundColor: '#1B7A4E',
    color: '#fff',
    overflow: 'hidden',
  },
  section: { fontSize: 16, fontWeight: '700' },
});
