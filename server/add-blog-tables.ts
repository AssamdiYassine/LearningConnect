import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import * as schema from '@shared/schema';

async function main() {
  console.log("Ajout des tables pour le blog...");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL est requis");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool, schema });

  // Vérifier et créer la table des catégories de blog
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "blog_categories" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Table blog_categories créée ou existe déjà");
  } catch (error) {
    console.error("Erreur lors de la création de la table blog_categories:", error);
  }

  // Vérifier et créer la enum post_status si elle n'existe pas
  try {
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_status') THEN
          CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');
        END IF;
      END$$;
    `);
    console.log("Type enum post_status créé ou existe déjà");
  } catch (error) {
    console.error("Erreur lors de la création du type enum post_status:", error);
  }

  // Vérifier et créer la table des articles de blog
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "blog_posts" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "excerpt" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "featured_image" TEXT,
        "category_id" INTEGER NOT NULL,
        "author_id" INTEGER NOT NULL,
        "status" post_status NOT NULL DEFAULT 'draft',
        "published_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "read_time" INTEGER,
        "tags" TEXT[],
        "view_count" INTEGER DEFAULT 0
      );
    `);
    console.log("Table blog_posts créée ou existe déjà");
  } catch (error) {
    console.error("Erreur lors de la création de la table blog_posts:", error);
  }

  // Vérifier et créer la table des commentaires de blog
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "blog_comments" (
        "id" SERIAL PRIMARY KEY,
        "post_id" INTEGER NOT NULL,
        "user_id" INTEGER NOT NULL,
        "parent_id" INTEGER,
        "content" TEXT NOT NULL,
        "is_approved" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Table blog_comments créée ou existe déjà");
  } catch (error) {
    console.error("Erreur lors de la création de la table blog_comments:", error);
  }

  // Ajouter des index pour améliorer les performances
  try {
    await db.execute(sql`CREATE INDEX IF NOT EXISTS blog_posts_author_idx ON blog_posts(author_id);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS blog_posts_category_idx ON blog_posts(category_id);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON blog_posts(status);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS blog_comments_post_idx ON blog_comments(post_id);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS blog_comments_user_idx ON blog_comments(user_id);`);
    console.log("Index créés avec succès");
  } catch (error) {
    console.error("Erreur lors de la création des index:", error);
  }

  // Ajouter des contraintes de clés étrangères
  try {
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'blog_posts_author_id_fkey'
        ) THEN
          ALTER TABLE blog_posts
          ADD CONSTRAINT blog_posts_author_id_fkey
          FOREIGN KEY (author_id) REFERENCES users(id)
          ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'blog_posts_category_id_fkey'
        ) THEN
          ALTER TABLE blog_posts
          ADD CONSTRAINT blog_posts_category_id_fkey
          FOREIGN KEY (category_id) REFERENCES blog_categories(id)
          ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'blog_comments_post_id_fkey'
        ) THEN
          ALTER TABLE blog_comments
          ADD CONSTRAINT blog_comments_post_id_fkey
          FOREIGN KEY (post_id) REFERENCES blog_posts(id)
          ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'blog_comments_user_id_fkey'
        ) THEN
          ALTER TABLE blog_comments
          ADD CONSTRAINT blog_comments_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'blog_comments_parent_id_fkey'
        ) THEN
          ALTER TABLE blog_comments
          ADD CONSTRAINT blog_comments_parent_id_fkey
          FOREIGN KEY (parent_id) REFERENCES blog_comments(id)
          ON DELETE CASCADE;
        END IF;
      END$$;
    `);
    console.log("Contraintes de clés étrangères ajoutées avec succès");
  } catch (error) {
    console.error("Erreur lors de l'ajout des contraintes de clés étrangères:", error);
  }

  console.log("Migration des tables de blog terminée");
  process.exit(0);
}

// Exécuter le script de migration
main().catch(err => {
  console.error("Erreur lors de la migration:", err);
  process.exit(1);
});