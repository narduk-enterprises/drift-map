CREATE TABLE IF NOT EXISTS `collaborators` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'viewer' NOT NULL,
	`invite_token` text NOT NULL,
	`accepted_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `collaborators_invite_token_unique` ON `collaborators` (`invite_token`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `collaborators_trip_email_idx` ON `collaborators` (`trip_id`,`email`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `stops` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`latitude` real,
	`longitude` real,
	`address` text DEFAULT '' NOT NULL,
	`category` text DEFAULT 'activity' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`photo_keys` text DEFAULT '[]' NOT NULL,
	`url` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `trip_days`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `stops_day_sort_order_idx` ON `stops` (`day_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `trip_days` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`day_number` integer NOT NULL,
	`date` text NOT NULL,
	`title` text,
	`notes` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `trip_days_trip_day_number_idx` ON `trip_days` (`trip_id`,`day_number`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `trips` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`cover_image_key` text,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`share_slug` text NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `trips_share_slug_unique` ON `trips` (`share_slug`);
