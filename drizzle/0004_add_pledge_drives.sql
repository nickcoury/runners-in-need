-- Add pledge drive interest to organizations
ALTER TABLE `organizations` ADD `pledge_drive_interest` integer NOT NULL DEFAULT false;

-- Create pledge drives table
CREATE TABLE `pledge_drives` (
  `id` text PRIMARY KEY NOT NULL,
  `organizer_user_id` text NOT NULL REFERENCES `users`(`id`),
  `organizer_name` text NOT NULL,
  `organizer_email` text NOT NULL,
  `group_name` text NOT NULL,
  `event_name` text NOT NULL,
  `event_date` integer NOT NULL,
  `event_location` text NOT NULL,
  `estimated_attendees` integer,
  `description` text NOT NULL,
  `status` text NOT NULL DEFAULT 'planned',
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
