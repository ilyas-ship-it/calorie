import type { MealEntry, Recommendation, User } from '@/src/domain/types';
import type { RecommendationsPort } from '@/src/ports/recommendations';

function id(): string {
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Rules-engine stub — swap for ranked ML / LLM coach later. */
export class StubRecommendationsAdapter implements RecommendationsPort {
  async recommend(user: User, meal: MealEntry): Promise<Recommendation[]> {
    const tips: Recommendation[] = [];
    const remaining = user.profile.calorieTarget - meal.totals.kcal;

    if (remaining > 200) {
      tips.push({
        id: id(),
        userId: user.id,
        createdAt: new Date().toISOString(),
        mealEntryId: meal.id,
        type: 'tip',
        message: `You still have ~${Math.round(remaining)} kcal toward today's ${user.profile.calorieTarget} kcal goal.`,
        severity: 'info',
      });
    } else if (remaining < 0) {
      tips.push({
        id: id(),
        userId: user.id,
        createdAt: new Date().toISOString(),
        mealEntryId: meal.id,
        type: 'goal_nudge',
        message: `This meal puts you ~${Math.abs(Math.round(remaining))} kcal over your daily target.`,
        severity: 'warning',
      });
    }

    if ((meal.totals.protein_g ?? 0) < 20 && user.profile.goalType !== 'lose') {
      tips.push({
        id: id(),
        userId: user.id,
        createdAt: new Date().toISOString(),
        mealEntryId: meal.id,
        type: 'tip',
        message: 'Consider adding a protein source to better hit macro targets.',
        severity: 'info',
      });
    }

    for (const flag of meal.flags) {
      if (flag.type === 'allergen_match' || flag.type === 'possible_allergen') {
        tips.push({
          id: id(),
          userId: user.id,
          createdAt: new Date().toISOString(),
          mealEntryId: meal.id,
          type: 'warning',
          message: flag.message,
          severity: flag.severity,
        });
      }
    }

    if (tips.length === 0) {
      tips.push({
        id: id(),
        userId: user.id,
        createdAt: new Date().toISOString(),
        mealEntryId: meal.id,
        type: 'tip',
        message: 'Meal looks balanced relative to your current goals.',
        severity: 'info',
      });
    }

    return tips;
  }
}
