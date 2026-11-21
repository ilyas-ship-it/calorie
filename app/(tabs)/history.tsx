import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { Card, FlagChip, Muted, Screen, Subtitle, Title } from '@/components/ui';
import type { MealEntry, User } from '@/src/domain/types';
import { services } from '@/src/services/appServices';

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export default function HistoryScreen() {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [list, u] = await Promise.all([
          services.storage.listMeals(),
          services.storage.getUser(),
        ]);
        if (!active) return;
        setMeals(list);
        setUser(u);
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  const byDay = useMemo(() => {
    const map = new Map<string, MealEntry[]>();
    for (const meal of meals) {
      const key = dayKey(meal.loggedAt);
      const bucket = map.get(key) ?? [];
      bucket.push(meal);
      map.set(key, bucket);
    }
    return [...map.entries()];
  }, [meals]);

  const last7 = useMemo(() => {
    const days: { date: string; kcal: number }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const kcal = meals
        .filter((m) => dayKey(m.loggedAt) === key)
        .reduce((s, m) => s + m.totals.kcal, 0);
      days.push({ date: key.slice(5), kcal });
    }
    return days;
  }, [meals]);

  const maxKcal = Math.max(user?.profile.calorieTarget ?? 1, ...last7.map((d) => d.kcal), 1);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Title>History & progress</Title>
        <Subtitle>Local meal history with a simple 7-day calorie chart.</Subtitle>

        <Card>
          <Text style={styles.section}>Last 7 days vs goal</Text>
          <Muted>Goal: {user?.profile.calorieTarget ?? '—'} kcal</Muted>
          <View style={styles.chart}>
            {last7.map((d) => {
              const barHeight = Math.max(6, Math.round((d.kcal / maxKcal) * 100));
              return (
                <View key={d.date} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: barHeight }]} />
                  </View>
                  <Text style={styles.barLabel}>{d.date}</Text>
                  <Muted>{Math.round(d.kcal)}</Muted>
                </View>
              );
            })}
          </View>
        </Card>

        {byDay.length === 0 ? (
          <Card>
            <Muted>No confirmed meals yet.</Muted>
          </Card>
        ) : (
          byDay.map(([date, list]) => {
            const dayKcal = list.reduce((s, m) => s + m.totals.kcal, 0);
            return (
              <Card key={date}>
                <Text style={styles.section}>
                  {date} · {Math.round(dayKcal)} kcal
                </Text>
                {list.map((m) => (
                  <View key={m.id} style={styles.meal}>
                    <Text style={{ fontWeight: '600' }}>
                      {m.items.map((i) => i.label).join(', ') || m.source}
                    </Text>
                    <Muted>
                      {Math.round(m.totals.kcal)} kcal · P {m.totals.protein_g} · C{' '}
                      {m.totals.carb_g} · F {m.totals.fat_g}
                    </Muted>
                    {m.flags.slice(0, 2).map((f, idx) => (
                      <FlagChip
                        key={`${m.id}-${idx}`}
                        message={f.message}
                        severity={f.severity}
                      />
                    ))}
                  </View>
                ))}
              </Card>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, paddingBottom: 32 },
  section: { fontSize: 16, fontWeight: '700' },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 140,
    marginTop: 8,
  },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: {
    height: 100,
    width: '100%',
    justifyContent: 'flex-end',
    backgroundColor: '#D7E6DD',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#1B7A4E',
    borderRadius: 6,
  },
  barLabel: { fontSize: 11 },
  meal: { gap: 4, paddingVertical: 6 },
});
