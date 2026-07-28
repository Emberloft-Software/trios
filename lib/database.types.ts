/**
 * Database types.
 *
 * In a live project this file is GENERATED — do not hand-edit long-term:
 *   supabase gen types typescript --local > lib/database.types.ts
 *
 * It is hand-authored here so the frontend typechecks before the local
 * Supabase stack is running. Regenerate it the moment `supabase start` works;
 * the generated output is authoritative. Shape matches supabase-js expectations.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";
export type ReliabilityBand = "new" | "reliable" | "mixed" | "restricted";
export type GigStatus = "open" | "locked" | "completed" | "cancelled" | "expired";
export type CrewState = "claimed" | "left" | "removed" | "no_show" | "attended";
export type ReportStatus = "open" | "reviewing" | "actioned" | "dismissed";
export type ModAction = "warn" | "restrict_posting" | "restrict_joining" | "suspend" | "ban" | "clear";
export type ReliabilityKind = "attended" | "no_show" | "late_leave" | "host_cancel" | "early_leave_ok";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          handle: string;
          display_name: string;
          bio: string | null;
          avatar_path: string | null;
          face_visible: boolean;
          city: string;
          birth_year: number | null;
          interests: string[];
          verification_status: VerificationStatus;
          verified_at: string | null;
          reliability_band: ReliabilityBand;
          is_admin: boolean;
          suspended_until: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          handle: string;
          display_name: string;
          bio?: string | null;
          avatar_path?: string | null;
          face_visible?: boolean;
          city?: string;
          birth_year?: number | null;
          interests?: string[];
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]> & {
          bio?: string | null;
          avatar_path?: string | null;
          face_visible?: boolean;
          display_name?: string;
          interests?: string[];
          // admin/service-role-managed columns (RLS blocks the client at runtime)
          verification_status?: VerificationStatus;
          verified_at?: string | null;
          reliability_band?: ReliabilityBand;
          is_admin?: boolean;
          suspended_until?: string | null;
        };
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          slug: string;
          name: string;
          emoji: string;
          category: string;
          default_capacity: number;
          is_sport: boolean;
          sort_order: number;
          active: boolean;
        };
        Insert: {
          slug: string;
          name: string;
          emoji: string;
          category: string;
          default_capacity: number;
          is_sport?: boolean;
          sort_order?: number;
          active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["activities"]["Insert"]>;
        Relationships: [];
      };
      venues: {
        Row: {
          id: string;
          name: string;
          address: string;
          lat: number;
          lng: number;
          google_place_id: string | null;
          google_types: string[];
          photo_refs: string[];
          photo_attribution: string[];
          photos_refreshed_at: string | null;
          maps_url: string | null;
          price_level: number | null;
          active_hours: Json | null;
          activity_tags: string[];
          is_partner: boolean;
          partner_perk: string | null;
          partner_since: string | null;
          verified_public: boolean;
          active: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          address: string;
          lat: number;
          lng: number;
          google_place_id?: string | null;
          google_types?: string[];
        };
        Update: Partial<Database["public"]["Tables"]["venues"]["Insert"]>;
        Relationships: [];
      };
      gigs: {
        Row: {
          id: string;
          code: string;
          host_id: string;
          activity_id: string;
          title: string;
          notes: string | null;
          venue_id: string | null;
          place_label: string;
          lat: number;
          lng: number;
          starts_at: string;
          duration_min: number;
          capacity: number;
          claimed_count: number;
          min_to_confirm: number;
          cost_note: string | null;
          status: GigStatus;
          locks_at: string;
          cancelled_reason: string | null;
          created_at: string;
        };
        Insert: never; // gigs are created only via create_gig()
        Update: {
          title?: string;
          notes?: string | null;
          cost_note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "gigs_activity_id_fkey";
            columns: ["activity_id"];
            isOneToOne: false;
            referencedRelation: "activities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gigs_host_id_fkey";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gigs_venue_id_fkey";
            columns: ["venue_id"];
            isOneToOne: false;
            referencedRelation: "venues";
            referencedColumns: ["id"];
          },
        ];
      };
      gig_crew: {
        Row: {
          id: string;
          gig_id: string;
          user_id: string;
          position: number;
          state: CrewState;
          claimed_at: string;
          left_at: string | null;
        };
        Insert: never; // slots come only from claim_slot()/create_gig()
        Update: { state?: CrewState; left_at?: string | null };
        Relationships: [];
      };
      gig_messages: {
        Row: {
          id: string;
          gig_id: string;
          user_id: string | null;
          body: string;
          system_kind: string | null;
          created_at: string;
        };
        Insert: { gig_id: string; user_id: string; body: string };
        Update: never;
        Relationships: [];
      };
      checkins: {
        Row: {
          id: string;
          gig_id: string;
          confirmer_id: string;
          subject_id: string;
          created_at: string;
        };
        Insert: { gig_id: string; confirmer_id: string; subject_id: string };
        Update: never;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_id: string;
          gig_id: string | null;
          category: string;
          details: string;
          status: ReportStatus;
          resolution: string | null;
          handled_by: string | null;
          created_at: string;
        };
        Insert: {
          reporter_id: string;
          target_id: string;
          gig_id?: string | null;
          category: string;
          details: string;
        };
        Update: never;
        Relationships: [];
      };
      verification_requests: {
        Row: {
          id: string;
          user_id: string;
          challenge: Json;
          media_path: string | null;
          media_mime: string | null;
          status: VerificationStatus;
          reviewer_id: string | null;
          review_note: string | null;
          reviewed_at: string | null;
          media_purged_at: string | null;
          created_at: string;
        };
        Insert: { user_id: string; challenge: Json };
        Update: {
          media_path?: string | null;
          media_mime?: string | null;
          status?: VerificationStatus;
          reviewer_id?: string | null;
          review_note?: string | null;
          reviewed_at?: string | null;
          media_purged_at?: string | null;
        };
        Relationships: [];
      };
      friend_requests: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          gig_id: string;
          status: "pending" | "accepted" | "declined" | "expired";
          responded_at: string | null;
          created_at: string;
        };
        Insert: never; // via send_friend_request()
        Update: { status?: "accepted" };
        Relationships: [];
      };
      friendships: {
        Row: { id: string; user_a: string; user_b: string; created_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      blocks: {
        Row: { id: string; blocker_id: string; blocked_id: string; created_at: string };
        Insert: { blocker_id: string; blocked_id: string };
        Update: never;
        Relationships: [];
      };
      perk_redemptions: {
        Row: { id: string; venue_id: string; gig_id: string; crew_size: number; redeemed_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      admin_audit: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          target_type: string;
          target_id: string | null;
          reason: string | null;
          meta: Json | null;
          created_at: string;
        };
        Insert: {
          admin_id: string;
          action: string;
          target_type: string;
          target_id?: string | null;
          reason?: string | null;
          meta?: Json | null;
        };
        Update: never;
        Relationships: [];
      };
      notification_outbox: {
        Row: {
          id: string;
          user_id: string;
          kind: string;
          gig_id: string | null;
          payload: Json;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          kind: string;
          gig_id?: string | null;
          payload?: Json;
        };
        Update: { sent_at?: string | null };
        Relationships: [];
      };
    };
    Views: {
      profiles_public: {
        Row: {
          id: string;
          handle: string;
          display_name: string;
          bio: string | null;
          avatar_path: string | null;
          face_visible: boolean;
          city: string;
          interests: string[];
          verification_status: VerificationStatus;
          verified_at: string | null;
          reliability_band: ReliabilityBand;
          created_at: string;
        };
        Relationships: [];
      };
      verification_requests_public: {
        Row: {
          id: string;
          status: VerificationStatus;
          review_note: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Relationships: [];
      };
      gig_feed: {
        Row: {
          id: string;
          code: string;
          title: string;
          place_label: string;
          lat: number;
          lng: number;
          starts_at: string;
          duration_min: number;
          capacity: number;
          claimed_count: number;
          min_to_confirm: number;
          cost_note: string | null;
          status: GigStatus;
          locks_at: string;
          created_at: string;
          activity_slug: string;
          activity_name: string;
          activity_emoji: string;
          activity_category: string;
        };
        Relationships: [];
      };
      friend_hosted_gigs: {
        Row: Database["public"]["Tables"]["gigs"]["Row"] & {
          host_name: string;
          host_avatar: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      create_gig: {
        Args: {
          p_activity_id: string;
          p_title: string;
          p_venue_id: string | null;
          p_place_label: string;
          p_lat: number;
          p_lng: number;
          p_starts_at: string;
          p_capacity: number;
          p_duration_min?: number;
          p_notes?: string | null;
          p_cost_note?: string | null;
          p_locks_at?: string | null;
        };
        Returns: Database["public"]["Tables"]["gigs"]["Row"];
      };
      claim_slot: {
        Args: { p_gig_id: string };
        Returns: Database["public"]["Tables"]["gig_crew"]["Row"];
      };
      leave_gig: {
        Args: { p_gig_id: string; p_uncomfortable?: boolean };
        Returns: undefined;
      };
      remove_crew_member: {
        Args: { p_gig_id: string; p_target: string; p_reason: string };
        Returns: undefined;
      };
      cancel_gig: { Args: { p_gig_id: string; p_reason?: string | null }; Returns: undefined };
      send_friend_request: {
        Args: { p_recipient: string; p_gig_id: string };
        Returns: Database["public"]["Tables"]["friend_requests"]["Row"];
      };
      accept_friend_request: {
        Args: { p_request_id: string };
        Returns: Database["public"]["Tables"]["friendships"]["Row"];
      };
      block_user: { Args: { p_blocked: string }; Returns: undefined };
      redeem_perk: {
        Args: { p_gig_id: string; p_venue_id: string };
        Returns: Database["public"]["Tables"]["perk_redemptions"]["Row"];
      };
      gig_is_confirmed: { Args: { p_gig_id: string }; Returns: boolean };
      is_admin: { Args: { p_user?: string }; Returns: boolean };
      start_verification: {
        Args: Record<string, never>;
        Returns: Database["public"]["Tables"]["verification_requests"]["Row"];
      };
      submit_verification: {
        Args: { p_request_id: string; p_media_path: string; p_media_mime: string };
        Returns: Database["public"]["Tables"]["verification_requests"]["Row"];
      };
    };
    Enums: {
      verification_status: VerificationStatus;
      reliability_band: ReliabilityBand;
      gig_status: GigStatus;
      crew_state: CrewState;
      report_status: ReportStatus;
      mod_action: ModAction;
      reliability_kind: ReliabilityKind;
    };
    CompositeTypes: Record<never, never>;
  };
}
