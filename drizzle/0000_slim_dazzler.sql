CREATE TABLE "alert_deliveries" (
	"id" uuid PRIMARY KEY NOT NULL,
	"regulatory_update_id" uuid NOT NULL,
	"subscription_id" uuid NOT NULL,
	"channel" text NOT NULL,
	"status" text NOT NULL,
	"attempted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delivered_at" timestamp with time zone,
	"provider_message_id" text,
	"error_text" text
);
--> statement-breakpoint
CREATE TABLE "alert_subscriptions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid,
	"user_id" uuid,
	"channel" text NOT NULL,
	"destination" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_accounts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_customer_id" text NOT NULL,
	"billing_email" text,
	"currency_code" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"billing_account_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_subscription_id" text,
	"plan_id" text NOT NULL,
	"status" text NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"trial_end" timestamp with time zone,
	"cancel_at" timestamp with time zone,
	"provider_updated_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_subscribers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"source" text NOT NULL,
	"subscribed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regulatory_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"jurisdiction_code" text NOT NULL,
	"feed_url" text,
	"active" boolean DEFAULT true NOT NULL,
	"last_crawled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regulatory_updates" (
	"id" uuid PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"jurisdiction_code" text NOT NULL,
	"regulator" text NOT NULL,
	"update_type" text NOT NULL,
	"severity" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"canonical_url" text NOT NULL,
	"source_published_at" timestamp with time zone NOT NULL,
	"effective_at" timestamp with time zone,
	"deadline_at" timestamp with time zone,
	"content_hash" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"is_primary_contact" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_members_pkey" PRIMARY KEY("organization_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"legal_name" text NOT NULL,
	"display_name" text,
	"website_url" text,
	"primary_jurisdiction_code" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"clerk_user_id" text NOT NULL,
	"primary_email" text,
	"first_name" text,
	"last_name" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"external_event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"organization_id" uuid,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"error_text" text
);
--> statement-breakpoint
ALTER TABLE "alert_deliveries" ADD CONSTRAINT "alert_deliveries_regulatory_update_id_regulatory_updates_id_fk" FOREIGN KEY ("regulatory_update_id") REFERENCES "public"."regulatory_updates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_deliveries" ADD CONSTRAINT "alert_deliveries_subscription_id_alert_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."alert_subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_subscriptions" ADD CONSTRAINT "alert_subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_subscriptions" ADD CONSTRAINT "alert_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_accounts" ADD CONSTRAINT "billing_accounts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_billing_account_id_billing_accounts_id_fk" FOREIGN KEY ("billing_account_id") REFERENCES "public"."billing_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regulatory_updates" ADD CONSTRAINT "regulatory_updates_source_id_regulatory_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."regulatory_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "alert_deliveries_update_subscription_channel_uidx" ON "alert_deliveries" USING btree ("regulatory_update_id","subscription_id","channel");--> statement-breakpoint
CREATE INDEX "alert_deliveries_status_attempted_idx" ON "alert_deliveries" USING btree ("status","attempted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "alert_subscriptions_channel_destination_uidx" ON "alert_subscriptions" USING btree ("channel","destination");--> statement-breakpoint
CREATE INDEX "alert_subscriptions_organization_active_idx" ON "alert_subscriptions" USING btree ("organization_id","active");--> statement-breakpoint
CREATE UNIQUE INDEX "billing_accounts_org_uidx" ON "billing_accounts" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "billing_accounts_provider_customer_uidx" ON "billing_accounts" USING btree ("provider","provider_customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_provider_subscription_uidx" ON "subscriptions" USING btree ("provider","provider_subscription_id");--> statement-breakpoint
CREATE INDEX "subscriptions_org_status_idx" ON "subscriptions" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "subscriptions_plan_status_idx" ON "subscriptions" USING btree ("plan_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "marketing_subscribers_email_uidx" ON "marketing_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "marketing_subscribers_source_subscribed_idx" ON "marketing_subscribers" USING btree ("source","subscribed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "regulatory_updates_source_content_uidx" ON "regulatory_updates" USING btree ("source_id","content_hash");--> statement-breakpoint
CREATE INDEX "regulatory_updates_jurisdiction_published_idx" ON "regulatory_updates" USING btree ("jurisdiction_code","source_published_at");--> statement-breakpoint
CREATE INDEX "regulatory_updates_severity_published_idx" ON "regulatory_updates" USING btree ("severity","source_published_at");--> statement-breakpoint
CREATE INDEX "organization_members_user_org_idx" ON "organization_members" USING btree ("user_id","organization_id");--> statement-breakpoint
CREATE INDEX "organization_members_org_role_idx" ON "organization_members" USING btree ("organization_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_uidx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "organizations_jurisdiction_idx" ON "organizations" USING btree ("primary_jurisdiction_code");--> statement-breakpoint
CREATE UNIQUE INDEX "users_clerk_user_id_uidx" ON "users" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "users_primary_email_idx" ON "users" USING btree ("primary_email");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_events_provider_external_uidx" ON "webhook_events" USING btree ("provider","external_event_id");--> statement-breakpoint
CREATE INDEX "webhook_events_provider_status_idx" ON "webhook_events" USING btree ("provider","status","received_at");--> statement-breakpoint
CREATE INDEX "webhook_events_organization_received_idx" ON "webhook_events" USING btree ("organization_id","received_at");