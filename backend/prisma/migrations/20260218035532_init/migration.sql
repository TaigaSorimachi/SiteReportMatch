-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_name" VARCHAR(200) NOT NULL,
    "company_name_kana" VARCHAR(200),
    "company_type" VARCHAR(30) NOT NULL,
    "corporate_number" VARCHAR(13),
    "representative" VARCHAR(100),
    "postal_code" VARCHAR(8),
    "address" VARCHAR(300),
    "address_lat" DECIMAL(10,7),
    "address_lng" DECIMAL(10,7),
    "phone" VARCHAR(20),
    "fax" VARCHAR(20),
    "email" VARCHAR(200),
    "website" VARCHAR(300),
    "invoice_reg_no" VARCHAR(20),
    "ccus_company_id" VARCHAR(30),
    "bank_name" VARCHAR(100),
    "bank_branch" VARCHAR(100),
    "bank_account_type" VARCHAR(10),
    "bank_account_no" VARCHAR(20),
    "bank_account_name" VARCHAR(100),
    "payment_terms" VARCHAR(100),
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "default_report_mode" VARCHAR(20) NOT NULL DEFAULT 'selectable',
    "allow_worker_mode_switch" BOOLEAN NOT NULL DEFAULT true,
    "require_photo" BOOLEAN NOT NULL DEFAULT false,
    "require_safety_record" BOOLEAN NOT NULL DEFAULT false,
    "gps_enabled" BOOLEAN NOT NULL DEFAULT false,
    "gps_worker_can_disable" BOOLEAN NOT NULL DEFAULT false,
    "geofence_enabled" BOOLEAN NOT NULL DEFAULT false,
    "geofence_radius_m" INTEGER NOT NULL DEFAULT 300,
    "matching_enabled" BOOLEAN NOT NULL DEFAULT true,
    "matching_auto_approve" BOOLEAN NOT NULL DEFAULT false,
    "standard_work_hours" DECIMAL(3,1) NOT NULL DEFAULT 8.0,
    "overtime_threshold_hours" DECIMAL(3,1) NOT NULL DEFAULT 8.0,
    "extra" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID,
    "line_user_id" VARCHAR(50),
    "line_display_name" VARCHAR(100),
    "last_name" VARCHAR(50) NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name_kana" VARCHAR(50),
    "first_name_kana" VARCHAR(50),
    "email" VARCHAR(200),
    "phone" VARCHAR(20),
    "birth_date" DATE,
    "gender" VARCHAR(10),
    "avatar_url" VARCHAR(500),
    "postal_code" VARCHAR(8),
    "address" VARCHAR(300),
    "address_lat" DECIMAL(10,7),
    "address_lng" DECIMAL(10,7),
    "role" VARCHAR(30) NOT NULL,
    "is_individual" BOOLEAN NOT NULL DEFAULT false,
    "default_daily_rate" INTEGER,
    "default_hourly_rate" INTEGER,
    "employment_status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "availability" VARCHAR(20) NOT NULL DEFAULT 'available',
    "ccus_worker_id" VARCHAR(30),
    "tax_category" VARCHAR(20),
    "my_number_stored" BOOLEAN NOT NULL DEFAULT false,
    "line_notify_enabled" BOOLEAN NOT NULL DEFAULT true,
    "gps_personal_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "license_master" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "license_name" VARCHAR(200) NOT NULL,
    "license_category" VARCHAR(50),
    "has_expiry" BOOLEAN NOT NULL DEFAULT false,
    "renewal_months" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "license_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_licenses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "license_id" UUID NOT NULL,
    "license_number" VARCHAR(50),
    "issued_date" DATE,
    "expiry_date" DATE,
    "issuing_authority" VARCHAR(200),
    "document_url" VARCHAR(500),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "experience_years" INTEGER,
    "skill_level" VARCHAR(20),
    "specialties" TEXT,
    "career_summary" TEXT,
    "preferred_area" VARCHAR(300),
    "max_commute_km" INTEGER NOT NULL DEFAULT 50,
    "has_vehicle" BOOLEAN NOT NULL DEFAULT false,
    "has_own_tools" BOOLEAN NOT NULL DEFAULT false,
    "can_drive_truck" BOOLEAN NOT NULL DEFAULT false,
    "available_hours" VARCHAR(50),
    "desired_daily_min" INTEGER,
    "desired_daily_max" INTEGER,
    "desired_monthly" INTEGER,
    "total_projects" INTEGER NOT NULL DEFAULT 0,
    "total_work_days" INTEGER NOT NULL DEFAULT 0,
    "avg_rating" DECIMAL(2,1) NOT NULL DEFAULT 0.0,
    "attendance_rate" DECIMAL(4,1) NOT NULL DEFAULT 100.0,
    "repeat_rate" DECIMAL(4,1) NOT NULL DEFAULT 0.0,
    "cancel_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_type_master" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "parent_id" UUID,
    "work_type_name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50),
    "level" INTEGER NOT NULL DEFAULT 1,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_type_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_skills" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "work_type_id" UUID NOT NULL,
    "proficiency" VARCHAR(20) NOT NULL DEFAULT 'capable',
    "years_experience" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_evaluations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "worker_id" UUID NOT NULL,
    "evaluator_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "evaluation_date" DATE NOT NULL,
    "rating_skill" INTEGER,
    "rating_speed" INTEGER,
    "rating_attitude" INTEGER,
    "rating_safety" INTEGER,
    "rating_communication" INTEGER,
    "rating_overall" DECIMAL(2,1),
    "comment" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_availability" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "target_date" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'available',
    "project_id" UUID,
    "notes" VARCHAR(200),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "structure_master" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "structure_name" VARCHAR(50) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "structure_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "project_code" VARCHAR(50),
    "project_name" VARCHAR(300) NOT NULL,
    "description" TEXT,
    "client_company_id" UUID,
    "prime_contractor_id" UUID,
    "contract_tier" INTEGER NOT NULL DEFAULT 1,
    "primary_work_type_id" UUID,
    "structure_id" UUID,
    "floor_count" INTEGER,
    "property_type" VARCHAR(50),
    "site_name" VARCHAR(200),
    "site_postal_code" VARCHAR(8),
    "site_prefecture" VARCHAR(10),
    "site_city" VARCHAR(50),
    "site_address" VARCHAR(300),
    "site_lat" DECIMAL(10,7),
    "site_lng" DECIMAL(10,7),
    "geofence_radius_m" INTEGER NOT NULL DEFAULT 300,
    "scheduled_start" DATE,
    "scheduled_end" DATE,
    "actual_start" DATE,
    "actual_end" DATE,
    "contract_amount" BIGINT,
    "estimated_cost" BIGINT,
    "tax_rate" DECIMAL(4,2) NOT NULL DEFAULT 10.00,
    "safety_doc_system" VARCHAR(100),
    "ccus_required" BOOLEAN NOT NULL DEFAULT false,
    "sales_person_id" UUID,
    "site_manager_id" UUID,
    "foreman_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'planning',
    "notes" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_phases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "phase_name" VARCHAR(200) NOT NULL,
    "work_type_id" UUID,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "scheduled_start" DATE,
    "scheduled_end" DATE,
    "actual_start" DATE,
    "actual_end" DATE,
    "progress_pct" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_staffing" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "work_type_id" UUID,
    "target_date" DATE NOT NULL,
    "required_count" INTEGER NOT NULL DEFAULT 1,
    "confirmed_count" INTEGER NOT NULL DEFAULT 0,
    "notes" VARCHAR(200),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_staffing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "target_date" DATE NOT NULL,
    "work_type_id" UUID,
    "contract_type" VARCHAR(20) NOT NULL,
    "daily_rate" INTEGER,
    "hourly_rate" INTEGER,
    "source" VARCHAR(20) NOT NULL DEFAULT 'direct',
    "demand_posting_id" UUID,
    "supply_posting_id" UUID,
    "contract_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'confirmed',
    "cancelled_at" TIMESTAMPTZ,
    "cancel_reason" VARCHAR(200),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "doc_type" VARCHAR(30),
    "doc_name" VARCHAR(300) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "file_size_bytes" BIGINT,
    "uploaded_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "assignment_id" UUID,
    "worker_id" UUID NOT NULL,
    "report_date" DATE NOT NULL,
    "input_mode" VARCHAR(20) NOT NULL,
    "clock_in" TIMESTAMPTZ,
    "clock_out" TIMESTAMPTZ,
    "break_minutes" INTEGER NOT NULL DEFAULT 0,
    "work_minutes" INTEGER,
    "man_days" DECIMAL(4,2),
    "overtime_minutes" INTEGER NOT NULL DEFAULT 0,
    "clock_in_lat" DECIMAL(10,7),
    "clock_in_lng" DECIMAL(10,7),
    "clock_out_lat" DECIMAL(10,7),
    "clock_out_lng" DECIMAL(10,7),
    "work_content" TEXT,
    "progress_pct" DECIMAL(5,2),
    "weather" VARCHAR(20),
    "temperature" DECIMAL(3,1),
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "submitted_at" TIMESTAMPTZ,
    "approved_by" UUID,
    "approved_at" TIMESTAMPTZ,
    "rejection_reason" TEXT,
    "notes" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_cost_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "report_id" UUID NOT NULL,
    "cost_type" VARCHAR(20) NOT NULL,
    "item_name" VARCHAR(200) NOT NULL,
    "quantity" DECIMAL(10,2),
    "unit" VARCHAR(20),
    "unit_price" DECIMAL(12,2),
    "amount" DECIMAL(12,2),
    "notes" VARCHAR(200),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_cost_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_photos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "report_id" UUID NOT NULL,
    "photo_url" VARCHAR(500) NOT NULL,
    "photo_type" VARCHAR(20),
    "caption" VARCHAR(200),
    "taken_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "report_id" UUID,
    "project_id" UUID NOT NULL,
    "recorded_by" UUID NOT NULL,
    "record_date" DATE NOT NULL,
    "hazard_identified" TEXT NOT NULL,
    "countermeasure" TEXT NOT NULL,
    "safety_officer" VARCHAR(100),
    "participants" UUID[],
    "participant_count" INTEGER,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "break_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "report_id" UUID NOT NULL,
    "break_start" TIMESTAMPTZ NOT NULL,
    "break_end" TIMESTAMPTZ,
    "break_minutes" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "break_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "event_type" VARCHAR(20) NOT NULL,
    "recorded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "accuracy_m" DECIMAL(6,1),
    "project_id" UUID,
    "report_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geofence_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "event_type" VARCHAR(10) NOT NULL,
    "event_at" TIMESTAMPTZ NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "accuracy_m" DECIMAL(6,1),
    "distance_m" DECIMAL(8,1),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "geofence_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_postings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "project_id" UUID,
    "posted_by" UUID NOT NULL,
    "site_name" VARCHAR(300) NOT NULL,
    "site_prefecture" VARCHAR(10) NOT NULL,
    "site_city" VARCHAR(50) NOT NULL,
    "site_address" VARCHAR(300),
    "site_lat" DECIMAL(10,7),
    "site_lng" DECIMAL(10,7),
    "contract_type" VARCHAR(20) NOT NULL,
    "work_type_id" UUID NOT NULL,
    "work_type_sub_id" UUID,
    "work_date_start" DATE NOT NULL,
    "work_date_end" DATE NOT NULL,
    "required_count" INTEGER NOT NULL DEFAULT 1,
    "daily_rate_min" INTEGER,
    "daily_rate_max" INTEGER,
    "fixed_price" BIGINT,
    "fixed_scope" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "structure_id" UUID,
    "floor_count" INTEGER,
    "prime_contractor" VARCHAR(200),
    "contract_tier" INTEGER,
    "work_time_start" TIME,
    "work_time_end" TIME,
    "transportation_type" VARCHAR(20),
    "transportation_note" VARCHAR(200),
    "safety_doc_system" VARCHAR(100),
    "ccus_required" BOOLEAN NOT NULL DEFAULT false,
    "required_skill_level" VARCHAR(20),
    "required_licenses" UUID[],
    "provides_parking" BOOLEAN NOT NULL DEFAULT false,
    "provides_tools" BOOLEAN NOT NULL DEFAULT false,
    "provides_meals" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "notes" TEXT,
    "confirmed_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMPTZ,
    "expires_at" TIMESTAMPTZ,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "application_count" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demand_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "posting_id" UUID NOT NULL,
    "applicant_id" UUID NOT NULL,
    "applicant_company_id" UUID,
    "applicant_type" VARCHAR(20) NOT NULL,
    "proposed_rate" INTEGER,
    "proposed_price" BIGINT,
    "available_count" INTEGER NOT NULL DEFAULT 1,
    "available_dates" DATE[],
    "message" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "responded_at" TIMESTAMPTZ,
    "responded_by" UUID,
    "rejection_reason" VARCHAR(300),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demand_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "posting_id" UUID NOT NULL,
    "application_id" UUID,
    "sender_id" UUID NOT NULL,
    "message_text" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demand_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_postings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID,
    "user_id" UUID NOT NULL,
    "is_self_posting" BOOLEAN NOT NULL DEFAULT true,
    "work_type_id" UUID NOT NULL,
    "work_type_sub_id" UUID,
    "contract_type" VARCHAR(20) NOT NULL,
    "desired_daily_rate" INTEGER,
    "desired_monthly_rate" INTEGER,
    "available_start" DATE NOT NULL,
    "available_end" DATE NOT NULL,
    "available_hours" VARCHAR(50),
    "available_prefecture" VARCHAR(10) NOT NULL,
    "available_area" VARCHAR(200),
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "skill_level" VARCHAR(20),
    "experience_years" INTEGER,
    "licenses" UUID[],
    "portfolio_text" TEXT,
    "ccus_worker_id" VARCHAR(30),
    "has_vehicle" BOOLEAN,
    "has_own_tools" BOOLEAN,
    "transportation_type" VARCHAR(20),
    "title" VARCHAR(300),
    "description" TEXT,
    "notes" TEXT,
    "published_at" TIMESTAMPTZ,
    "expires_at" TIMESTAMPTZ,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "inquiry_count" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supply_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_inquiries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supply_posting_id" UUID NOT NULL,
    "inquirer_id" UUID NOT NULL,
    "inquirer_company_id" UUID,
    "project_id" UUID,
    "proposed_rate" INTEGER,
    "proposed_period" VARCHAR(100),
    "message" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "responded_at" TIMESTAMPTZ,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supply_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supply_posting_id" UUID NOT NULL,
    "inquiry_id" UUID,
    "sender_id" UUID NOT NULL,
    "message_text" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supply_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_contracts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "demand_posting_id" UUID,
    "demand_app_id" UUID,
    "supply_posting_id" UUID,
    "supply_inquiry_id" UUID,
    "client_company_id" UUID NOT NULL,
    "worker_user_id" UUID NOT NULL,
    "worker_company_id" UUID,
    "project_id" UUID,
    "contract_type" VARCHAR(20) NOT NULL,
    "agreed_daily_rate" INTEGER,
    "agreed_fixed_price" BIGINT,
    "work_date_start" DATE NOT NULL,
    "work_date_end" DATE NOT NULL,
    "agreed_count" INTEGER NOT NULL DEFAULT 1,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "completed_at" TIMESTAMPTZ,
    "cancelled_at" TIMESTAMPTZ,
    "cancel_reason" VARCHAR(300),
    "matched_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "time_to_match_hours" DECIMAL(8,1),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contract_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "reviewee_id" UUID NOT NULL,
    "review_type" VARCHAR(20) NOT NULL,
    "rating" INTEGER,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_cancel_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contract_id" UUID,
    "demand_posting_id" UUID,
    "supply_posting_id" UUID,
    "cancelled_by" UUID NOT NULL,
    "cancel_reason" VARCHAR(300),
    "cancel_type" VARCHAR(20),
    "penalty_amount" INTEGER NOT NULL DEFAULT 0,
    "cancelled_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_cancel_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_field_defs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "target_type" VARCHAR(20) NOT NULL,
    "field_label" VARCHAR(100) NOT NULL,
    "field_key" VARCHAR(50) NOT NULL,
    "input_type" VARCHAR(20) NOT NULL,
    "options" JSONB,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "placeholder" VARCHAR(200),
    "help_text" VARCHAR(300),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_field_defs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_field_vals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "field_def_id" UUID NOT NULL,
    "target_type" VARCHAR(20) NOT NULL,
    "target_id" UUID NOT NULL,
    "field_value" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_field_vals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_master" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_code" VARCHAR(10) NOT NULL,
    "account_name" VARCHAR(100) NOT NULL,
    "account_type" VARCHAR(30),
    "parent_code" VARCHAR(10),
    "is_construction" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "client_company_id" UUID NOT NULL,
    "project_id" UUID,
    "invoice_number" VARCHAR(50) NOT NULL,
    "invoice_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "billing_type" VARCHAR(20),
    "subtotal" BIGINT NOT NULL,
    "tax_amount" BIGINT NOT NULL,
    "total_amount" BIGINT NOT NULL,
    "tax_rate" DECIMAL(4,2) NOT NULL DEFAULT 10.00,
    "qualified_invoice" BOOLEAN NOT NULL DEFAULT true,
    "invoice_reg_no" VARCHAR(20),
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "issued_at" TIMESTAMPTZ,
    "sent_at" TIMESTAMPTZ,
    "paid_at" TIMESTAMPTZ,
    "pdf_url" VARCHAR(500),
    "notes" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_lines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_id" UUID NOT NULL,
    "line_order" INTEGER NOT NULL DEFAULT 0,
    "description" VARCHAR(300) NOT NULL,
    "quantity" DECIMAL(10,2),
    "unit" VARCHAR(20),
    "unit_price" DECIMAL(12,2),
    "amount" BIGINT NOT NULL,
    "tax_category" VARCHAR(10) NOT NULL DEFAULT 'taxable',
    "account_id" UUID,
    "project_phase_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments_received" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_id" UUID NOT NULL,
    "payment_date" DATE NOT NULL,
    "amount" BIGINT NOT NULL,
    "payment_method" VARCHAR(20),
    "bank_ref" VARCHAR(100),
    "notes" VARCHAR(200),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_received_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "payment_date" DATE,
    "gross_amount" BIGINT NOT NULL,
    "withholding_tax" BIGINT NOT NULL DEFAULT 0,
    "deductions" BIGINT NOT NULL DEFAULT 0,
    "net_amount" BIGINT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "paid_at" TIMESTAMPTZ,
    "notes" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_lines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "payroll_id" UUID NOT NULL,
    "project_id" UUID,
    "assignment_id" UUID,
    "work_date" DATE,
    "man_days" DECIMAL(4,2),
    "daily_rate" INTEGER,
    "amount" BIGINT NOT NULL,
    "description" VARCHAR(200),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_ledger" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "account_id" UUID,
    "cost_category" VARCHAR(30) NOT NULL,
    "transaction_date" DATE NOT NULL,
    "description" VARCHAR(300),
    "amount" BIGINT NOT NULL,
    "source_type" VARCHAR(20),
    "source_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "channel" VARCHAR(20) NOT NULL,
    "notification_type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200),
    "body" TEXT,
    "related_type" VARCHAR(30),
    "related_id" UUID,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_corporate_number_key" ON "companies"("corporate_number");

-- CreateIndex
CREATE UNIQUE INDEX "company_settings_company_id_key" ON "company_settings"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_line_user_id_key" ON "users"("line_user_id");

-- CreateIndex
CREATE INDEX "users_company_id_idx" ON "users"("company_id");

-- CreateIndex
CREATE INDEX "users_availability_idx" ON "users"("availability");

-- CreateIndex
CREATE INDEX "users_line_user_id_idx" ON "users"("line_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_licenses_user_id_license_id_key" ON "user_licenses"("user_id", "license_id");

-- CreateIndex
CREATE UNIQUE INDEX "worker_profiles_user_id_key" ON "worker_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "worker_skills_user_id_work_type_id_key" ON "worker_skills"("user_id", "work_type_id");

-- CreateIndex
CREATE INDEX "worker_availability_target_date_status_idx" ON "worker_availability"("target_date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "worker_availability_user_id_target_date_key" ON "worker_availability"("user_id", "target_date");

-- CreateIndex
CREATE UNIQUE INDEX "projects_project_code_key" ON "projects"("project_code");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_scheduled_start_scheduled_end_idx" ON "projects"("scheduled_start", "scheduled_end");

-- CreateIndex
CREATE UNIQUE INDEX "project_staffing_project_id_work_type_id_target_date_key" ON "project_staffing"("project_id", "work_type_id", "target_date");

-- CreateIndex
CREATE UNIQUE INDEX "project_assignments_user_id_target_date_key" ON "project_assignments"("user_id", "target_date");

-- CreateIndex
CREATE INDEX "daily_reports_report_date_idx" ON "daily_reports"("report_date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_reports_worker_id_report_date_project_id_key" ON "daily_reports"("worker_id", "report_date", "project_id");

-- CreateIndex
CREATE INDEX "location_logs_user_id_recorded_at_idx" ON "location_logs"("user_id", "recorded_at");

-- CreateIndex
CREATE INDEX "geofence_events_project_id_event_at_idx" ON "geofence_events"("project_id", "event_at");

-- CreateIndex
CREATE INDEX "demand_postings_status_work_date_start_idx" ON "demand_postings"("status", "work_date_start");

-- CreateIndex
CREATE INDEX "demand_postings_site_prefecture_site_city_idx" ON "demand_postings"("site_prefecture", "site_city");

-- CreateIndex
CREATE INDEX "demand_postings_contract_type_work_type_id_idx" ON "demand_postings"("contract_type", "work_type_id");

-- CreateIndex
CREATE INDEX "demand_applications_posting_id_status_idx" ON "demand_applications"("posting_id", "status");

-- CreateIndex
CREATE INDEX "supply_postings_status_available_start_idx" ON "supply_postings"("status", "available_start");

-- CreateIndex
CREATE INDEX "supply_postings_available_prefecture_idx" ON "supply_postings"("available_prefecture");

-- CreateIndex
CREATE UNIQUE INDEX "custom_field_defs_company_id_target_type_field_key_key" ON "custom_field_defs"("company_id", "target_type", "field_key");

-- CreateIndex
CREATE INDEX "custom_field_vals_target_type_target_id_idx" ON "custom_field_vals"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "custom_field_vals_field_def_id_idx" ON "custom_field_vals"("field_def_id");

-- CreateIndex
CREATE UNIQUE INDEX "custom_field_vals_field_def_id_target_id_key" ON "custom_field_vals"("field_def_id", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_master_account_code_key" ON "account_master"("account_code");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "cost_ledger_project_id_cost_category_idx" ON "cost_ledger"("project_id", "cost_category");

-- AddForeignKey
ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_licenses" ADD CONSTRAINT "user_licenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_licenses" ADD CONSTRAINT "user_licenses_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "license_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_profiles" ADD CONSTRAINT "worker_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_type_master" ADD CONSTRAINT "work_type_master_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "work_type_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_skills" ADD CONSTRAINT "worker_skills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_skills" ADD CONSTRAINT "worker_skills_work_type_id_fkey" FOREIGN KEY ("work_type_id") REFERENCES "work_type_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_evaluations" ADD CONSTRAINT "worker_evaluations_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_evaluations" ADD CONSTRAINT "worker_evaluations_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_evaluations" ADD CONSTRAINT "worker_evaluations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_availability" ADD CONSTRAINT "worker_availability_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_availability" ADD CONSTRAINT "worker_availability_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_company_id_fkey" FOREIGN KEY ("client_company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_prime_contractor_id_fkey" FOREIGN KEY ("prime_contractor_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_primary_work_type_id_fkey" FOREIGN KEY ("primary_work_type_id") REFERENCES "work_type_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_structure_id_fkey" FOREIGN KEY ("structure_id") REFERENCES "structure_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_sales_person_id_fkey" FOREIGN KEY ("sales_person_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_site_manager_id_fkey" FOREIGN KEY ("site_manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_foreman_id_fkey" FOREIGN KEY ("foreman_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_phases" ADD CONSTRAINT "project_phases_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_phases" ADD CONSTRAINT "project_phases_work_type_id_fkey" FOREIGN KEY ("work_type_id") REFERENCES "work_type_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_staffing" ADD CONSTRAINT "project_staffing_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_staffing" ADD CONSTRAINT "project_staffing_work_type_id_fkey" FOREIGN KEY ("work_type_id") REFERENCES "work_type_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_assignments" ADD CONSTRAINT "project_assignments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_assignments" ADD CONSTRAINT "project_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_assignments" ADD CONSTRAINT "project_assignments_work_type_id_fkey" FOREIGN KEY ("work_type_id") REFERENCES "work_type_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_assignments" ADD CONSTRAINT "project_assignments_demand_posting_id_fkey" FOREIGN KEY ("demand_posting_id") REFERENCES "demand_postings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_assignments" ADD CONSTRAINT "project_assignments_supply_posting_id_fkey" FOREIGN KEY ("supply_posting_id") REFERENCES "supply_postings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_assignments" ADD CONSTRAINT "project_assignments_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "match_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "project_assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cost_items" ADD CONSTRAINT "report_cost_items_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_photos" ADD CONSTRAINT "report_photos_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_records" ADD CONSTRAINT "safety_records_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "daily_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_records" ADD CONSTRAINT "safety_records_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_records" ADD CONSTRAINT "safety_records_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "break_logs" ADD CONSTRAINT "break_logs_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_logs" ADD CONSTRAINT "location_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_logs" ADD CONSTRAINT "location_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_logs" ADD CONSTRAINT "location_logs_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "daily_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geofence_events" ADD CONSTRAINT "geofence_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geofence_events" ADD CONSTRAINT "geofence_events_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_postings" ADD CONSTRAINT "demand_postings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_postings" ADD CONSTRAINT "demand_postings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_postings" ADD CONSTRAINT "demand_postings_posted_by_fkey" FOREIGN KEY ("posted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_postings" ADD CONSTRAINT "demand_postings_work_type_id_fkey" FOREIGN KEY ("work_type_id") REFERENCES "work_type_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_postings" ADD CONSTRAINT "demand_postings_work_type_sub_id_fkey" FOREIGN KEY ("work_type_sub_id") REFERENCES "work_type_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_postings" ADD CONSTRAINT "demand_postings_structure_id_fkey" FOREIGN KEY ("structure_id") REFERENCES "structure_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_applications" ADD CONSTRAINT "demand_applications_posting_id_fkey" FOREIGN KEY ("posting_id") REFERENCES "demand_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_applications" ADD CONSTRAINT "demand_applications_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_applications" ADD CONSTRAINT "demand_applications_responded_by_fkey" FOREIGN KEY ("responded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_messages" ADD CONSTRAINT "demand_messages_posting_id_fkey" FOREIGN KEY ("posting_id") REFERENCES "demand_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_messages" ADD CONSTRAINT "demand_messages_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "demand_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_messages" ADD CONSTRAINT "demand_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_postings" ADD CONSTRAINT "supply_postings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_postings" ADD CONSTRAINT "supply_postings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_postings" ADD CONSTRAINT "supply_postings_work_type_id_fkey" FOREIGN KEY ("work_type_id") REFERENCES "work_type_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_postings" ADD CONSTRAINT "supply_postings_work_type_sub_id_fkey" FOREIGN KEY ("work_type_sub_id") REFERENCES "work_type_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_inquiries" ADD CONSTRAINT "supply_inquiries_supply_posting_id_fkey" FOREIGN KEY ("supply_posting_id") REFERENCES "supply_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_inquiries" ADD CONSTRAINT "supply_inquiries_inquirer_id_fkey" FOREIGN KEY ("inquirer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_inquiries" ADD CONSTRAINT "supply_inquiries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_messages" ADD CONSTRAINT "supply_messages_supply_posting_id_fkey" FOREIGN KEY ("supply_posting_id") REFERENCES "supply_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_messages" ADD CONSTRAINT "supply_messages_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "supply_inquiries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_messages" ADD CONSTRAINT "supply_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_contracts" ADD CONSTRAINT "match_contracts_demand_posting_id_fkey" FOREIGN KEY ("demand_posting_id") REFERENCES "demand_postings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_contracts" ADD CONSTRAINT "match_contracts_demand_app_id_fkey" FOREIGN KEY ("demand_app_id") REFERENCES "demand_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_contracts" ADD CONSTRAINT "match_contracts_supply_posting_id_fkey" FOREIGN KEY ("supply_posting_id") REFERENCES "supply_postings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_contracts" ADD CONSTRAINT "match_contracts_supply_inquiry_id_fkey" FOREIGN KEY ("supply_inquiry_id") REFERENCES "supply_inquiries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_contracts" ADD CONSTRAINT "match_contracts_client_company_id_fkey" FOREIGN KEY ("client_company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_contracts" ADD CONSTRAINT "match_contracts_worker_user_id_fkey" FOREIGN KEY ("worker_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_contracts" ADD CONSTRAINT "match_contracts_worker_company_id_fkey" FOREIGN KEY ("worker_company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_contracts" ADD CONSTRAINT "match_contracts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_reviews" ADD CONSTRAINT "match_reviews_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "match_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_reviews" ADD CONSTRAINT "match_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_reviews" ADD CONSTRAINT "match_reviews_reviewee_id_fkey" FOREIGN KEY ("reviewee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_cancel_logs" ADD CONSTRAINT "match_cancel_logs_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "match_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_cancel_logs" ADD CONSTRAINT "match_cancel_logs_demand_posting_id_fkey" FOREIGN KEY ("demand_posting_id") REFERENCES "demand_postings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_cancel_logs" ADD CONSTRAINT "match_cancel_logs_supply_posting_id_fkey" FOREIGN KEY ("supply_posting_id") REFERENCES "supply_postings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_cancel_logs" ADD CONSTRAINT "match_cancel_logs_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_field_defs" ADD CONSTRAINT "custom_field_defs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_field_vals" ADD CONSTRAINT "custom_field_vals_field_def_id_fkey" FOREIGN KEY ("field_def_id") REFERENCES "custom_field_defs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_company_id_fkey" FOREIGN KEY ("client_company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_project_phase_id_fkey" FOREIGN KEY ("project_phase_id") REFERENCES "project_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments_received" ADD CONSTRAINT "payments_received_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll" ADD CONSTRAINT "payroll_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll" ADD CONSTRAINT "payroll_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_lines" ADD CONSTRAINT "payroll_lines_payroll_id_fkey" FOREIGN KEY ("payroll_id") REFERENCES "payroll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_lines" ADD CONSTRAINT "payroll_lines_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_lines" ADD CONSTRAINT "payroll_lines_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "project_assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_ledger" ADD CONSTRAINT "cost_ledger_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_ledger" ADD CONSTRAINT "cost_ledger_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_ledger" ADD CONSTRAINT "cost_ledger_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
