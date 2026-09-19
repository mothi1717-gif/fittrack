// Hand-written types, expanded incrementally as features are built.
// Once the Supabase schema is applied, regenerate this file with:
//   npx supabase gen types typescript --project-id <your-project-ref> > src/lib/types/database.ts
// and the rest of the app (which imports `Database` from here) keeps working unchanged.

export type UserRole = "admin" | "trainer" | "client";
export type Sex = "male" | "female";
export type Goal = "fat_loss" | "muscle_gain" | "maintenance" | "general_fitness";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type SessionStatus = "scheduled" | "completed" | "cancelled" | "no_show";
export type CheckinWorkoutStatus = "completed" | "skipped";
export type CheckinDietStatus = "followed" | "partial" | "not_followed";
export type CheckinEnergy = "low" | "normal" | "good";

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          role: UserRole;
          full_name: string;
          email: string;
          phone: string | null;
          is_active: boolean;
          created_at: string;
        },
        { id: string; role: UserRole; full_name: string; email: string; phone?: string | null; is_active?: boolean }
      >;

      trainers: Table<
        { id: string; bio: string | null; specialties: string[] | null },
        { id: string; bio?: string | null; specialties?: string[] | null }
      >;

      clients: Table<
        {
          id: string;
          date_of_birth: string | null;
          sex: Sex | null;
          height_cm: number | null;
          goal: Goal | null;
          activity_level: ActivityLevel | null;
          starting_weight_kg: number | null;
          created_by: string | null;
        },
        {
          id: string;
          date_of_birth?: string | null;
          sex?: Sex | null;
          height_cm?: number | null;
          goal?: Goal | null;
          activity_level?: ActivityLevel | null;
          starting_weight_kg?: number | null;
          created_by?: string | null;
        }
      >;

      trainer_client_assignments: Table<
        {
          id: string;
          client_id: string;
          trainer_id: string;
          assigned_at: string;
          ended_at: string | null;
          assigned_by: string;
        },
        { client_id: string; trainer_id: string; assigned_by: string; ended_at?: string | null },
        { ended_at?: string | null }
      >;

      workout_plans: Table<
        { id: string; client_id: string; trainer_id: string; title: string; is_active: boolean; created_at: string },
        { client_id: string; trainer_id: string; title: string; is_active?: boolean }
      >;

      workout_days: Table<
        { id: string; workout_plan_id: string; title: string; day_order: number },
        { workout_plan_id: string; title: string; day_order?: number }
      >;

      workout_exercises: Table<
        {
          id: string;
          workout_day_id: string;
          name: string;
          target_sets: number;
          target_reps: string;
          target_weight_kg: number | null;
          exercise_order: number;
        },
        {
          workout_day_id: string;
          name: string;
          target_sets: number;
          target_reps: string;
          target_weight_kg?: number | null;
          exercise_order?: number;
        }
      >;

      workout_logs: Table<
        { id: string; client_id: string; workout_exercise_id: string; logged_at: string },
        { client_id: string; workout_exercise_id: string; logged_at?: string }
      >;

      workout_sets: Table<
        { id: string; workout_log_id: string; set_number: number; weight_kg: number; reps: number },
        { workout_log_id: string; set_number: number; weight_kg: number; reps: number }
      >;

      personal_records: Table<
        {
          id: string;
          client_id: string;
          workout_exercise_id: string;
          workout_set_id: string;
          estimated_one_rm: number;
          achieved_at: string;
        },
        {
          client_id: string;
          workout_exercise_id: string;
          workout_set_id: string;
          estimated_one_rm: number;
          achieved_at?: string;
        }
      >;

      diet_plans: Table<
        {
          id: string;
          client_id: string;
          trainer_id: string;
          title: string;
          pdf_storage_path: string | null;
          is_active: boolean;
          created_at: string;
        },
        {
          client_id: string;
          trainer_id: string;
          title: string;
          pdf_storage_path?: string | null;
          is_active?: boolean;
        }
      >;

      diet_meals: Table<
        { id: string; diet_plan_id: string; name: string; time_of_day: string | null },
        { diet_plan_id: string; name: string; time_of_day?: string | null }
      >;

      diet_items: Table<
        {
          id: string;
          diet_meal_id: string;
          food: string;
          quantity: string;
          calories: number | null;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
        },
        {
          diet_meal_id: string;
          food: string;
          quantity: string;
          calories?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
        }
      >;

      measurements: Table<
        {
          id: string;
          client_id: string;
          recorded_at: string;
          weight_kg: number | null;
          waist_cm: number | null;
          chest_cm: number | null;
          arm_cm: number | null;
          thigh_cm: number | null;
        },
        {
          client_id: string;
          recorded_at?: string;
          weight_kg?: number | null;
          waist_cm?: number | null;
          chest_cm?: number | null;
          arm_cm?: number | null;
          thigh_cm?: number | null;
        }
      >;

      activity_logs: Table<
        {
          id: string;
          client_id: string;
          recorded_at: string;
          walking_km: number | null;
          running_km: number | null;
          steps: number | null;
          is_active_day: boolean;
        },
        {
          client_id: string;
          recorded_at?: string;
          walking_km?: number | null;
          running_km?: number | null;
          steps?: number | null;
          is_active_day?: boolean;
        }
      >;

      daily_checkins: Table<
        {
          id: string;
          client_id: string;
          checkin_date: string;
          workout_status: CheckinWorkoutStatus | null;
          diet_status: CheckinDietStatus | null;
          steps: number | null;
          sleep_hours: number | null;
          energy: CheckinEnergy | null;
          notes: string | null;
          created_at: string;
        },
        {
          client_id: string;
          checkin_date?: string;
          workout_status?: CheckinWorkoutStatus | null;
          diet_status?: CheckinDietStatus | null;
          steps?: number | null;
          sleep_hours?: number | null;
          energy?: CheckinEnergy | null;
          notes?: string | null;
        }
      >;

      sessions: Table<
        {
          id: string;
          client_id: string;
          trainer_id: string;
          title: string;
          scheduled_at: string;
          status: SessionStatus;
          meet_link: string | null;
          notes: string | null;
        },
        {
          client_id: string;
          trainer_id: string;
          title: string;
          scheduled_at: string;
          status?: SessionStatus;
          meet_link?: string | null;
          notes?: string | null;
        }
      >;

      messages: Table<
        {
          id: string;
          client_id: string;
          trainer_id: string;
          sender_id: string;
          body: string | null;
          created_at: string;
        },
        { client_id: string; trainer_id: string; sender_id: string; body?: string | null }
      >;

      message_attachments: Table<
        { id: string; message_id: string; storage_path: string; file_type: string | null },
        { message_id: string; storage_path: string; file_type?: string | null }
      >;

      notifications: Table<
        {
          id: string;
          profile_id: string;
          title: string;
          body: string | null;
          is_read: boolean;
          created_at: string;
        },
        { profile_id: string; title: string; body?: string | null; is_read?: boolean }
      >;

      audit_logs: Table<
        {
          id: string;
          actor_id: string | null;
          action: string;
          target_table: string | null;
          target_id: string | null;
          details: Record<string, unknown> | null;
          created_at: string;
        },
        {
          actor_id?: string | null;
          action: string;
          target_table?: string | null;
          target_id?: string | null;
          details?: Record<string, unknown> | null;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      sex: Sex;
      fitness_goal: Goal;
      activity_level: ActivityLevel;
      session_status: SessionStatus;
      checkin_workout_status: CheckinWorkoutStatus;
      checkin_diet_status: CheckinDietStatus;
      checkin_energy: CheckinEnergy;
    };
    CompositeTypes: Record<string, never>;
  };
}
