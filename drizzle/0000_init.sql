CREATE TYPE "public"."availability_status" AS ENUM('available', 'limited', 'unavailable');--> statement-breakpoint
CREATE TYPE "public"."category_scope" AS ENUM('dev', 'studio', 'skill');--> statement-breakpoint
CREATE TYPE "public"."enquiry_status" AS ENUM('new', 'read', 'handled');--> statement-breakpoint
CREATE TYPE "public"."enquiry_type" AS ENUM('software', 'website', 'video_editing', 'videography', 'collaboration', 'employment', 'general');--> statement-breakpoint
CREATE TYPE "public"."media_aspect" AS ENUM('landscape', 'portrait', 'square');--> statement-breakpoint
CREATE TYPE "public"."media_kind" AS ENUM('image', 'video', 'document');--> statement-breakpoint
CREATE TYPE "public"."media_provider" AS ENUM('cloudinary', 'local');--> statement-breakpoint
CREATE TYPE "public"."publish_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope" "category_scope" NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creative_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"category_id" uuid,
	"cover_id" uuid,
	"video_id" uuid,
	"external_url" text,
	"aspect" "media_aspect" DEFAULT 'landscape' NOT NULL,
	"tools" text[] DEFAULT '{}'::text[] NOT NULL,
	"year" integer,
	"featured" boolean DEFAULT false NOT NULL,
	"status" "publish_status" DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "creative_projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"type" "enquiry_type" NOT NULL,
	"message" text NOT NULL,
	"status" "enquiry_status" DEFAULT 'new' NOT NULL,
	"email_delivered" boolean DEFAULT false NOT NULL,
	"handled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "media_kind" NOT NULL,
	"provider" "media_provider" NOT NULL,
	"public_id" text NOT NULL,
	"url" text NOT NULL,
	"poster_url" text,
	"width" integer,
	"height" integer,
	"duration_seconds" real,
	"bytes" integer,
	"format" text,
	"original_filename" text,
	"alt" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"display_name" text NOT NULL,
	"full_name" text NOT NULL,
	"dev_brand" text NOT NULL,
	"studio_brand" text NOT NULL,
	"titles" text[] DEFAULT '{}'::text[] NOT NULL,
	"hero_intro" text NOT NULL,
	"short_bio" text NOT NULL,
	"long_bio" text DEFAULT '' NOT NULL,
	"engineering_approach" text DEFAULT '' NOT NULL,
	"creative_approach" text DEFAULT '' NOT NULL,
	"open_to" text[] DEFAULT '{}'::text[] NOT NULL,
	"location" text NOT NULL,
	"email" text NOT NULL,
	"availability" "availability_status" DEFAULT 'available' NOT NULL,
	"availability_note" text DEFAULT '' NOT NULL,
	"socials" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"portrait_id" uuid,
	"cv_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_singleton" CHECK ("profile"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "project_media" (
	"project_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "project_media_project_id_media_id_pk" PRIMARY KEY("project_id","media_id")
);
--> statement-breakpoint
CREATE TABLE "project_technologies" (
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "project_technologies_project_id_name_pk" PRIMARY KEY("project_id","name")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"summary" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"stage" text DEFAULT '' NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"confidentiality_note" text DEFAULT '' NOT NULL,
	"category_id" uuid,
	"cover_id" uuid,
	"repo_url" text,
	"demo_url" text,
	"year" integer,
	"featured" boolean DEFAULT false NOT NULL,
	"status" "publish_status" DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"window_start" timestamp with time zone DEFAULT now() NOT NULL,
	"locked_until" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"category_id" uuid NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creative_projects" ADD CONSTRAINT "creative_projects_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creative_projects" ADD CONSTRAINT "creative_projects_cover_id_media_assets_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creative_projects" ADD CONSTRAINT "creative_projects_video_id_media_assets_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_portrait_id_media_assets_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_cv_id_media_assets_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_id_media_assets_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_scope_slug_idx" ON "categories" USING btree ("scope","slug");--> statement-breakpoint
CREATE INDEX "creative_listing_idx" ON "creative_projects" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "enquiries_inbox_idx" ON "enquiries" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "media_provider_public_id_idx" ON "media_assets" USING btree ("provider","public_id");--> statement-breakpoint
CREATE INDEX "projects_listing_idx" ON "projects" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "skills_category_idx" ON "skills" USING btree ("category_id","sort_order");