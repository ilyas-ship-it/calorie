import AsyncStorage from '@react-native-async-storage/async-storage';

import { defaultUser } from '@/src/domain/defaults';
import type { MealEntry, User } from '@/src/domain/types';
import type { MealStoragePort } from '@/src/ports/storage';

const USER_KEY = 'calorie.ai.user.v1';
const MEALS_KEY = 'calorie.ai.meals.v1';

/** Local persistence stub (AsyncStorage). Swap for SQLite / WatermelonDB + sync later. */
export class AsyncStorageMealAdapter implements MealStoragePort {
  async getUser(): Promise<User> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) {
      const user = defaultUser();
      await this.saveUser(user);
      return user;
    }
    return JSON.parse(raw) as User;
  }

  async saveUser(user: User): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  async listMeals(): Promise<MealEntry[]> {
    const raw = await AsyncStorage.getItem(MEALS_KEY);
    if (!raw) return [];
    const meals = JSON.parse(raw) as MealEntry[];
    return meals.sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
  }

  async getMeal(id: string): Promise<MealEntry | null> {
    const meals = await this.listMeals();
    return meals.find((m) => m.id === id) ?? null;
  }

  async saveMeal(meal: MealEntry): Promise<void> {
    const meals = await this.listMeals();
    const idx = meals.findIndex((m) => m.id === meal.id);
    if (idx >= 0) meals[idx] = meal;
    else meals.unshift(meal);
    await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(meals));
  }

  async deleteMeal(id: string): Promise<void> {
    const meals = await this.listMeals();
    await AsyncStorage.setItem(
      MEALS_KEY,
      JSON.stringify(meals.filter((m) => m.id !== id)),
    );
  }
}
