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

  console.log("Checking if is_approved column exists in courses table...");

  // Check if the column already exists to avoid errors
  const { rows: columns } = await pool.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'courses' AND column_name = 'is_approved'
  `);

  if (columns.length === 0) {
    console.log("Adding is_approved column to courses table...");
    
    // Add the column
    await db.execute(sql`
      ALTER TABLE courses 
      ADD COLUMN is_approved BOOLEAN DEFAULT FALSE
    `);
    
    console.log("Column added successfully!");
  } else {
    console.log("Column already exists, no action needed.");
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