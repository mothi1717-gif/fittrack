// Calorie estimation logic, kept isolated from the UI so the formula
// can be swapped later without touching any screen.
//
// IMPORTANT: this produces an ESTIMATE only, using the standard
// Mifflin-St Jeor equation. It is not medical advice.

export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "fat_loss" | "muscle_gain" | "maintenance" | "general_fitness";

export interface CalorieInput {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Calorie adjustment applied to maintenance to get the daily target.
const GOAL_ADJUSTMENT: Record<Goal, number> = {
  fat_loss: -500,
  muscle_gain: 300,
  maintenance: 0,
  general_fitness: 0,
};

export interface CalorieResult {
  bmr: number;
  maintenanceCalories: number;
  targetCalories: number;
}

/**
 * Mifflin-St Jeor BMR, scaled by activity level for maintenance
 * calories, then adjusted for the client's stated goal.
 */
export function calculateCalories(input: CalorieInput): CalorieResult {
  const { age, sex, heightCm, weightKg, activityLevel, goal } = input;

  const sexOffset = sex === "male" ? 5 : -161;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + sexOffset;

  const maintenanceCalories = Math.round(bmr * ACTIVITY_MULTIPLIER[activityLevel]);
  const targetCalories = Math.round(maintenanceCalories + GOAL_ADJUSTMENT[goal]);

  return {
    bmr: Math.round(bmr),
    maintenanceCalories,
    targetCalories,
  };
}
