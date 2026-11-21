import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import {
  Card,
  FlagChip,
  Muted,
  PrimaryButton,
  SecondaryButton,
  Screen,
  Subtitle,
  Title,
} from '@/components/ui';
import type { MealEntry, Recommendation, User } from '@/src/domain/types';
import { services } from '@/src/services/appServices';

export default function TodayScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [tips, setTips] = useState<Recommendation[]>([]);
  const [premium, setPremium] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [u, list, isPremium] = await Promise.all([
          services.storage.getUser(),
          services.storage.listMeals(),
          services.billing.isPremium(),
        ]);
        if (!active) return;
        setUser(u);
        setMeals(list);
        setPremium(isPremium);

        const today = new Date().toISOString().slice(0, 10);
        const todays = list.filter((m) => m.loggedAt.startsWith(today));
        if (todays[0]) {
          setTips(await services.recommendations.recommend(u, todays[0]));
        } else {
          setTips([]);
        }
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  const today = new Date().toISOString().slice(0, 10);
  const todaysMeals = meals.filter((m) => m.loggedAt.startsWith(today));
  const eaten = todaysMeals.reduce((sum, m) => sum + m.totals.kcal, 0);
  const target = user?.profile.calorieTarget ?? 2000;
  const remaining = Math.max(0, target - eaten);
  const flags = todaysMeals.flatMap((m) => m.flags).slice(0, 4);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Title>Calorie AI</Title>
        <Subtitle>Log a plate or label, confirm the estimate, track progress.</Subtitle>

        <Card>
          <Muted>Remaining today</Muted>
          <Text style={styles.heroKcal}>{remaining} kcal</Text>
          <Muted>
            {eaten} eaten · {target} goal{premium ? ' · Premium' : ''}
          </Muted>
        </Card>

        <View style={styles.row}>
          <View style={styles.flex}>
            <PrimaryButton label="Plate photo" onPress={() => router.push('/capture?mode=plate')} />
          </View>
          <View style={styles.flex}>
            <SecondaryButton
              label="Label scan"
              onPress={() => router.push('/capture?mode=label')}
            />
          </View>
        </View>

        {flags.length > 0 && (
          <Card>
            <Text style={styles.section}>Flags</Text>
            {flags.map((f, i) => (
              <FlagChip key={`${f.type}-${i}`} message={f.message} severity={f.severity} />
            ))}
          </Card>
        )}

        {tips.length > 0 && (
          <Card>
            <Text style={styles.section}>Recommendations</Text>
            {tips.map((t) => (
              <Muted key={t.id}>{t.message}</Muted>
            ))}
          </Card>
        )}

        <Card>
          <Text style={styles.section}>Today&apos;s meals</Text>
          {todaysMeals.length === 0 ? (
            <Muted>No meals logged yet. Capture a plate or label to start.</Muted>
          ) : (
            todaysMeals.map((m) => (
              <View key={m.id} style={styles.mealRow}>
                <Text style={{ fontWeight: '600' }}>
                  {m.source.replace('_', ' ')} · {Math.round(m.totals.kcal)} kcal
                </Text>
                <Muted>{new Date(m.loggedAt).toLocaleTimeString()}</Muted>
              </View>
            ))
          )}
        </Card>

        {!premium && (
          <SecondaryButton label="View paywall stub" onPress={() => router.push('/paywall')} />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 32,
  },
  heroKcal: {
    fontSize: 36,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  section: {
    fontSize: 16,
    fontWeight: '700',
  },
  mealRow: {
    gap: 2,
    paddingVertical: 4,
  },
});
