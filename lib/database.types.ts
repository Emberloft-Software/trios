export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          active: boolean
          category: string
          default_capacity: number
          emoji: string
          id: string
          is_sport: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          category: string
          default_capacity: number
          emoji: string
          id?: string
          is_sport?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          category?: string
          default_capacity?: number
          emoji?: string
          id?: string
          is_sport?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      admin_allowlist: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      admin_audit: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          id: string
          meta: Json | null
          reason: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          id?: string
          meta?: Json | null
          reason?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          id?: string
          meta?: Json | null
          reason?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_audit_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          confirmer_id: string
          created_at: string
          gig_id: string
          id: string
          subject_id: string
        }
        Insert: {
          confirmer_id: string
          created_at?: string
          gig_id: string
          id?: string
          subject_id: string
        }
        Update: {
          confirmer_id?: string
          created_at?: string
          gig_id?: string
          id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkins_confirmer_id_fkey"
            columns: ["confirmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_confirmer_id_fkey"
            columns: ["confirmer_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "friend_hosted_gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gig_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_removals: {
        Row: {
          actor_id: string | null
          created_at: string
          gig_id: string
          id: string
          kind: string
          reason: string
          target_id: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          gig_id: string
          id?: string
          kind?: string
          reason: string
          target_id?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          gig_id?: string
          id?: string
          kind?: string
          reason?: string
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_removals_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_removals_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_removals_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "friend_hosted_gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_removals_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gig_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_removals_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_removals_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_removals_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          created_at: string
          gig_id: string
          id: string
          recipient_id: string
          responded_at: string | null
          sender_id: string
          status: string
        }
        Insert: {
          created_at?: string
          gig_id: string
          id?: string
          recipient_id: string
          responded_at?: string | null
          sender_id: string
          status?: string
        }
        Update: {
          created_at?: string
          gig_id?: string
          id?: string
          recipient_id?: string
          responded_at?: string | null
          sender_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_requests_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "friend_hosted_gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gig_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          id: string
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      gig_crew: {
        Row: {
          claimed_at: string
          gig_id: string
          id: string
          joined_via: Database["public"]["Enums"]["join_route"]
          left_at: string | null
          position: number
          state: Database["public"]["Enums"]["crew_state"]
          user_id: string
        }
        Insert: {
          claimed_at?: string
          gig_id: string
          id?: string
          joined_via?: Database["public"]["Enums"]["join_route"]
          left_at?: string | null
          position: number
          state?: Database["public"]["Enums"]["crew_state"]
          user_id: string
        }
        Update: {
          claimed_at?: string
          gig_id?: string
          id?: string
          joined_via?: Database["public"]["Enums"]["join_route"]
          left_at?: string | null
          position?: number
          state?: Database["public"]["Enums"]["crew_state"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gig_crew_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "friend_hosted_gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gig_crew_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gig_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gig_crew_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gig_crew_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gig_crew_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      gig_messages: {
        Row: {
          body: string
          created_at: string
          gig_id: string
          id: string
          system_kind: string | null
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          gig_id: string
          id?: string
          system_kind?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          gig_id?: string
          id?: string
          system_kind?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gig_messages_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "friend_hosted_gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gig_messages_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gig_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gig_messages_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gig_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gig_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      gigs: {
        Row: {
          activity_id: string
          age_max: number
          age_min: number
          cancelled_reason: string | null
          capacity: number
          claimed_count: number
          code: string
          cost_note: string | null
          created_at: string
          duration_min: number
          gender_pref: Database["public"]["Enums"]["gig_gender"]
          host_guests: number
          host_id: string
          id: string
          invite_code: string
          lat: number
          lng: number
          locks_at: string
          min_to_confirm: number
          notes: string | null
          place_label: string
          reserved_slots: number
          starts_at: string
          status: Database["public"]["Enums"]["gig_status"]
          title: string
          venue_id: string | null
        }
        Insert: {
          activity_id: string
          age_max?: number
          age_min?: number
          cancelled_reason?: string | null
          capacity: number
          claimed_count?: number
          code: string
          cost_note?: string | null
          created_at?: string
          duration_min?: number
          gender_pref?: Database["public"]["Enums"]["gig_gender"]
          host_guests?: number
          host_id: string
          id?: string
          invite_code: string
          lat: number
          lng: number
          locks_at: string
          min_to_confirm?: number
          notes?: string | null
          place_label: string
          reserved_slots?: number
          starts_at: string
          status?: Database["public"]["Enums"]["gig_status"]
          title: string
          venue_id?: string | null
        }
        Update: {
          activity_id?: string
          age_max?: number
          age_min?: number
          cancelled_reason?: string | null
          capacity?: number
          claimed_count?: number
          code?: string
          cost_note?: string | null
          created_at?: string
          duration_min?: number
          gender_pref?: Database["public"]["Enums"]["gig_gender"]
          host_guests?: number
          host_id?: string
          id?: string
          invite_code?: string
          lat?: number
          lng?: number
          locks_at?: string
          min_to_confirm?: number
          notes?: string | null
          place_label?: string
          reserved_slots?: number
          starts_at?: string
          status?: Database["public"]["Enums"]["gig_status"]
          title?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gigs_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gigs_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gigs_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gigs_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      kick_votes: {
        Row: {
          created_at: string
          gig_id: string
          id: string
          reason: string
          target_id: string
          voter_id: string
        }
        Insert: {
          created_at?: string
          gig_id: string
          id?: string
          reason: string
          target_id: string
          voter_id: string
        }
        Update: {
          created_at?: string
          gig_id?: string
          id?: string
          reason?: string
          target_id?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kick_votes_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "friend_hosted_gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kick_votes_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gig_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kick_votes_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kick_votes_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kick_votes_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kick_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kick_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_actions: {
        Row: {
          action: Database["public"]["Enums"]["mod_action"]
          admin_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          reason: string
          target_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["mod_action"]
          admin_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          reason: string
          target_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["mod_action"]
          admin_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          reason?: string
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_outbox: {
        Row: {
          created_at: string
          gig_id: string | null
          id: string
          kind: string
          payload: Json
          read_at: string | null
          sent_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          gig_id?: string | null
          id?: string
          kind: string
          payload?: Json
          read_at?: string | null
          sent_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          gig_id?: string | null
          id?: string
          kind?: string
          payload?: Json
          read_at?: string | null
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_outbox_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "friend_hosted_gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_outbox_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gig_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_outbox_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_outbox_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_outbox_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      perk_redemptions: {
        Row: {
          crew_size: number
          gig_id: string
          id: string
          redeemed_at: string
          venue_id: string
        }
        Insert: {
          crew_size: number
          gig_id: string
          id?: string
          redeemed_at?: string
          venue_id: string
        }
        Update: {
          crew_size?: number
          gig_id?: string
          id?: string
          redeemed_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "perk_redemptions_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: true
            referencedRelation: "friend_hosted_gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perk_redemptions_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: true
            referencedRelation: "gig_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perk_redemptions_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: true
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perk_redemptions_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accepted_terms_at: string | null
          avatar_face_score: number | null
          avatar_faces_found: number | null
          avatar_path: string | null
          avatar_pending_path: string | null
          avatar_reject_reason: string | null
          avatar_reviewed_at: string | null
          avatar_status: Database["public"]["Enums"]["photo_status"]
          bio: string | null
          birth_date: string | null
          city: string
          created_at: string
          display_name: string
          gender: Database["public"]["Enums"]["gender_identity"] | null
          handle: string
          id: string
          interests: string[]
          is_admin: boolean
          joining_restricted_until: string | null
          posting_restricted_until: string | null
          reliability_band: Database["public"]["Enums"]["reliability_band"]
          suspended_until: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
        }
        Insert: {
          accepted_terms_at?: string | null
          avatar_face_score?: number | null
          avatar_faces_found?: number | null
          avatar_path?: string | null
          avatar_pending_path?: string | null
          avatar_reject_reason?: string | null
          avatar_reviewed_at?: string | null
          avatar_status?: Database["public"]["Enums"]["photo_status"]
          bio?: string | null
          birth_date?: string | null
          city?: string
          created_at?: string
          display_name: string
          gender?: Database["public"]["Enums"]["gender_identity"] | null
          handle: string
          id: string
          interests?: string[]
          is_admin?: boolean
          joining_restricted_until?: string | null
          posting_restricted_until?: string | null
          reliability_band?: Database["public"]["Enums"]["reliability_band"]
          suspended_until?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
        }
        Update: {
          accepted_terms_at?: string | null
          avatar_face_score?: number | null
          avatar_faces_found?: number | null
          avatar_path?: string | null
          avatar_pending_path?: string | null
          avatar_reject_reason?: string | null
          avatar_reviewed_at?: string | null
          avatar_status?: Database["public"]["Enums"]["photo_status"]
          bio?: string | null
          birth_date?: string | null
          city?: string
          created_at?: string
          display_name?: string
          gender?: Database["public"]["Enums"]["gender_identity"] | null
          handle?: string
          id?: string
          interests?: string[]
          is_admin?: boolean
          joining_restricted_until?: string | null
          posting_restricted_until?: string | null
          reliability_band?: Database["public"]["Enums"]["reliability_band"]
          suspended_until?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
        }
        Relationships: []
      }
      reliability_events: {
        Row: {
          created_at: string
          gig_id: string | null
          id: string
          kind: Database["public"]["Enums"]["reliability_kind"]
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          gig_id?: string | null
          id?: string
          kind: Database["public"]["Enums"]["reliability_kind"]
          user_id: string
          weight?: number
        }
        Update: {
          created_at?: string
          gig_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["reliability_kind"]
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "reliability_events_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "friend_hosted_gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reliability_events_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gig_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reliability_events_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reliability_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reliability_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          category: string
          created_at: string
          details: string
          gig_id: string | null
          handled_by: string | null
          id: string
          reporter_id: string | null
          resolution: string | null
          status: Database["public"]["Enums"]["report_status"]
          target_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          details: string
          gig_id?: string | null
          handled_by?: string | null
          id?: string
          reporter_id?: string | null
          resolution?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          details?: string
          gig_id?: string | null
          handled_by?: string | null
          id?: string
          reporter_id?: string | null
          resolution?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "friend_hosted_gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gig_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_handled_by_fkey"
            columns: ["handled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_handled_by_fkey"
            columns: ["handled_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          active: boolean
          active_hours: Json | null
          activity_tags: string[]
          address: string
          created_at: string
          google_place_id: string | null
          google_types: string[]
          id: string
          is_partner: boolean
          lat: number
          lng: number
          maps_url: string | null
          name: string
          partner_perk: string | null
          partner_since: string | null
          photo_attribution: string[]
          photo_refs: string[]
          photos_refreshed_at: string | null
          price_level: number | null
          rating: number | null
          slug: string | null
          user_rating_count: number | null
          verified_public: boolean
        }
        Insert: {
          active?: boolean
          active_hours?: Json | null
          activity_tags?: string[]
          address: string
          created_at?: string
          google_place_id?: string | null
          google_types?: string[]
          id?: string
          is_partner?: boolean
          lat: number
          lng: number
          maps_url?: string | null
          name: string
          partner_perk?: string | null
          partner_since?: string | null
          photo_attribution?: string[]
          photo_refs?: string[]
          photos_refreshed_at?: string | null
          price_level?: number | null
          rating?: number | null
          slug?: string | null
          user_rating_count?: number | null
          verified_public?: boolean
        }
        Update: {
          active?: boolean
          active_hours?: Json | null
          activity_tags?: string[]
          address?: string
          created_at?: string
          google_place_id?: string | null
          google_types?: string[]
          id?: string
          is_partner?: boolean
          lat?: number
          lng?: number
          maps_url?: string | null
          name?: string
          partner_perk?: string | null
          partner_since?: string | null
          photo_attribution?: string[]
          photo_refs?: string[]
          photos_refreshed_at?: string | null
          price_level?: number | null
          rating?: number | null
          slug?: string | null
          user_rating_count?: number | null
          verified_public?: boolean
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          challenge: Json
          created_at: string
          device_hint: string | null
          id: string
          media_bytes: number | null
          media_mime: string | null
          media_path: string | null
          media_purged_at: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: Database["public"]["Enums"]["verification_status"]
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          challenge: Json
          created_at?: string
          device_hint?: string | null
          id?: string
          media_bytes?: number | null
          media_mime?: string | null
          media_path?: string | null
          media_purged_at?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          challenge?: Json
          created_at?: string
          device_hint?: string | null
          id?: string
          media_bytes?: number | null
          media_mime?: string | null
          media_path?: string | null
          media_purged_at?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_flags: {
        Row: {
          count: number | null
          detail: string | null
          kind: string | null
          last_at: string | null
          subject_id: string | null
        }
        Relationships: []
      }
      friend_hosted_gigs: {
        Row: {
          activity_category: string
          activity_emoji: string
          activity_name: string
          activity_slug: string
          age_max: number
          age_min: number
          capacity: number
          claimed_count: number
          code: string
          cost_note: string | null
          created_at: string
          duration_min: number
          gender_pref: Database["public"]["Enums"]["gig_gender"]
          headcount: number
          host_avatar: string | null
          host_guests: number
          host_name: string
          id: string
          lat: number
          lng: number
          locks_at: string
          min_to_confirm: number
          place_label: string
          reserved_slots: number
          starts_at: string
          status: Database["public"]["Enums"]["gig_status"]
          title: string
          venue_maps_url: string | null
          venue_name: string | null
          venue_photo_attribution: string | null
          venue_photo_ref: string | null
          venue_rating: number | null
          venue_rating_count: number | null
        }
        Relationships: []
      }
      gig_feed: {
        Row: {
          activity_category: string
          activity_emoji: string
          activity_name: string
          activity_slug: string
          age_max: number
          age_min: number
          capacity: number
          claimed_count: number
          code: string
          cost_note: string | null
          created_at: string
          duration_min: number
          gender_pref: Database["public"]["Enums"]["gig_gender"]
          headcount: number
          host_guests: number
          id: string
          lat: number
          lng: number
          locks_at: string
          min_to_confirm: number
          place_label: string
          reserved_slots: number
          starts_at: string
          status: Database["public"]["Enums"]["gig_status"]
          title: string
          venue_maps_url: string | null
          venue_name: string | null
          venue_photo_attribution: string | null
          venue_photo_ref: string | null
          venue_rating: number | null
          venue_rating_count: number | null
        }
        Relationships: []
      }
      profiles_public: {
        Row: {
          age: number | null
          avatar_path: string | null
          bio: string | null
          city: string
          created_at: string
          display_name: string
          gender: Database["public"]["Enums"]["gender_identity"] | null
          handle: string
          id: string
          interests: string[]
          reliability_band:
            | Database["public"]["Enums"]["reliability_band"]
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
        }
        Insert: {
          age?: never
          avatar_path?: never
          bio?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          gender?: Database["public"]["Enums"]["gender_identity"] | null
          handle?: string | null
          id?: string | null
          interests?: string[] | null
          reliability_band?:
            | Database["public"]["Enums"]["reliability_band"]
            | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
        }
        Update: {
          age?: never
          avatar_path?: never
          bio?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          gender?: Database["public"]["Enums"]["gender_identity"] | null
          handle?: string | null
          id?: string | null
          interests?: string[] | null
          reliability_band?:
            | Database["public"]["Enums"]["reliability_band"]
            | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
        }
        Relationships: []
      }
      verification_requests_public: {
        Row: {
          created_at: string
          id: string
          review_note: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["verification_status"]
          submitted_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          submitted_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          submitted_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _assert_can_join: {
        Args: { p_user: string }
        Returns: {
          accepted_terms_at: string | null
          avatar_face_score: number | null
          avatar_faces_found: number | null
          avatar_path: string | null
          avatar_pending_path: string | null
          avatar_reject_reason: string | null
          avatar_reviewed_at: string | null
          avatar_status: Database["public"]["Enums"]["photo_status"]
          bio: string | null
          birth_date: string | null
          city: string
          created_at: string
          display_name: string
          gender: Database["public"]["Enums"]["gender_identity"] | null
          handle: string
          id: string
          interests: string[]
          is_admin: boolean
          joining_restricted_until: string | null
          posting_restricted_until: string | null
          reliability_band: Database["public"]["Enums"]["reliability_band"]
          suspended_until: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _blocked_with_crew: {
        Args: { p_gig_id: string; p_user: string }
        Returns: boolean
      }
      _crew_join: {
        Args: {
          p_gig_id: string
          p_user: string
          p_via: Database["public"]["Enums"]["join_route"]
        }
        Returns: {
          claimed_at: string
          gig_id: string
          id: string
          joined_via: Database["public"]["Enums"]["join_route"]
          left_at: string | null
          position: number
          state: Database["public"]["Enums"]["crew_state"]
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "gig_crew"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _maybe_confirm: {
        Args: { p_gig_id: string; p_was_confirmed: boolean }
        Returns: undefined
      }
      accept_friend_request: {
        Args: { p_request_id: string }
        Returns: {
          created_at: string
          id: string
          user_a: string
          user_b: string
        }
        SetofOptions: {
          from: "*"
          to: "friendships"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      age_years: { Args: { p_birth: string }; Returns: number }
      block_user: { Args: { p_blocked: string }; Returns: undefined }
      cancel_gig: {
        Args: { p_gig_id: string; p_reason?: string }
        Returns: undefined
      }
      cast_kick_vote: {
        Args: { p_gig_id: string; p_reason: string; p_target: string }
        Returns: Json
      }
      check_handle: { Args: { p_handle: string }; Returns: boolean }
      check_in: {
        Args: { p_gig_id: string; p_subject: string }
        Returns: undefined
      }
      claim_slot: {
        Args: { p_gig_id: string }
        Returns: {
          claimed_at: string
          gig_id: string
          id: string
          joined_via: Database["public"]["Enums"]["join_route"]
          left_at: string | null
          position: number
          state: Database["public"]["Enums"]["crew_state"]
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "gig_crew"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      complete_gigs_job: { Args: never; Returns: undefined }
      complete_profile: {
        Args: {
          p_accept_terms?: boolean
          p_birth_date: string
          p_gender: Database["public"]["Enums"]["gender_identity"]
        }
        Returns: {
          accepted_terms_at: string | null
          avatar_face_score: number | null
          avatar_faces_found: number | null
          avatar_path: string | null
          avatar_pending_path: string | null
          avatar_reject_reason: string | null
          avatar_reviewed_at: string | null
          avatar_status: Database["public"]["Enums"]["photo_status"]
          bio: string | null
          birth_date: string | null
          city: string
          created_at: string
          display_name: string
          gender: Database["public"]["Enums"]["gender_identity"] | null
          handle: string
          id: string
          interests: string[]
          is_admin: boolean
          joining_restricted_until: string | null
          posting_restricted_until: string | null
          reliability_band: Database["public"]["Enums"]["reliability_band"]
          suspended_until: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_gig: {
        Args: {
          p_activity_id: string
          p_age_max?: number
          p_age_min?: number
          p_capacity: number
          p_cost_note?: string
          p_duration_min?: number
          p_gender_pref?: Database["public"]["Enums"]["gig_gender"]
          p_host_guests?: number
          p_lat: number
          p_lng: number
          p_notes?: string
          p_place_label: string
          p_starts_at: string
          p_title: string
          p_venue_id: string
        }
        Returns: {
          activity_id: string
          age_max: number
          age_min: number
          cancelled_reason: string | null
          capacity: number
          claimed_count: number
          code: string
          cost_note: string | null
          created_at: string
          duration_min: number
          gender_pref: Database["public"]["Enums"]["gig_gender"]
          host_guests: number
          host_id: string
          id: string
          invite_code: string
          lat: number
          lng: number
          locks_at: string
          min_to_confirm: number
          notes: string | null
          place_label: string
          reserved_slots: number
          starts_at: string
          status: Database["public"]["Enums"]["gig_status"]
          title: string
          venue_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "gigs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      enqueue_notification: {
        Args: {
          p_gig: string
          p_kind: string
          p_payload?: Json
          p_user: string
        }
        Returns: undefined
      }
      expire_friend_requests_job: { Args: never; Returns: undefined }
      expire_stale_verifications_job: { Args: never; Returns: undefined }
      file_report: {
        Args: {
          p_category: string
          p_details: string
          p_gig_id?: string
          p_target: string
        }
        Returns: {
          category: string
          created_at: string
          details: string
          gig_id: string | null
          handled_by: string | null
          id: string
          reporter_id: string | null
          resolution: string | null
          status: Database["public"]["Enums"]["report_status"]
          target_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "reports"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      gen_challenge: { Args: never; Returns: Json }
      gen_gig_code: { Args: { p_activity_id: string }; Returns: string }
      gen_invite_code: { Args: never; Returns: string }
      gen_venue_slug: { Args: { p_name: string }; Returns: string }
      gig_is_confirmed: { Args: { p_gig_id: string }; Returns: boolean }
      invite_friend: {
        Args: { p_friend: string; p_gig_id: string }
        Returns: undefined
      }
      invite_preview: { Args: { p_code: string }; Returns: Json }
      is_admin: { Args: { p_user?: string }; Returns: boolean }
      is_blocked_pair: { Args: { p_a: string; p_b: string }; Returns: boolean }
      is_gig_crew: {
        Args: { p_gig_id: string; p_user?: string }
        Returns: boolean
      }
      join_by_invite: {
        Args: { p_code: string }
        Returns: {
          activity_id: string
          age_max: number
          age_min: number
          cancelled_reason: string | null
          capacity: number
          claimed_count: number
          code: string
          cost_note: string | null
          created_at: string
          duration_min: number
          gender_pref: Database["public"]["Enums"]["gig_gender"]
          host_guests: number
          host_id: string
          id: string
          invite_code: string
          lat: number
          lng: number
          locks_at: string
          min_to_confirm: number
          notes: string | null
          place_label: string
          reserved_slots: number
          starts_at: string
          status: Database["public"]["Enums"]["gig_status"]
          title: string
          venue_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "gigs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      kick_vote_tallies: {
        Args: { p_gig_id: string }
        Returns: {
          i_voted: boolean
          needed: number
          target_id: string
          votes: number
        }[]
      }
      leave_gig: {
        Args: { p_gig_id: string; p_uncomfortable?: boolean }
        Returns: undefined
      }
      lock_gigs_job: { Args: never; Returns: undefined }
      mark_notifications_read: { Args: never; Returns: undefined }
      purge_old_chats_job: { Args: never; Returns: undefined }
      recompute_bands_job: { Args: never; Returns: undefined }
      recompute_reliability_band: {
        Args: { p_user: string }
        Returns: Database["public"]["Enums"]["reliability_band"]
      }
      redeem_perk: {
        Args: { p_gig_id: string; p_venue_id: string }
        Returns: {
          crew_size: number
          gig_id: string
          id: string
          redeemed_at: string
          venue_id: string
        }
        SetofOptions: {
          from: "*"
          to: "perk_redemptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      redeem_perk_by_code: {
        Args: { p_code: string; p_slug: string }
        Returns: {
          crew_size: number
          gig_id: string
          id: string
          redeemed_at: string
          venue_id: string
        }
        SetofOptions: {
          from: "*"
          to: "perk_redemptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      release_reserved_slot: {
        Args: { p_gig_id: string }
        Returns: {
          activity_id: string
          age_max: number
          age_min: number
          cancelled_reason: string | null
          capacity: number
          claimed_count: number
          code: string
          cost_note: string | null
          created_at: string
          duration_min: number
          gender_pref: Database["public"]["Enums"]["gig_gender"]
          host_guests: number
          host_id: string
          id: string
          invite_code: string
          lat: number
          lng: number
          locks_at: string
          min_to_confirm: number
          notes: string | null
          place_label: string
          reserved_slots: number
          starts_at: string
          status: Database["public"]["Enums"]["gig_status"]
          title: string
          venue_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "gigs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      remove_crew_member: {
        Args: { p_gig_id: string; p_reason: string; p_target: string }
        Returns: undefined
      }
      retract_kick_vote: {
        Args: { p_gig_id: string; p_target: string }
        Returns: undefined
      }
      send_friend_request: {
        Args: { p_gig_id: string; p_recipient: string }
        Returns: {
          created_at: string
          gig_id: string
          id: string
          recipient_id: string
          responded_at: string | null
          sender_id: string
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "friend_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      start_verification: {
        Args: never
        Returns: {
          challenge: Json
          created_at: string
          device_hint: string | null
          id: string
          media_bytes: number | null
          media_mime: string | null
          media_path: string | null
          media_purged_at: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: Database["public"]["Enums"]["verification_status"]
          submitted_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "verification_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_verification: {
        Args: {
          p_device_hint?: string
          p_media_bytes?: number
          p_media_mime: string
          p_media_path: string
          p_request_id: string
        }
        Returns: {
          challenge: Json
          created_at: string
          device_hint: string | null
          id: string
          media_bytes: number | null
          media_mime: string | null
          media_path: string | null
          media_purged_at: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: Database["public"]["Enums"]["verification_status"]
          submitted_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "verification_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      user_matches: {
        Args: {
          p_age_max: number
          p_age_min: number
          p_pref: Database["public"]["Enums"]["gig_gender"]
          p_user: string
        }
        Returns: boolean
      }
      viewer_matches: {
        Args: {
          p_age_max: number
          p_age_min: number
          p_pref: Database["public"]["Enums"]["gig_gender"]
        }
        Returns: boolean
      }
    }
    Enums: {
      crew_state: "claimed" | "left" | "removed" | "no_show" | "attended"
      gender_identity: "man" | "woman" | "nonbinary"
      gig_gender: "everyone" | "women" | "men"
      gig_status: "open" | "locked" | "completed" | "cancelled" | "expired"
      join_route: "host" | "public" | "invite"
      mod_action:
        | "warn"
        | "restrict_posting"
        | "restrict_joining"
        | "suspend"
        | "ban"
        | "clear"
      photo_status: "none" | "pending" | "approved" | "rejected"
      reliability_band: "new" | "reliable" | "mixed" | "restricted"
      reliability_kind:
        | "attended"
        | "no_show"
        | "late_leave"
        | "host_cancel"
        | "early_leave_ok"
      report_status: "open" | "reviewing" | "actioned" | "dismissed"
      verification_status: "unverified" | "pending" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      crew_state: ["claimed", "left", "removed", "no_show", "attended"],
      gender_identity: ["man", "woman", "nonbinary"],
      gig_gender: ["everyone", "women", "men"],
      gig_status: ["open", "locked", "completed", "cancelled", "expired"],
      join_route: ["host", "public", "invite"],
      mod_action: [
        "warn",
        "restrict_posting",
        "restrict_joining",
        "suspend",
        "ban",
        "clear",
      ],
      photo_status: ["none", "pending", "approved", "rejected"],
      reliability_band: ["new", "reliable", "mixed", "restricted"],
      reliability_kind: [
        "attended",
        "no_show",
        "late_leave",
        "host_cancel",
        "early_leave_ok",
      ],
      report_status: ["open", "reviewing", "actioned", "dismissed"],
      verification_status: ["unverified", "pending", "verified", "rejected"],
    },
  },
} as const

// ── Convenience aliases ─────────────────────────────────────────────────────
type E = Database["public"]["Enums"];
export type VerificationStatus = E["verification_status"];
export type ReliabilityBand = E["reliability_band"];
export type GigStatus = E["gig_status"];
export type CrewState = E["crew_state"];
export type ModAction = E["mod_action"];
export type GenderIdentity = E["gender_identity"];
export type GigGender = E["gig_gender"];
export type PhotoStatus = E["photo_status"];
export type JoinRoute = E["join_route"];
export type FeedGig = Database["public"]["Views"]["gig_feed"]["Row"];
export type FriendGig = Database["public"]["Views"]["friend_hosted_gigs"]["Row"];
export type PublicProfile = Database["public"]["Views"]["profiles_public"]["Row"];
