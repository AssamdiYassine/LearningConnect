import { storage } from "./storage";
import { InsertBlogCategory, InsertBlogPost } from "@shared/schema";
import { db } from "./db";
import { blogCategories, blogPosts, users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export async function seedBlogDemoData() {
  console.log("Seeding blog demo data...");

  try {
    // Vérifier si les tables du blog existent
    try {
      // Créer la table blog_categories si elle n'existe pas
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS blog_categories (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          slug TEXT NOT NULL UNIQUE,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);
      
      // Créer le type enum post_status si nécessaire
      await db.execute(sql`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_status') THEN
            CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');
          END IF;
        END$$;
      `);
      
      // Créer la table blog_posts
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS blog_posts (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          excerpt TEXT NOT NULL,
          content TEXT NOT NULL,
          featured_image TEXT,
          category_id INTEGER NOT NULL,
          author_id INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'draft',
          published_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          read_time INTEGER,
          tags TEXT[],
          view_count INTEGER DEFAULT 0
        );
      `);
      
      // Vérifier si les colonnes nécessaires existent
      try {
        await db.execute(sql`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'blog_posts' AND column_name = 'read_time'
            ) THEN
              ALTER TABLE blog_posts ADD COLUMN read_time INTEGER;
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'blog_posts' AND column_name = 'tags'
            ) THEN
              ALTER TABLE blog_posts ADD COLUMN tags TEXT[];
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'blog_posts' AND column_name = 'view_count'
            ) THEN
              ALTER TABLE blog_posts ADD COLUMN view_count INTEGER DEFAULT 0;
            END IF;
          END$$;
        `);
        console.log("Colonnes nécessaires vérifiées et ajoutées si nécessaire");
      } catch (error) {
        console.error("Erreur lors de la vérification/ajout des colonnes:", error);
      }
      
      // Créer la table blog_comments
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS blog_comments (
          id SERIAL PRIMARY KEY,
          post_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          parent_id INTEGER,
          content TEXT NOT NULL,
          is_approved BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);
      
      console.log("Tables du blog créées avec succès");
    } catch (error) {
      console.error("Erreur lors de la création des tables du blog:", error);
    }

    // Crée des catégories de blog si elles n'existent pas déjà
    try {
      const categories: InsertBlogCategory[] = [
        {
          name: "Développement Web", 
          slug: "developpement-web", 
          description: "Tout sur le développement web, frontend et backend"
        },
        {
          name: "DevOps", 
          slug: "devops", 
          description: "Intégration continue, déploiement continu, et gestion d'infrastructure"
        },
        {
          name: "Intelligence Artificielle", 
          slug: "intelligence-artificielle", 
          description: "Machine learning, deep learning et IA appliquée"
        },
        {
          name: "Cybersécurité", 
          slug: "cybersecurite", 
          description: "Protection des systèmes, cryptographie et tests de pénétration"
        }
      ];

      for (const category of categories) {
        try {
          await db.insert(blogCategories).values(category).onConflictDoNothing();
          console.log(`Catégorie créée ou existe déjà: ${category.name}`);
        } catch (error) {
          console.error(`Erreur lors de la création de la catégorie ${category.name}:`, error);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la création des catégories:", error);
    }

    // Récupère les catégories et un admin pour créer des articles
    try {
      const existingCategories = await db.select().from(blogCategories);
      const adminUsers = await db.select().from(users).where(eq(users.role, "admin"));
      
      if (adminUsers.length === 0) {
        console.error("Aucun administrateur trouvé pour associer comme auteur des articles de blog");
        return;
      }
      
      const admin = adminUsers[0];
      console.log("Admin trouvé:", admin);

      // Exemple d'article de blog
      const samplePost = {
        title: "Les tendances du développement web en 2025",
        slug: "tendances-developpement-web-2025",
        excerpt: "Découvrez les technologies et frameworks qui domineront le développement web en 2025.",
        content: "# Les tendances du développement web en 2025\n\nLe paysage du développement web évolue constamment...",
        featured_image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
        category_id: existingCategories[0]?.id || 1,
        author_id: admin.id,
        status: "published",
        published_at: new Date(),
        view_count: 0
      };

      try {
        await db.insert(blogPosts)
          .values(samplePost)
          .onConflictDoNothing();
        console.log(`Article créé ou existe déjà: ${samplePost.title}`);
      } catch (error) {
        console.error(`Erreur lors de la création de l'article:`, error);
      }
    } catch (error) {
      console.error("Erreur lors de la création des articles:", error);
    }

    console.log("Données de démonstration du blog initialisées avec succès");
  } catch (error) {
    console.error("Error seeding blog demo data:", error);
  }
}