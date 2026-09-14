ALTER TABLE "patients" ADD COLUMN "gender" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "rg" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "profession" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "landline" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "emergency_contact" jsonb;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "address" jsonb;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "automatic_reminders" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "how_found_us" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "categories" text[];--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "responsible_name" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "responsible_cpf" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "insurance_data" jsonb;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "self_registration_token" uuid;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "self_registration_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_self_registration_token_unique" UNIQUE("self_registration_token");