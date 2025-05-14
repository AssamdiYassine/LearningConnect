import { db } from "./db";
import { Pool } from "@neondatabase/serverless";
import { hasAdminRole } from "./admin-routes";
import { Request, Response, Express } from "express";

// Cette approche utilise des requêtes SQL directes au lieu de Drizzle ORM
// pour éviter les problèmes de schéma avec les nouvelles tables

// Exporter une fonction pour enregistrer ces routes dans l'app Express
export function registerAdminDashboard(app: Express, pool: Pool) {
  
  // API Tableau de bord - Statistiques globales
  app.get('/api/admin/dashboard-stats', hasAdminRole, async (req: Request, res: Response) => {
    try {
      // Statistiques utilisateurs
      const { rows: userStats } = await pool.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
          COUNT(CASE WHEN role = 'trainer' THEN 1 END) as trainers,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
          COUNT(CASE WHEN is_subscribed = true THEN 1 END) as subscribed_users
        FROM users
      `);

      // Statistiques cours
      const { rows: courseStats } = await pool.query(`
        SELECT 
          COUNT(*) as total_courses,
          COUNT(CASE WHEN is_approved = true THEN 1 END) as approved_courses,
          COUNT(CASE WHEN is_approved = false THEN 1 END) as pending_courses
        FROM courses
      `);

      // Statistiques sessions
      const { rows: sessionStats } = await pool.query(`
        SELECT 
          COUNT(*) as total_sessions,
          COUNT(CASE WHEN date > NOW() THEN 1 END) as upcoming_sessions,
          COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_sessions
        FROM sessions
      `);

      // Statistiques financières
      const { rows: revenueStats } = await pool.query(`
        SELECT 
          COALESCE(SUM(amount), 0) as total_revenue,
          COALESCE(SUM(platform_fee), 0) as platform_fees,
          COALESCE(SUM(trainer_share), 0) as trainer_payout
        FROM payments
      `);

      // Statistiques inscriptions
      const { rows: enrollmentStats } = await pool.query(`
        SELECT COUNT(*) as total_enrollments
        FROM enrollments
      `);
      
      // Récupération des données de revenus mensuels pour le graphique
      const { rows: monthlyRevenue } = await pool.query(`
        SELECT month, amount 
        FROM monthly_revenue
        ORDER BY id ASC
      `);
      
      // Récupération des données d'utilisateurs mensuels pour le graphique
      const { rows: monthlyUsers } = await pool.query(`
        SELECT month, user_count, trainer_count
        FROM monthly_users
        ORDER BY id ASC
      `);
      
      // Récupération des derniers cours pour vérifier les approbations en attente
      const { rows: pendingCourses } = await pool.query(`
        SELECT id, title, is_approved 
        FROM courses 
        WHERE is_approved = false 
        LIMIT 10
      `);
      
      // Récupération des derniers utilisateurs
      const { rows: recentUsers } = await pool.query(`
        SELECT id, username, email, role, created_at as "createdAt"
        FROM users
        ORDER BY created_at DESC
        LIMIT 5
      `);
      
      // Récupération des derniers cours
      const { rows: recentCourses } = await pool.query(`
        SELECT 
          c.id, 
          c.title, 
          c.is_approved as "isApproved",
          c.created_at as "createdAt",
          u.username as "trainerName",
          cat.name as category
        FROM courses c
        JOIN users u ON c.trainer_id = u.id
        LEFT JOIN categories cat ON c.category_id = cat.id
        ORDER BY c.created_at DESC
        LIMIT 5
      `);
      
      // Répartition des revenus pour graphique camembert
      const { rows: revenueDistribution } = await pool.query(`
        SELECT 
          'Formateurs' as label, 
          COALESCE(SUM(trainer_share), 0) as value 
        FROM payments
        UNION ALL
        SELECT 
          'Plateforme' as label, 
          COALESCE(SUM(platform_fee), 0) as value 
        FROM payments
      `);

      res.json({
        userStats: userStats[0] || { total_users: 0, students: 0, trainers: 0, admins: 0, subscribed_users: 0 },
        courseStats: courseStats[0] || { total_courses: 0, approved_courses: 0, pending_courses: 0 },
        sessionStats: sessionStats[0] || { total_sessions: 0, upcoming_sessions: 0, completed_sessions: 0 },
        revenueStats: revenueStats[0] || { total_revenue: 0, platform_fees: 0, trainer_payout: 0 },
        enrollmentStats: enrollmentStats[0] || { total_enrollments: 0 },
        monthlyRevenue,
        monthlyUsers,
        pendingApprovals: pendingCourses.length,
        recentUsers,
        recentCourses,
        revenueDistribution
      });
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: `Failed to fetch dashboard stats: ${error.message}` });
    }
  });

  // API Blog
  app.get('/api/admin/blogs', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { rows: blogs } = await pool.query(`
        SELECT bp.*, u.display_name as author_name, c.name as category_name
        FROM blog_posts bp
        LEFT JOIN users u ON bp.author_id = u.id
        LEFT JOIN categories c ON bp.category_id = c.id
        ORDER BY bp.created_at DESC
      `);
      res.json(blogs);
    } catch (error: any) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: `Failed to fetch blog posts: ${error.message}` });
    }
  });

  app.post('/api/admin/blogs', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { title, slug, content, excerpt, featuredImage, authorId, categoryId, status } = req.body;
      
      const { rows } = await pool.query(`
        INSERT INTO blog_posts (title, slug, content, excerpt, featured_image, author_id, category_id, status, published_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        title, 
        slug, 
        content, 
        excerpt || null, 
        featuredImage || null, 
        authorId || req.user?.id, 
        categoryId || null, 
        status || 'draft',
        status === 'published' ? new Date() : null
      ]);
      
      res.status(201).json(rows[0]);
    } catch (error: any) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: `Failed to create blog post: ${error.message}` });
    }
  });

  // La route GET /api/admin/blogs/:id est déjà définie dans admin-api-extensions.ts
  // Nous la supprimons ici pour éviter les conflits
  // Cette route utilisait une structure de données plate qui causait des problèmes
  // avec le formulaire d'édition qui s'attend à des objets imbriqués (author, category)

  app.patch('/api/admin/blogs/:id', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, slug, content, excerpt, featuredImage, authorId, categoryId, status } = req.body;
      
      // Construire dynamiquement la requête de mise à jour
      let updateFields = [];
      let values = [];
      let paramCount = 1;
      
      if (title !== undefined) {
        updateFields.push(`title = $${paramCount++}`);
        values.push(title);
      }
      
      if (slug !== undefined) {
        updateFields.push(`slug = $${paramCount++}`);
        values.push(slug);
      }
      
      if (content !== undefined) {
        updateFields.push(`content = $${paramCount++}`);
        values.push(content);
      }
      
      if (excerpt !== undefined) {
        updateFields.push(`excerpt = $${paramCount++}`);
        values.push(excerpt);
      }
      
      if (featuredImage !== undefined) {
        updateFields.push(`featured_image = $${paramCount++}`);
        values.push(featuredImage);
      }
      
      if (authorId !== undefined) {
        updateFields.push(`author_id = $${paramCount++}`);
        values.push(authorId);
      }
      
      if (categoryId !== undefined) {
        updateFields.push(`category_id = $${paramCount++}`);
        values.push(categoryId);
      }
      
      if (status !== undefined) {
        updateFields.push(`status = $${paramCount++}`);
        values.push(status);
        
        // Mettre à jour la date de publication si le statut passe à "published"
        if (status === 'published') {
          updateFields.push(`published_at = $${paramCount++}`);
          values.push(new Date());
        }
      }
      
      // Ajouter la mise à jour de updated_at
      updateFields.push(`updated_at = $${paramCount++}`);
      values.push(new Date());
      
      // Ajouter l'ID à la fin des valeurs
      values.push(id);
      
      const { rows } = await pool.query(`
        UPDATE blog_posts
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `, values);
      
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      
      res.json(rows[0]);
    } catch (error: any) {
      console.error(`Error updating blog post ${req.params.id}:`, error);
      res.status(500).json({ message: `Failed to update blog post: ${error.message}` });
    }
  });

  app.delete('/api/admin/blogs/:id', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM blog_posts WHERE id = $1', [id]);
      res.sendStatus(204);
    } catch (error: any) {
      console.error(`Error deleting blog post ${req.params.id}:`, error);
      res.status(500).json({ message: `Failed to delete blog post: ${error.message}` });
    }
  });

  // API Abonnements
  app.get('/api/admin/subscriptions', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { rows } = await pool.query(`
        SELECT * FROM subscriptions
        ORDER BY price ASC
      `);
      res.json(rows);
    } catch (error: any) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: `Failed to fetch subscriptions: ${error.message}` });
    }
  });

  app.post('/api/admin/subscriptions', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { name, description, price, duration, features, isActive } = req.body;
      
      const { rows } = await pool.query(`
        INSERT INTO subscriptions (name, description, price, duration, features, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [name, description || null, price, duration, features || null, isActive !== undefined ? isActive : true]);
      
      res.status(201).json(rows[0]);
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: `Failed to create subscription: ${error.message}` });
    }
  });

  app.patch('/api/admin/subscriptions/:id', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, price, duration, features, isActive } = req.body;
      
      // Construire dynamiquement la requête de mise à jour
      let updateFields = [];
      let values = [];
      let paramCount = 1;
      
      if (name !== undefined) {
        updateFields.push(`name = $${paramCount++}`);
        values.push(name);
      }
      
      if (description !== undefined) {
        updateFields.push(`description = $${paramCount++}`);
        values.push(description);
      }
      
      if (price !== undefined) {
        updateFields.push(`price = $${paramCount++}`);
        values.push(price);
      }
      
      if (duration !== undefined) {
        updateFields.push(`duration = $${paramCount++}`);
        values.push(duration);
      }
      
      if (features !== undefined) {
        updateFields.push(`features = $${paramCount++}`);
        values.push(features);
      }
      
      if (isActive !== undefined) {
        updateFields.push(`is_active = $${paramCount++}`);
        values.push(isActive);
      }
      
      // Ajouter la mise à jour de updated_at
      updateFields.push(`updated_at = $${paramCount++}`);
      values.push(new Date());
      
      // Ajouter l'ID à la fin des valeurs
      values.push(id);
      
      const { rows } = await pool.query(`
        UPDATE subscriptions
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `, values);
      
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Subscription not found' });
      }
      
      res.json(rows[0]);
    } catch (error: any) {
      console.error(`Error updating subscription ${req.params.id}:`, error);
      res.status(500).json({ message: `Failed to update subscription: ${error.message}` });
    }
  });

  // API Abonnements Utilisateurs
  app.get('/api/admin/user-subscriptions', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { rows } = await pool.query(`
        SELECT us.*, u.username, u.display_name, s.name as subscription_name, s.price
        FROM user_subscriptions us
        JOIN users u ON us.user_id = u.id
        JOIN subscriptions s ON us.subscription_id = s.id
        ORDER BY us.created_at DESC
      `);
      res.json(rows);
    } catch (error: any) {
      console.error("Error fetching user subscriptions:", error);
      res.status(500).json({ message: `Failed to fetch user subscriptions: ${error.message}` });
    }
  });

  // API Paramètres
  app.get('/api/admin/settings', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { rows } = await pool.query(`
        SELECT * FROM settings
        ORDER BY type, key
      `);
      res.json(rows);
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: `Failed to fetch settings: ${error.message}` });
    }
  });

  app.get('/api/admin/settings/:type', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      const { rows } = await pool.query(`
        SELECT * FROM settings
        WHERE type = $1
        ORDER BY key
      `, [type]);
      res.json(rows);
    } catch (error: any) {
      console.error(`Error fetching settings of type ${req.params.type}:`, error);
      res.status(500).json({ message: `Failed to fetch settings: ${error.message}` });
    }
  });

  app.post('/api/admin/settings', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { key, value, type } = req.body;
      
      // Vérifier si le paramètre existe déjà
      const { rows: existing } = await pool.query(`
        SELECT * FROM settings WHERE key = $1
      `, [key]);
      
      let result;
      
      if (existing.length > 0) {
        // Mettre à jour le paramètre existant
        const { rows } = await pool.query(`
          UPDATE settings
          SET value = $1, type = $2, updated_at = $3
          WHERE key = $4
          RETURNING *
        `, [value, type || existing[0].type, new Date(), key]);
        
        result = rows[0];
      } else {
        // Créer un nouveau paramètre
        const { rows } = await pool.query(`
          INSERT INTO settings (key, value, type)
          VALUES ($1, $2, $3)
          RETURNING *
        `, [key, value, type || 'system']);
        
        result = rows[0];
      }
      
      res.status(201).json(result);
    } catch (error: any) {
      console.error("Error creating/updating setting:", error);
      res.status(500).json({ message: `Failed to save setting: ${error.message}` });
    }
  });

  // API Approbations
  app.get('/api/admin/approvals', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { rows } = await pool.query(`
        SELECT ca.*, c.title as course_title, c.description as course_description, 
               u.display_name as trainer_name, cat.name as category_name
        FROM course_approvals ca
        JOIN courses c ON ca.course_id = c.id
        JOIN users u ON c.trainer_id = u.id
        JOIN categories cat ON c.category_id = cat.id
        WHERE ca.status = 'pending'
        ORDER BY ca.created_at DESC
      `);
      res.json(rows);
    } catch (error: any) {
      console.error("Error fetching course approvals:", error);
      res.status(500).json({ message: `Failed to fetch course approvals: ${error.message}` });
    }
  });

  app.patch('/api/admin/courses/:id/approval', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { id: courseId } = req.params;
      const { approved, notes } = req.body;
      const adminId = req.user!.id;
      const status = approved ? 'approved' : 'rejected';
      
      // Vérifier si une demande d'approbation existe déjà
      const { rows: existingApproval } = await pool.query(`
        SELECT * FROM course_approvals WHERE course_id = $1
      `, [courseId]);
      
      let approvalResult;
      
      // Exécuter dans une transaction
      await pool.query('BEGIN');
      
      try {
        if (existingApproval.length > 0) {
          // Mettre à jour l'approbation existante
          const { rows } = await pool.query(`
            UPDATE course_approvals
            SET status = $1, admin_id = $2, notes = $3, updated_at = $4
            WHERE course_id = $5
            RETURNING *
          `, [status, adminId, notes, new Date(), courseId]);
          
          approvalResult = rows[0];
        } else {
          // Créer une nouvelle approbation
          const { rows } = await pool.query(`
            INSERT INTO course_approvals (course_id, status, admin_id, notes)
            VALUES ($1, $2, $3, $4)
            RETURNING *
          `, [courseId, status, adminId, notes]);
          
          approvalResult = rows[0];
        }
        
        // Mettre à jour le statut d'approbation du cours
        await pool.query(`
          UPDATE courses
          SET is_approved = $1, updated_at = $2
          WHERE id = $3
        `, [approved, new Date(), courseId]);
        
        // Obtenir des informations sur le cours et le formateur
        const { rows: courseInfo } = await pool.query(`
          SELECT c.title, c.trainer_id
          FROM courses c
          WHERE c.id = $1
        `, [courseId]);
        
        if (courseInfo.length > 0) {
          // Créer une notification pour le formateur
          await pool.query(`
            INSERT INTO notifications (
              user_id, title, body, type, source_type, source_id
            ) VALUES (
              $1, $2, $3, $4, $5, $6
            )
          `, [
            courseInfo[0].trainer_id,
            approved ? "Formation approuvée" : "Formation rejetée",
            approved 
              ? `Votre formation "${courseInfo[0].title}" a été approuvée et est maintenant visible pour les étudiants.` 
              : `Votre formation "${courseInfo[0].title}" a été rejetée. Raison: ${notes || 'Aucune raison fournie'}`,
            "course_approval",
            "course",
            courseId
          ]);
        }
        
        await pool.query('COMMIT');
        
        res.json({
          success: true,
          approved,
          courseId,
          approval: approvalResult
        });
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    } catch (error: any) {
      console.error(`Error processing course approval for course ${req.params.id}:`, error);
      res.status(500).json({ message: `Failed to process course approval: ${error.message}` });
    }
  });

  // API Analytics
  app.get('/api/admin/analytics', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { timeframe = 'month', type } = req.query;
      
      // Déterminer la période
      let interval;
      let groupBy;
      
      switch(String(timeframe)) {
        case 'week':
          interval = "NOW() - INTERVAL '7 days'";
          groupBy = "DATE(created_at)";
          break;
        case 'month':
          interval = "NOW() - INTERVAL '30 days'";
          groupBy = "DATE(created_at)";
          break;
        case 'year':
          interval = "NOW() - INTERVAL '1 year'";
          groupBy = "DATE_TRUNC('month', created_at)";
          break;
        default:
          interval = "NOW() - INTERVAL '30 days'";
          groupBy = "DATE(created_at)";
      }
      
      // Base de la requête
      let query = `
        SELECT ${groupBy} as date, event_type, COUNT(*) as count
        FROM analytics
        WHERE created_at >= ${interval}
      `;
      
      // Ajouter un filtre par type si spécifié
      if (type) {
        query += ` AND event_type = '${String(type)}'`;
      }
      
      // Grouper par date et type d'événement
      query += ` GROUP BY ${groupBy}, event_type ORDER BY ${groupBy}, event_type`;
      
      const { rows } = await pool.query(query);
      
      res.json(rows);
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: `Failed to fetch analytics: ${error.message}` });
    }
  });

  // API Revenue
  app.get('/api/admin/revenue', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { timeframe = 'month' } = req.query;
      
      // Déterminer la période
      let interval;
      let groupBy;
      
      switch(String(timeframe)) {
        case 'week':
          interval = "NOW() - INTERVAL '7 days'";
          groupBy = "DATE(created_at)";
          break;
        case 'month':
          interval = "NOW() - INTERVAL '30 days'";
          groupBy = "DATE(created_at)";
          break;
        case 'year':
          interval = "NOW() - INTERVAL '1 year'";
          groupBy = "DATE_TRUNC('month', created_at)";
          break;
        default:
          interval = "NOW() - INTERVAL '30 days'";
          groupBy = "DATE(created_at)";
      }
      
      // Revenus par jour
      const { rows: dailyRevenue } = await pool.query(`
        SELECT ${groupBy} as date, SUM(amount) as total, COUNT(*) as count
        FROM payments
        WHERE created_at >= ${interval}
        GROUP BY ${groupBy}
        ORDER BY ${groupBy}
      `);
      
      // Revenus par type
      const { rows: revenueByType } = await pool.query(`
        SELECT type, SUM(amount) as total, COUNT(*) as count
        FROM payments
        WHERE created_at >= ${interval}
        GROUP BY type
      `);
      
      // Statistiques globales
      const { rows: stats } = await pool.query(`
        SELECT 
          COALESCE(SUM(amount), 0) as total_revenue,
          COUNT(*) as total_count,
          COALESCE(SUM(platform_fee), 0) as platform_fees
        FROM payments
        WHERE created_at >= ${interval}
      `);
      
      res.json({
        dailyRevenue,
        revenueByType,
        stats: stats[0] || { total_revenue: 0, total_count: 0, platform_fees: 0 }
      });
    } catch (error: any) {
      console.error("Error fetching revenue stats:", error);
      res.status(500).json({ message: `Failed to fetch revenue stats: ${error.message}` });
    }
  });

  app.get('/api/admin/revenue/trainers', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { rows } = await pool.query(`
        SELECT 
          p.trainer_id,
          u.display_name as trainer_name,
          SUM(p.amount) as total,
          SUM(p.trainer_share) as trainer_share,
          COUNT(*) as count
        FROM payments p
        JOIN users u ON p.trainer_id = u.id
        WHERE p.trainer_id IS NOT NULL
        GROUP BY p.trainer_id, u.display_name
        ORDER BY SUM(p.amount) DESC
      `);
      
      res.json(rows);
    } catch (error: any) {
      console.error("Error fetching trainer revenue stats:", error);
      res.status(500).json({ message: `Failed to fetch trainer revenue stats: ${error.message}` });
    }
  });
  
  // Routes pour les compteurs de statistiques utilisées dans la barre latérale admin
  app.get('/api/admin/stats/users-count', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { rows } = await pool.query(`SELECT COUNT(*) FROM users`);
      res.json({ count: parseInt(rows[0].count) });
    } catch (error: any) {
      console.error("Error fetching users count:", error);
      res.status(500).json({ message: `Failed to fetch users count: ${error.message}` });
    }
  });

  app.get('/api/admin/stats/courses-count', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { rows } = await pool.query(`SELECT COUNT(*) FROM courses`);
      res.json({ count: parseInt(rows[0].count) });
    } catch (error: any) {
      console.error("Error fetching courses count:", error);
      res.status(500).json({ message: `Failed to fetch courses count: ${error.message}` });
    }
  });

  app.get('/api/admin/stats/enterprises-count', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { rows } = await pool.query(`SELECT COUNT(*) FROM enterprises`);
      res.json({ count: parseInt(rows[0].count) });
    } catch (error: any) {
      console.error("Error fetching enterprises count:", error);
      res.status(500).json({ message: `Failed to fetch enterprises count: ${error.message}` });
    }
  });
}