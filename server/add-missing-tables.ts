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

  console.log("Creating missing tables for all admin functionality...");

  // 1. Blog posts table
  console.log("Checking if blog_posts table exists...");
  const { rows: blogPostsTable } = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'blog_posts'
  `);

  if (blogPostsTable.length === 0) {
    console.log("Creating blog_posts table...");
    await db.execute(sql`
      CREATE TABLE blog_posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        excerpt TEXT,
        featured_image TEXT,
        author_id INTEGER NOT NULL REFERENCES users(id),
        category_id INTEGER REFERENCES categories(id),
        status TEXT NOT NULL DEFAULT 'draft', -- draft, published
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("blog_posts table created successfully!");
  } else {
    console.log("blog_posts table already exists, no action needed.");
  }

  // 2. Subscriptions table
  console.log("Checking if subscriptions table exists...");
  const { rows: subscriptionsTable } = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'subscriptions'
  `);

  if (subscriptionsTable.length === 0) {
    console.log("Creating subscriptions table...");
    await db.execute(sql`
      CREATE TABLE subscriptions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        duration INTEGER NOT NULL, -- duration in months
        features TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("subscriptions table created successfully!");
  } else {
    console.log("subscriptions table already exists, no action needed.");
  }

  // 3. User subscriptions table (for tracking user subscriptions)
  console.log("Checking if user_subscriptions table exists...");
  const { rows: userSubscriptionsTable } = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_subscriptions'
  `);

  if (userSubscriptionsTable.length === 0) {
    console.log("Creating user_subscriptions table...");
    await db.execute(sql`
      CREATE TABLE user_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        subscription_id INTEGER NOT NULL REFERENCES subscriptions(id),
        start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP NOT NULL,
        status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, expired
        stripe_subscription_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("user_subscriptions table created successfully!");
  } else {
    console.log("user_subscriptions table already exists, no action needed.");
  }

  // 4. Settings table
  console.log("Checking if settings table exists...");
  const { rows: settingsTable } = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'settings'
  `);

  if (settingsTable.length === 0) {
    console.log("Creating settings table...");
    await db.execute(sql`
      CREATE TABLE settings (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT,
        type TEXT NOT NULL DEFAULT 'system', -- system, api, notification, etc.
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("settings table created successfully!");
  } else {
    console.log("settings table already exists, no action needed.");
  }

  // 5. Analytics table (for storing analytics data)
  console.log("Checking if analytics table exists...");
  const { rows: analyticsTable } = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'analytics'
  `);

  if (analyticsTable.length === 0) {
    console.log("Creating analytics table...");
    await db.execute(sql`
      CREATE TABLE analytics (
        id SERIAL PRIMARY KEY,
        event_type TEXT NOT NULL, -- pageview, enrollment, etc.
        event_data JSONB,
        user_id INTEGER REFERENCES users(id),
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("analytics table created successfully!");
  } else {
    console.log("analytics table already exists, no action needed.");
  }

  // 6. Revenue/Payments table
  console.log("Checking if payments table exists...");
  const { rows: paymentsTable } = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'payments'
  `);

  if (paymentsTable.length === 0) {
    console.log("Creating payments table...");
    await db.execute(sql`
      CREATE TABLE payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        amount INTEGER NOT NULL, -- in cents
        type TEXT NOT NULL, -- subscription, course, etc.
        reference_id INTEGER, -- might be subscription_id or course_id
        status TEXT NOT NULL DEFAULT 'completed', -- completed, refunded, failed
        payment_method TEXT,
        stripe_payment_id TEXT,
        trainer_id INTEGER REFERENCES users(id),
        trainer_share INTEGER, -- in cents
        platform_fee INTEGER, -- in cents
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("payments table created successfully!");
  } else {
    console.log("payments table already exists, no action needed.");
  }

  // 7. Course approvals table
  console.log("Checking if course_approvals table exists...");
  const { rows: courseApprovalsTable } = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'course_approvals'
  `);

  if (courseApprovalsTable.length === 0) {
    console.log("Creating course_approvals table...");
    await db.execute(sql`
      CREATE TABLE course_approvals (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id),
        status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
        admin_id INTEGER REFERENCES users(id),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("course_approvals table created successfully!");
  } else {
    console.log("course_approvals table already exists, no action needed.");
  }

  // Add some initial settings
  console.log("Adding initial settings...");
  try {
    const insertSettings = [
      { key: 'site_name', value: 'Necform', type: 'system' },
      { key: 'site_description', value: 'Plateforme de formations IT 100% live', type: 'system' },
      { key: 'contact_email', value: 'contact@necform.fr', type: 'system' },
      { key: 'timezone', value: 'Europe/Paris', type: 'system' },
      { key: 'stripe_public_key', value: '', type: 'api' },
      { key: 'stripe_secret_key', value: '', type: 'api' },
      { key: 'zoom_api_key', value: '', type: 'api' },
      { key: 'zoom_api_secret', value: '', type: 'api' },
      { key: 'allow_registration', value: 'true', type: 'system' },
      { key: 'trainer_approval_required', value: 'true', type: 'system' },
      { key: 'monthly_subscription_price', value: '19.99', type: 'pricing' },
      { key: 'annual_subscription_price', value: '199.99', type: 'pricing' },
      { key: 'platform_fee_percentage', value: '15', type: 'pricing' },
    ];

    for (const setting of insertSettings) {
      const { rows: existingSetting } = await pool.query(
        'SELECT * FROM settings WHERE key = $1',
        [setting.key]
      );

      if (existingSetting.length === 0) {
        await pool.query(
          'INSERT INTO settings (key, value, type) VALUES ($1, $2, $3)',
          [setting.key, setting.value, setting.type]
        );
        console.log(`Added setting: ${setting.key}`);
      }
    }
    console.log("Initial settings added successfully!");
  } catch (err) {
    console.error("Error adding initial settings:", err);
  }

  // Add initial subscription plans
  console.log("Adding initial subscription plans...");
  try {
    const insertPlans = [
      { 
        name: 'Basic Mensuel', 
        description: 'Accès à toutes les formations de base', 
        price: 1999, // 19.99€ in cents
        duration: 1, // 1 month
        features: 'Accès aux formations de base, Support communautaire, 1 formation live par mois',
        is_active: true
      },
      { 
        name: 'Pro Mensuel', 
        description: 'Accès à toutes les formations premium', 
        price: 3999, // 39.99€ in cents
        duration: 1, // 1 month
        features: 'Accès à toutes les formations, Support prioritaire, Formations live illimitées',
        is_active: true
      },
      { 
        name: 'Basic Annuel', 
        description: 'Accès à toutes les formations de base pendant un an', 
        price: 19999, // 199.99€ in cents
        duration: 12, // 12 months
        features: 'Accès aux formations de base, Support communautaire, 1 formation live par mois',
        is_active: true
      },
      { 
        name: 'Pro Annuel', 
        description: 'Accès à toutes les formations premium pendant un an', 
        price: 39999, // 399.99€ in cents
        duration: 12, // 12 months
        features: 'Accès à toutes les formations, Support prioritaire, Formations live illimitées',
        is_active: true
      },
    ];

    const { rows: existingPlans } = await pool.query('SELECT * FROM subscriptions');
    if (existingPlans.length === 0) {
      for (const plan of insertPlans) {
        await pool.query(
          'INSERT INTO subscriptions (name, description, price, duration, features, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
          [plan.name, plan.description, plan.price, plan.duration, plan.features, plan.is_active]
        );
        console.log(`Added subscription plan: ${plan.name}`);
      }
      console.log("Initial subscription plans added successfully!");
    } else {
      console.log("Subscription plans already exist, skipping...");
    }
  } catch (err) {
    console.error("Error adding initial subscription plans:", err);
  }

  // Close the connection pool
  await pool.end();
}

main()
  .then(() => {
    console.log("Tables creation completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Tables creation failed:", err);
    process.exit(1);
  });