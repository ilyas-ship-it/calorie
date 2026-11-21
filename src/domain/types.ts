/** Core domain types for Calorie AI MVP. Keep opaque IDs; stash raw provider payloads in providerMeta. */

export type GoalType = 'lose' | 'maintain' | 'gain';

export type Units = 'metric' | 'imperial';

export type MealSource = 'plate_vision' | 'label_ocr' | 'manual';

export type FlagType =
  | 'sugar_high'
  | 'sodium_high'
  | 'allergen_match'
  | 'possible_allergen'
  | 'needs_review';

export type FlagSeverity = 'info' | 'warning' | 'critical';

export type RecommendationType = 'tip' | 'warning' | 'goal_nudge';

export type Macros = {
  kcal: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
  sugar_g?: number;
  sodium_mg?: number;
};

export type UserProfile = {
  sex?: string;
  age?: number;
  height?: number;
  weight?: number;
  activityLevel?: string;
  goalType: GoalType;
  calorieTarget: number;
  macroTargets?: Partial<Macros>;
};

export type UserPreferences = {
  units: Units;
  flagThresholds?: {
    sugar_g?: number;
    sodium_mg?: number;
  };
};

export type User = {
  id: string;
  email?: string;
  createdAt: string;
  profile: UserProfile;
  allergens: string[];
  preferences: UserPreferences;
};

export type FoodItem = {
  id: string;
  name: string;
  brand?: string;
  source: 'usda' | 'off' | 'custom' | 'ocr' | 'vision_stub';
  per100g: Macros;
  allergens?: string[];
  ingredientsText?: string;
  providerMeta?: Record<string, unknown>;
};

export type PortionEstimate = {
  foodItemId?: string;
  label: string;
  grams?: number;
  servingCount?: number;
  confidence: number;
  macros?: Macros;
  providerMeta?: Record<string, unknown>;
};

export type Flag = {
  type: FlagType;
  message: string;
  severity: FlagSeverity;
  relatedAllergen?: string;
};

export type MealEntry = {
  id: string;
  userId: string;
  loggedAt: string;
  source: MealSource;
  photoUri?: string;
  rawOcrText?: string;
  items: PortionEstimate[];
  totals: Macros;
  flags: Flag[];
  userConfirmed: boolean;
  notes?: string;
  providerMeta?: Record<string, unknown>;
};

export type Recommendation = {
  id: string;
  userId: string;
  createdAt: string;
  mealEntryId?: string;
  type: RecommendationType;
  message: string;
  severity: FlagSeverity;
};

export type DailySummary = {
  userId: string;
  date: string;
  totals: Macros;
  goalProgress: number;
};

export type CaptureMode = 'plate' | 'label';

export type PlateEstimateResult = {
  items: PortionEstimate[];
  totals: Macros;
  confidence: number;
  flags: Flag[];
  providerMeta?: Record<string, unknown>;
};

export type LabelParseResult = {
  items: PortionEstimate[];
  totals: Macros;
  rawText: string;
  confidence: number;
  flags: Flag[];
  ingredientsText?: string;
  providerMeta?: Record<string, unknown>;
};
