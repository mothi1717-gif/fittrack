// Hand-written types for Phase 1. Once the Supabase schema is applied,
// regenerate this file with:
//   npx supabase gen types typescript --project-id <your-project-ref> > src/lib/types/database.ts
// and the rest of the app (which imports `Database` from here) keeps working unchanged.

export type UserRole = "admin" | "trainer" | "client";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          email: string;
          phone: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          role: UserRole;
          full_name: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
}
