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

  // Get all tables to check if they have created_at and updated_at columns
  const { rows: tables } = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `);

  // Process each table
  for (const table of tables) {
    const tableName = table.table_name;
    
    // 1. Check if created_at column exists
    const { rows: createdAtColumns } = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1 AND column_name = 'created_at'
    `, [tableName]);

    if (createdAtColumns.length === 0) {
      console.log(`Adding created_at column to ${tableName} table...`);
      try {
        await db.execute(sql`
          ALTER TABLE ${sql.identifier(tableName)} 
          ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);
        console.log(`Created_at column added to ${tableName} successfully!`);
      } catch (err) {
        console.error(`Error adding created_at to ${tableName}:`, err);
      }
    } else {
      console.log(`created_at column already exists in ${tableName}, no action needed.`);
    }
    
    // 2. Check if updated_at column exists
    const { rows: updatedAtColumns } = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1 AND column_name = 'updated_at'
    `, [tableName]);

    if (updatedAtColumns.length === 0) {
      console.log(`Adding updated_at column to ${tableName} table...`);
      try {
        await db.execute(sql`
          ALTER TABLE ${sql.identifier(tableName)} 
          ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);
        console.log(`Updated_at column added to ${tableName} successfully!`);
      } catch (err) {
        console.error(`Error adding updated_at to ${tableName}:`, err);
      }
    } else {
      console.log(`updated_at column already exists in ${tableName}, no action needed.`);
    }
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