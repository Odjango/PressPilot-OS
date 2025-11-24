export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      pp_profiles: {
        Row: {
          id: string | null;
          email: string;
          full_name: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          email: string;
          full_name?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          email?: string;
          full_name?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      pp_projects: {
        Row: {
          id: string;
          owner_email: string;
          name: string;
          slug: string;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          owner_email: string;
          name: string;
          slug: string;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          owner_email?: string;
          name?: string;
          slug?: string;
          status?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}


