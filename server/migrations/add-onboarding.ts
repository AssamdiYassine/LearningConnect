import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Script to create user onboarding tables
 */
export async function migrateOnboarding() {
  try {
    console.log('Starting onboarding migration...');
    
    // Create onboarding_step enum type if it doesn't exist
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'onboarding_step') THEN
          CREATE TYPE onboarding_step AS ENUM (
            'profile_completion',
            'course_browsing',
            'subscription_info',
            'trainer_exploration',
            'session_enrollment',
            'completion'
          );
        END IF;
      END
      $$;
    `);
    
    console.log('Created onboarding_step enum type');
    
    // Create user_onboarding table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_onboarding (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        current_step onboarding_step NOT NULL DEFAULT 'profile_completion',
        completed_steps TEXT[] NOT NULL DEFAULT '{}',
        is_completed BOOLEAN NOT NULL DEFAULT FALSE,
        started_at TIMESTAMP NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMP,
        last_updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT user_onboarding_user_id_unique UNIQUE (user_id)
      );
    `);
    
    console.log('Created user_onboarding table');
    
    console.log('Onboarding migration completed successfully');
  } catch (error) {
    console.error('Error during onboarding migration:', error);
    throw error;
  }
}

// Run the migration directly
migrateOnboarding()
  .then(() => {
    console.log('Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });