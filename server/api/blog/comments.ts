import { Router } from "express";
import { db } from "../../db";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { blogComments, users, blogPosts } from "@shared/schema";

const router = Router();

// Middleware pour vérifier si l'utilisateur est authentifié
const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  next();
};

// Middleware pour vérifier si l'utilisateur est un administrateur
const isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  if (req.user && req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé: rôle administrateur requis" });
  }
  next();
};

// Récupérer tous les commentaires d'un article avec les informations des utilisateurs
router.get("/posts/:postId/comments", async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    
    // Vérifier si l'article existe
    const post = await db.select().from(blogPosts).where(eq(blogPosts.id, postId)).limit(1);
    if (!post || post.length === 0) {
      return res.status(404).json({ message: "Article non trouvé" });
    }

    // Récupérer les commentaires de premier niveau (sans parent)
    const rootComments = await db
      .select({
        id: blogComments.id,
        postId: blogComments.postId,
        userId: blogComments.userId,
        parentId: blogComments.parentId,
        content: blogComments.content,
        isApproved: blogComments.isApproved,
        createdAt: blogComments.createdAt,
        updatedAt: blogComments.updatedAt,
        username: users.username,
        displayName: users.displayName,
        role: users.role,
      })
      .from(blogComments)
      .leftJoin(users, eq(blogComments.userId, users.id))
      .where(
        and(
          eq(blogComments.postId, postId),
          isNull(blogComments.parentId)
        )
      )
      .orderBy(desc(blogComments.createdAt));

    // Récupérer les réponses pour chaque commentaire
    const allComments = [...rootComments];
    const commentIds = rootComments.map(comment => comment.id);
    
    if (commentIds.length > 0) {
      // Utiliser SQL brut pour obtenir toutes les réponses en une seule requête
      const { rows: replies } = await db.execute(`
        SELECT 
          bc.id, bc.post_id AS "postId", bc.user_id AS "userId", 
          bc.parent_id AS "parentId", bc.content, bc.is_approved AS "isApproved", 
          bc.created_at AS "createdAt", bc.updated_at AS "updatedAt",
          u.username, u.display_name AS "displayName", u.role
        FROM blog_comments bc
        LEFT JOIN users u ON bc.user_id = u.id
        WHERE bc.parent_id IN (${commentIds.join(',')})
        ORDER BY bc.created_at ASC
      `);

      // Ajouter les réponses à la liste des commentaires
      allComments.push(...replies);
    }

    // Organiser les commentaires en arborescence
    const commentTree = rootComments.map(rootComment => {
      const childComments = allComments.filter(
        comment => comment.parentId === rootComment.id
      );
      return {
        ...rootComment,
        replies: childComments,
      };
    });

    res.json(commentTree);
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires:", error);
    res.status(500).json({ 
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Récupérer tous les commentaires pour l'admin
router.get("/admin/comments", isAdmin, async (req, res) => {
  try {
    const { rows } = await db.execute(`
      SELECT 
        bc.id, bc.post_id AS "postId", bc.user_id AS "userId", 
        bc.parent_id AS "parentId", bc.content, bc.is_approved AS "isApproved", 
        bc.created_at AS "createdAt", bc.updated_at AS "updatedAt",
        u.username, u.display_name AS "displayName", u.role,
        bp.title AS "postTitle", bp.slug AS "postSlug",
        (SELECT COUNT(*) FROM blog_comments WHERE parent_id = bc.id) AS "replyCount"
      FROM blog_comments bc
      LEFT JOIN users u ON bc.user_id = u.id
      LEFT JOIN blog_posts bp ON bc.post_id = bp.id
      ORDER BY bc.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires admin:", error);
    res.status(500).json({ 
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Ajouter un commentaire
router.post("/posts/:postId/comments", isAuthenticated, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const { content, parentId } = req.body;
    const userId = req.user.id;
    
    // Validation
    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Le contenu du commentaire est requis" });
    }

    // Vérifier si l'article existe
    const post = await db.select().from(blogPosts).where(eq(blogPosts.id, postId)).limit(1);
    if (!post || post.length === 0) {
      return res.status(404).json({ message: "Article non trouvé" });
    }

    // Si c'est une réponse, vérifier si le commentaire parent existe
    if (parentId) {
      const parentComment = await db
        .select()
        .from(blogComments)
        .where(eq(blogComments.id, parentId))
        .limit(1);
        
      if (!parentComment || parentComment.length === 0) {
        return res.status(404).json({ message: "Commentaire parent non trouvé" });
      }
    }

    // Déterminer si le commentaire doit être automatiquement approuvé
    // Les administrateurs ont leurs commentaires automatiquement approuvés
    const isApproved = req.user.role === "admin";

    // Insérer le commentaire
    const [newComment] = await db
      .insert(blogComments)
      .values({
        postId,
        userId,
        parentId: parentId ? parentId : null,
        content,
        isApproved,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Récupérer les informations complètes avec l'utilisateur pour le retour
    const [commentWithUser] = await db
      .select({
        id: blogComments.id,
        postId: blogComments.postId,
        userId: blogComments.userId,
        parentId: blogComments.parentId,
        content: blogComments.content,
        isApproved: blogComments.isApproved,
        createdAt: blogComments.createdAt,
        updatedAt: blogComments.updatedAt,
        username: users.username,
        displayName: users.displayName,
        role: users.role,
      })
      .from(blogComments)
      .leftJoin(users, eq(blogComments.userId, users.id))
      .where(eq(blogComments.id, newComment.id));

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire:", error);
    res.status(500).json({ 
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Approuver ou rejeter un commentaire (admin seulement)
router.patch("/admin/comments/:commentId", isAdmin, async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const { isApproved } = req.body;
    
    if (isApproved === undefined) {
      return res.status(400).json({ message: "Le statut d'approbation est requis" });
    }

    // Vérifier si le commentaire existe
    const existingComment = await db
      .select()
      .from(blogComments)
      .where(eq(blogComments.id, commentId))
      .limit(1);
      
    if (!existingComment || existingComment.length === 0) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    // Mettre à jour le commentaire
    const [updatedComment] = await db
      .update(blogComments)
      .set({
        isApproved,
        updatedAt: new Date(),
      })
      .where(eq(blogComments.id, commentId))
      .returning();

    res.json(updatedComment);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du commentaire:", error);
    res.status(500).json({ 
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Supprimer un commentaire
router.delete("/admin/comments/:commentId", isAdmin, async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);

    // Vérifier si le commentaire existe
    const existingComment = await db
      .select()
      .from(blogComments)
      .where(eq(blogComments.id, commentId))
      .limit(1);
      
    if (!existingComment || existingComment.length === 0) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }

    // Supprimer les réponses associées
    await db
      .delete(blogComments)
      .where(eq(blogComments.parentId, commentId));

    // Supprimer le commentaire
    await db
      .delete(blogComments)
      .where(eq(blogComments.id, commentId));

    res.status(200).json({ message: "Commentaire supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du commentaire:", error);
    res.status(500).json({ 
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;