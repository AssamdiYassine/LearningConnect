import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { seedDatabase } from "./seed";

// Run migrations and seeding
async function main() {
  console.log("Starting database migrations...");
  
  neonConfig.webSocketConstructor = ws;

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  
  try {
    // Push the schema to the database
    console.log("Pushing schema to database...");
    
    // Create tables based on the schema
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "role" (
        "value" text PRIMARY KEY
      );
      
      CREATE TABLE IF NOT EXISTS "subscription_type" (
        "value" text PRIMARY KEY
      );
      
      CREATE TABLE IF NOT EXISTS "course_level" (
        "value" text PRIMARY KEY
      );
      
      CREATE TABLE IF NOT EXISTS "setting_type" (
        "value" text PRIMARY KEY
      );
    `);
    
    // Insert enum values if they don't exist
    await db.execute(`
      INSERT INTO "role" ("value") VALUES ('student') ON CONFLICT DO NOTHING;
      INSERT INTO "role" ("value") VALUES ('trainer') ON CONFLICT DO NOTHING;
      INSERT INTO "role" ("value") VALUES ('admin') ON CONFLICT DO NOTHING;
      
      INSERT INTO "subscription_type" ("value") VALUES ('monthly') ON CONFLICT DO NOTHING;
      INSERT INTO "subscription_type" ("value") VALUES ('annual') ON CONFLICT DO NOTHING;
      
      INSERT INTO "course_level" ("value") VALUES ('beginner') ON CONFLICT DO NOTHING;
      INSERT INTO "course_level" ("value") VALUES ('intermediate') ON CONFLICT DO NOTHING;
      INSERT INTO "course_level" ("value") VALUES ('advanced') ON CONFLICT DO NOTHING;
      
      INSERT INTO "setting_type" ("value") VALUES ('api') ON CONFLICT DO NOTHING;
      INSERT INTO "setting_type" ("value") VALUES ('system') ON CONFLICT DO NOTHING;
      INSERT INTO "setting_type" ("value") VALUES ('email') ON CONFLICT DO NOTHING;
    `);
    
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY,
        "username" text NOT NULL UNIQUE,
        "email" text NOT NULL UNIQUE,
        "password" text NOT NULL,
        "display_name" text NOT NULL,
        "role" text NOT NULL DEFAULT 'student' REFERENCES "role"("value"),
        "is_subscribed" boolean DEFAULT false,
        "subscription_type" text REFERENCES "subscription_type"("value"),
        "subscription_end_date" timestamp,
        "stripe_customer_id" text,
        "stripe_subscription_id" text
      );
    `);
    
    // Create other tables
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" serial PRIMARY KEY,
        "name" text NOT NULL UNIQUE,
        "slug" text NOT NULL UNIQUE
      );
      
      CREATE TABLE IF NOT EXISTS "courses" (
        "id" serial PRIMARY KEY,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "level" text NOT NULL REFERENCES "course_level"("value"),
        "category_id" integer NOT NULL,
        "trainer_id" integer NOT NULL,
        "duration" integer NOT NULL,
        "max_students" integer NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS "sessions" (
        "id" serial PRIMARY KEY,
        "course_id" integer NOT NULL,
        "date" timestamp NOT NULL,
        "zoom_link" text NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS "enrollments" (
        "id" serial PRIMARY KEY,
        "user_id" integer NOT NULL,
        "session_id" integer NOT NULL,
        "enrolled_at" timestamp NOT NULL DEFAULT now()
      );
      
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" serial PRIMARY KEY,
        "user_id" integer NOT NULL,
        "message" text NOT NULL,
        "type" text NOT NULL,
        "is_read" boolean DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now()
      );
      
      CREATE TABLE IF NOT EXISTS "settings" (
        "id" serial PRIMARY KEY,
        "key" text NOT NULL UNIQUE,
        "value" text,
        "type" text NOT NULL DEFAULT 'system' REFERENCES "setting_type"("value"),
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `);
      
    console.log("Schema pushed successfully");
    
    // Seed the database
    await seedDatabase();
    
    console.log("Database migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();