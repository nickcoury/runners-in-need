CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`pledge_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`pledge_id`) REFERENCES `pledges`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `needs` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`category_tag` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`extras_welcome` integer DEFAULT false NOT NULL,
	`location` text NOT NULL,
	`latitude` real,
	`longitude` real,
	`status` text DEFAULT 'active' NOT NULL,
	`continued_from_id` text,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`continued_from_id`) REFERENCES `needs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`location` text NOT NULL,
	`latitude` real,
	`longitude` real,
	`shipping_address` text,
	`shipping_attn` text,
	`show_shipping_address` integer DEFAULT false NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `organizer_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`org_name` text NOT NULL,
	`org_description` text NOT NULL,
	`org_url` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`reviewed_by` text,
	`created_at` integer NOT NULL,
	`reviewed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pledges` (
	`id` text PRIMARY KEY NOT NULL,
	`need_id` text NOT NULL,
	`donor_id` text,
	`donor_email` text NOT NULL,
	`donor_name` text,
	`description` text NOT NULL,
	`status` text DEFAULT 'collecting' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`need_id`) REFERENCES `needs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`donor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'donor' NOT NULL,
	`org_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);