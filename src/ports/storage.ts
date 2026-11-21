import type { MealEntry, User } from '@/src/domain/types';

/** Port: local persistence for profile + meal history. */
export interface MealStoragePort {
  getUser(): Promise<User>;
  saveUser(user: User): Promise<void>;
  listMeals(): Promise<MealEntry[]>;
  getMeal(id: string): Promise<MealEntry | null>;
  saveMeal(meal: MealEntry): Promise<void>;
  deleteMeal(id: string): Promise<void>;
}
