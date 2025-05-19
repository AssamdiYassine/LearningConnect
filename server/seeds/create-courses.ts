import { pool } from '../db';

/**
 * Script pour créer 6 nouveaux cours (3 payants et 3 gratuits) avec 3 sessions pour chacun
 */
async function createCoursesAndSessions() {
  try {
    console.log('Début de la création des cours et sessions de démo...');
    
    // Récupérer les catégories
    const categoriesResult = await pool.query('SELECT id FROM categories LIMIT 3');
    const categories = categoriesResult.rows;
    
    // Récupérer les formateurs
    const trainersResult = await pool.query('SELECT id FROM users WHERE role = $1 LIMIT 3', ['trainer']);
    const trainers = trainersResult.rows;
    
    // Vérifier si nous avons assez de données
    if (categories.length === 0) {
      throw new Error('Aucune catégorie trouvée');
    }
    
    if (trainers.length === 0) {
      throw new Error('Aucun formateur trouvé');
    }
    
    // Définir les cours à créer
    const coursesToCreate = [
      // Cours payants
      {
        title: 'Développement React Avancé',
        description: 'Maîtrisez les concepts avancés de React avec ce cours complet sur les patterns modernes et l\'optimisation des performances.',
        categoryId: categories[0].id,
        trainerId: trainers[0].id,
        price: 249.99,
        level: 'advanced',
        duration: 16,
        isFree: false
      },
      {
        title: 'Python pour la Data Science',
        description: 'Apprenez à utiliser Python pour l\'analyse de données, la visualisation et l\'apprentissage automatique avec des projets pratiques.',
        categoryId: categories[1].id,
        trainerId: trainers[1].id,
        price: 199.99,
        level: 'intermediate',
        duration: 12,
        isFree: false
      },
      {
        title: 'AWS Cloud Architecture',
        description: 'Concevez et déployez des architectures robustes sur AWS en suivant les meilleures pratiques cloud.',
        categoryId: categories[2].id,
        trainerId: trainers[0].id,
        price: 299.99,
        level: 'advanced',
        duration: 20,
        isFree: false
      },
      // Cours gratuits
      {
        title: 'Introduction à Git et GitHub',
        description: 'Découvrez les bases du contrôle de version avec Git et apprenez à collaborer efficacement sur GitHub.',
        categoryId: categories[0].id,
        trainerId: trainers[1].id,
        price: 0,
        level: 'beginner',
        duration: 4,
        isFree: true
      },
      {
        title: 'Les fondamentaux du HTML/CSS',
        description: 'Apprenez à créer des sites web responsive en partant de zéro avec HTML et CSS.',
        categoryId: categories[1].id,
        trainerId: trainers[2].id,
        price: 0,
        level: 'beginner',
        duration: 6,
        isFree: true
      },
      {
        title: 'Initiation à la cybersécurité',
        description: 'Découvrez les concepts de base de la cybersécurité et apprenez à protéger vos données et systèmes.',
        categoryId: categories[2].id,
        trainerId: trainers[0].id,
        price: 0,
        level: 'beginner',
        duration: 5,
        isFree: true
      }
    ];
    
    // Création des cours
    for (const course of coursesToCreate) {
      // Vérifier si le cours existe déjà
      const existingCourse = await pool.query('SELECT id FROM courses WHERE title = $1', [course.title]);
      
      if (existingCourse.rows.length > 0) {
        console.log(`Le cours "${course.title}" existe déjà, passage au suivant...`);
        continue;
      }
      
      // Insérer le nouveau cours
      const courseResult = await pool.query(`
        INSERT INTO courses (
          title, description, category_id, trainer_id, price, 
          level, duration, max_students, is_published
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [
        course.title,
        course.description,
        course.categoryId,
        course.trainerId,
        course.price,
        course.level,
        course.duration,
        30, // max_students par défaut
        true // is_published
      ]);
      
      const courseId = courseResult.rows[0].id;
      console.log(`Cours créé: "${course.title}" (ID: ${courseId})`);
      
      // Création de 3 sessions pour chaque cours
      // Une session passée, une en cours, et une future
      const now = new Date();
      
      // Session passée (il y a 1 mois)
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1);
      
      // Session en cours (aujourd'hui + 2 jours)
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 2);
      
      // Session future (dans 1 mois)
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);
      
      const sessions = [
        { date: pastDate, isCompleted: true, title: `Session 1: Introduction à ${course.title}` },
        { date: currentDate, isCompleted: false, title: `Session 2: Approfondissement de ${course.title}` },
        { date: futureDate, isCompleted: false, title: `Session 3: Maîtrise de ${course.title}` }
      ];
      
      for (const session of sessions) {
        // Calculer l'heure de fin (2 heures après le début)
        const endDate = new Date(session.date);
        endDate.setHours(endDate.getHours() + 2);
        
        // Formater l'heure pour le champ start_time et end_time
        const startTime = `${session.date.getHours().toString().padStart(2, '0')}:${session.date.getMinutes().toString().padStart(2, '0')}`;
        const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
        
        await pool.query(`
          INSERT INTO sessions (
            course_id, date, zoom_link, is_completed, 
            title, start_time, end_time, max_students
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          courseId,
          session.date,
          'https://zoom.us/j/1234567890',
          session.isCompleted,
          session.title,
          startTime,
          endTime,
          30 // max_students
        ]);
        
        console.log(`Session créée pour le cours ${courseId}: "${session.title}"`);
      }
    }
    
    console.log('Création des cours et sessions terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de la création des cours et sessions:', error);
    throw error;
  }
}

export default createCoursesAndSessions;