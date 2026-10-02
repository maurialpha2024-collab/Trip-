export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "audit_log": {
                  Row: {
                    "action": string,"actor": string | null,"at": string,"details": Json | null,"id": number,"record_id": string | null,"table_name": string | null
                  }
                  Insert: {
                    "action": string,"actor"?: string | null,"at"?: string,"details"?: Json | null,"id"?: number,"record_id"?: string | null,"table_name"?: string | null
                  }
                  Update: {
                    "action"?: string,"actor"?: string | null,"at"?: string,"details"?: Json | null,"id"?: number,"record_id"?: string | null,"table_name"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_log_actor_fkey"
      columns: ["actor"]
isOneToOne: false
      referencedRelation: "agent_stats"
      referencedColumns: ["agent_id"]
    },{
      foreignKeyName: "audit_log_actor_fkey"
      columns: ["actor"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"households": {
                  Row: {
                    "address_notes": string | null,"city": string | null,"created_at": string,"created_by": string,"family_name": string,"has_no_children": boolean,"id": string,"last_step": number,"search_text": string | null,"small_family_id": string,"status": string,"updated_at": string,"updated_by": string | null,"wilaya": string | null
                  }
                  Insert: {
                    "address_notes"?: string | null,"city"?: string | null,"created_at"?: string,"created_by": string,"family_name": string,"has_no_children"?: boolean,"id"?: string,"last_step"?: number,"search_text"?: never,"small_family_id": string,"status"?: string,"updated_at"?: string,"updated_by"?: string | null,"wilaya"?: string | null
                  }
                  Update: {
                    "address_notes"?: string | null,"city"?: string | null,"created_at"?: string,"created_by"?: string,"family_name"?: string,"has_no_children"?: boolean,"id"?: string,"last_step"?: number,"search_text"?: never,"small_family_id"?: string,"status"?: string,"updated_at"?: string,"updated_by"?: string | null,"wilaya"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "households_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "agent_stats"
      referencedColumns: ["agent_id"]
    },{
      foreignKeyName: "households_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "households_small_family_id_fkey"
      columns: ["small_family_id"]
isOneToOne: false
      referencedRelation: "small_families"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "households_updated_by_fkey"
      columns: ["updated_by"]
isOneToOne: false
      referencedRelation: "agent_stats"
      referencedColumns: ["agent_id"]
    },{
      foreignKeyName: "households_updated_by_fkey"
      columns: ["updated_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"large_families": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"notes": string | null
                  }
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"notes"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"notes"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"login_attempts": {
                  Row: {
                    "at": string,"id": number,"username": string
                  }
                  Insert: {
                    "at"?: string,"id"?: number,"username": string
                  }
                  Update: {
                    "at"?: string,"id"?: number,"username"?: string
                  }
                  Relationships: [
                    
                  ]
                },"persons": {
                  Row: {
                    "birth_date": string | null,"birth_date_precision": string | null,"created_at": string,"education_level": string | null,"full_name": string,"gender": string | null,"household_id": string,"id": string,"is_alive": boolean,"job": string | null,"marital_status": string | null,"mother_id": string | null,"nni": string | null,"phone": string | null,"role": string,"search_text": string | null,"sort_order": number,"updated_at": string,"wilaya": string | null
                  }
                  Insert: {
                    "birth_date"?: string | null,"birth_date_precision"?: string | null,"created_at"?: string,"education_level"?: string | null,"full_name": string,"gender"?: string | null,"household_id": string,"id"?: string,"is_alive"?: boolean,"job"?: string | null,"marital_status"?: string | null,"mother_id"?: string | null,"nni"?: string | null,"phone"?: string | null,"role": string,"search_text"?: never,"sort_order"?: number,"updated_at"?: string,"wilaya"?: string | null
                  }
                  Update: {
                    "birth_date"?: string | null,"birth_date_precision"?: string | null,"created_at"?: string,"education_level"?: string | null,"full_name"?: string,"gender"?: string | null,"household_id"?: string,"id"?: string,"is_alive"?: boolean,"job"?: string | null,"marital_status"?: string | null,"mother_id"?: string | null,"nni"?: string | null,"phone"?: string | null,"role"?: string,"search_text"?: never,"sort_order"?: number,"updated_at"?: string,"wilaya"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "persons_household_id_fkey"
      columns: ["household_id"]
isOneToOne: false
      referencedRelation: "household_search"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "persons_household_id_fkey"
      columns: ["household_id"]
isOneToOne: false
      referencedRelation: "households"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "persons_household_id_fkey"
      columns: ["household_id"]
isOneToOne: false
      referencedRelation: "my_households"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "persons_mother_id_fkey"
      columns: ["mother_id"]
isOneToOne: false
      referencedRelation: "persons"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"full_name": string,"id": string,"is_active": boolean,"role": string,"username": string
                  }
                  Insert: {
                    "created_at"?: string,"full_name": string,"id": string,"is_active"?: boolean,"role": string,"username": string
                  }
                  Update: {
                    "created_at"?: string,"full_name"?: string,"id"?: string,"is_active"?: boolean,"role"?: string,"username"?: string
                  }
                  Relationships: [
                    
                  ]
                },"small_families": {
                  Row: {
                    "created_at": string,"id": string,"large_family_id": string,"name": string,"notes": string | null
                  }
                  Insert: {
                    "created_at"?: string,"id"?: string,"large_family_id": string,"name": string,"notes"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"large_family_id"?: string,"name"?: string,"notes"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "small_families_large_family_id_fkey"
      columns: ["large_family_id"]
isOneToOne: false
      referencedRelation: "household_search"
      referencedColumns: ["large_family_id"]
    },{
      foreignKeyName: "small_families_large_family_id_fkey"
      columns: ["large_family_id"]
isOneToOne: false
      referencedRelation: "large_families"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "small_families_large_family_id_fkey"
      columns: ["large_family_id"]
isOneToOne: false
      referencedRelation: "large_family_stats"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "agent_stats": {
                  Row: {
                    "agent_id": string | null,"complete_households": number | null,"draft_households": number | null,"full_name": string | null,"last_entry_at": string | null
                  }
                  Relationships: [
                    
                  ]
                },"census_totals": {
                  Row: {
                    "household_count": number | null,"households_last_7_days": number | null,"large_family_count": number | null,"person_count": number | null
                  }
                  Relationships: [
                    
                  ]
                },"household_search": {
                  Row: {
                    "city": string | null,"created_at": string | null,"created_by": string | null,"family_name": string | null,"id": string | null,"large_family_id": string | null,"large_family_name": string | null,"person_count": number | null,"search_all": string | null,"small_family_id": string | null,"small_family_name": string | null,"status": string | null,"wilaya": string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "households_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "agent_stats"
      referencedColumns: ["agent_id"]
    },{
      foreignKeyName: "households_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "households_small_family_id_fkey"
      columns: ["small_family_id"]
isOneToOne: false
      referencedRelation: "small_families"
      referencedColumns: ["id"]
    }
                  ]
                },"large_family_stats": {
                  Row: {
                    "household_count": number | null,"id": string | null,"name": string | null,"person_count": number | null,"small_family_count": number | null
                  }
                  Relationships: [
                    
                  ]
                },"my_households": {
                  Row: {
                    "created_at": string | null,"family_name": string | null,"id": string | null,"large_family_name": string | null,"last_step": number | null,"person_count": number | null,"search_text": string | null,"small_family_name": string | null,"status": string | null
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "find_household_by_nni":
{ Args: { "p_nni": string }; Returns: {
              "family_name": string,"id": string
            }[]
                           },
"is_active_staff":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"normalize_arabic":
{ Args: { "value": string }; Returns: string
                           },
"show_limit":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"show_trgm":
{ Args: { "": string }; Returns: (string)[]
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            
          }
        }
} as const

