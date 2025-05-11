import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import ws from "ws";

// Configure Neon to use WebSockets
neonConfig.webSocketConstructor = ws;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  // 1. Add price column to courses table if not exists
  console.log("Checking if price column exists in courses table...");
  const { rows: priceColumns } = await pool.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'courses' AND column_name = 'price'
  `);

  if (priceColumns.length === 0) {
    console.log("Adding price column to courses table...");
    await db.execute(sql`
      ALTER TABLE courses 
      ADD COLUMN price INTEGER DEFAULT 0
    `);
    console.log("Price column added successfully!");
  } else {
    console.log("Price column already exists, no action needed.");
  }

  // 2. Add thumbnail column to courses table if not exists
  console.log("Checking if thumbnail column exists in courses table...");
  const { rows: thumbnailColumns } = await pool.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'courses' AND column_name = 'thumbnail'
  `);

  if (thumbnailColumns.length === 0) {
    console.log("Adding thumbnail column to courses table...");
    await db.execute(sql`
      ALTER TABLE courses 
      ADD COLUMN thumbnail TEXT
    `);
    console.log("Thumbnail column added successfully!");
  } else {
    console.log("Thumbnail column already exists, no action needed.");
  }

  // Close the connection pool
  await pool.end();
}

main()
  .then(() => {
    console.log("Migration completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });