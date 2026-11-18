ALTER TABLE "creative_projects" ADD COLUMN "is_sample" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "is_sample" boolean DEFAULT false NOT NULL;