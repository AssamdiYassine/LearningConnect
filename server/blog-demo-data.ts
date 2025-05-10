import { storage } from "./storage";
import { InsertBlogCategory, InsertBlogPost } from "@shared/schema";
import { db } from "./db";
import { blogCategories, blogPosts, users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedBlogDemoData() {
  console.log("Seeding blog demo data...");

  try {
    // Vérifie si des catégories existent déjà
    const existingCategories = await storage.getAllBlogCategories();
    if (existingCategories.length > 0) {
      console.log(`${existingCategories.length} catégories de blog existent déjà.`);
    } else {
      // Crée des catégories de blog
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
        await storage.createBlogCategory(category);
        console.log(`Catégorie créée: ${category.name}`);
      }
    }

    // Vérifie si des articles existent déjà
    const checkPosts = await db.select({ count: db.fn.count() }).from(blogPosts);
    const postsCount = Number(checkPosts[0].count);
    
    if (postsCount > 0) {
      console.log(`${postsCount} articles de blog existent déjà.`);
    } else {
      // Récupère les catégories pour associer les articles
      const categories = await storage.getAllBlogCategories();
      
      // Récupère un admin pour associer comme auteur
      const adminUser = await db.select().from(users).where(eq(users.role, "admin"));
      const admin = adminUser[0];
      
      if (!admin) {
        console.error("Aucun administrateur trouvé pour associer comme auteur des articles de blog");
        return;
      }

      // Crée des articles de blog
      const posts: InsertBlogPost[] = [
        {
          title: "Les tendances du développement web en 2025",
          slug: "tendances-developpement-web-2025",
          excerpt: "Découvrez les technologies et frameworks qui domineront le développement web en 2025.",
          content: `
# Les tendances du développement web en 2025

Le paysage du développement web évolue constamment, et 2025 ne fait pas exception. Dans cet article, nous explorerons les tendances émergentes qui façonnent l'avenir du développement web.

## 1. Web Components et Micro-Frontends

Les Web Components continuent de gagner en popularité, permettant aux développeurs de créer des éléments d'interface utilisateur réutilisables. Cette approche modulaire, combinée avec l'architecture Micro-Frontends, permet aux équipes de travailler indépendamment sur différentes parties d'une application.

## 2. Edge Computing

Le Edge Computing rapproche le traitement des données des utilisateurs finaux, réduisant la latence et améliorant les performances. Des plateformes comme Cloudflare Workers et Vercel Edge Functions permettent d'exécuter du code directement sur les serveurs de périphérie.

## 3. Frameworks Meta-JavaScript

Des frameworks comme Astro, Qwik et Solid JS gagnent du terrain en proposant des approches innovantes pour optimiser le chargement des pages et minimiser le JavaScript envoyé au navigateur.

## 4. WebAssembly

WebAssembly (WASM) continue sa progression, permettant d'exécuter du code compilé à haute performance dans le navigateur. Cette technologie ouvre la voie à des applications web plus complexes et performantes.

## 5. L'IA dans le développement

Les outils de développement assistés par l'IA transforment le processus de codage. De la génération de code à l'auto-complétion intelligente, l'IA devient un partenaire incontournable du développeur moderne.

## Conclusion

Le développement web en 2025 se caractérise par une recherche constante de performance, de modularité et d'expériences utilisateur améliorées. Les développeurs qui adoptent ces nouvelles technologies et méthodologies seront mieux positionnés pour créer des applications web modernes et efficaces.
          `,
          featuredImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
          categoryId: categories.find(c => c.slug === "developpement-web")?.id || categories[0].id,
          authorId: admin.id,
          status: "published",
          publishedAt: new Date(),
          readTime: 7,
          tags: ["JavaScript", "WebComponents", "Edge Computing", "WASM", "IA"]
        },
        {
          title: "Sécuriser votre pipeline CI/CD : Meilleures pratiques",
          slug: "securiser-pipeline-ci-cd-meilleures-pratiques",
          excerpt: "Un guide complet pour renforcer la sécurité de vos pipelines d'intégration et de déploiement continus.",
          content: `
# Sécuriser votre pipeline CI/CD : Meilleures pratiques

Dans un monde où le développement logiciel s'accélère, les pipelines CI/CD (Intégration Continue/Déploiement Continu) sont devenus essentiels. Cependant, ils peuvent également introduire des vulnérabilités si la sécurité n'est pas correctement intégrée.

## Pourquoi la sécurité CI/CD est-elle cruciale ?

Les pipelines CI/CD automatisent la construction, les tests et le déploiement du code. Si ces pipelines sont compromis, les attaquants peuvent injecter du code malveillant qui sera automatiquement déployé en production.

## Meilleures pratiques de sécurité

### 1. Principe du moindre privilège

Accordez aux pipelines CI/CD uniquement les autorisations nécessaires pour accomplir leurs tâches. Évitez d'utiliser des comptes administrateur ou des jetons à privilèges élevés.

### 2. Analyse de code statique et dynamique

Intégrez des outils d'analyse de sécurité statique (SAST) et dynamique (DAST) dans votre pipeline pour détecter les vulnérabilités avant le déploiement.

### 3. Analyse des dépendances

Utilisez des outils comme Dependabot ou Snyk pour analyser et mettre à jour automatiquement les dépendances vulnérables.

### 4. Signez vos artefacts

Implémentez la signature cryptographique des artefacts de build pour garantir leur intégrité tout au long du pipeline.

### 5. Sécurisez vos secrets

Utilisez des coffres-forts pour secrets comme HashiCorp Vault ou AWS Secrets Manager plutôt que de stocker des secrets directement dans vos configurations CI/CD.

## Conclusion

L'intégration de la sécurité dans vos pipelines CI/CD dès le départ est essentielle pour protéger votre infrastructure et vos applications. En suivant ces meilleures pratiques, vous pouvez réduire considérablement les risques tout en maintenant l'efficacité de vos processus de développement et de déploiement.
          `,
          featuredImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          categoryId: categories.find(c => c.slug === "devops")?.id || categories[0].id,
          authorId: admin.id,
          status: "published",
          publishedAt: new Date(),
          readTime: 8,
          tags: ["DevOps", "CI/CD", "Sécurité", "Pipeline", "Automatisation"]
        },
        {
          title: "Introduction aux modèles de fondation en IA",
          slug: "introduction-modeles-fondation-ia",
          excerpt: "Comprendre les modèles de fondation qui transforment l'industrie de l'intelligence artificielle.",
          content: `
# Introduction aux modèles de fondation en IA

Les modèles de fondation (foundation models) représentent un changement de paradigme dans le domaine de l'intelligence artificielle. Ces modèles massifs, entraînés sur d'énormes quantités de données, servent de base à une multitude d'applications spécifiques.

## Qu'est-ce qu'un modèle de fondation ?

Un modèle de fondation est un grand modèle d'IA préentraîné sur des données diverses et à grande échelle, conçu pour être adapté à de nombreuses tâches différentes. Des exemples notables incluent GPT-4, Claude, et DALL-E pour la génération d'images.

## Caractéristiques clés

### 1. Préentraînement à grande échelle

Ces modèles sont entraînés sur des ensembles de données massifs, parfois des milliards de documents ou d'images, ce qui leur permet d'acquérir une compréhension générale du langage ou des images.

### 2. Transfert d'apprentissage

Leur principal avantage est la capacité à transférer les connaissances à différentes tâches avec peu d'exemples supplémentaires (few-shot learning) ou même sans exemple (zero-shot learning).

### 3. Émergence de capacités

Les modèles de fondation présentent souvent des capacités émergentes - des compétences qui n'étaient pas explicitement programmées et qui apparaissent à mesure que les modèles deviennent plus grands.

## Applications pratiques

- **Traduction linguistique** : Traduction précise entre des centaines de langues
- **Génération de contenu** : Création de textes, d'images ou de code
- **Analyse de données** : Extraction d'informations pertinentes à partir de données non structurées
- **Assistants virtuels** : Interfaces conversationnelles capables de comprendre et de répondre à des requêtes complexes

## Défis et considérations éthiques

Malgré leurs capacités impressionnantes, les modèles de fondation soulèvent d'importantes questions éthiques :

- **Biais** : Ils peuvent perpétuer ou amplifier les biais présents dans les données d'entraînement
- **Transparence** : Leur fonctionnement interne est souvent difficile à interpréter
- **Accessibilité** : Les ressources nécessaires pour développer ces modèles limitent qui peut y participer

## Conclusion

Les modèles de fondation représentent une avancée significative dans le domaine de l'IA. Bien qu'ils offrent des possibilités sans précédent, il est crucial d'aborder leur développement et leur déploiement de manière responsable, en tenant compte des implications sociales et éthiques.
          `,
          featuredImage: "https://images.unsplash.com/photo-1677442135557-e0ba776eb8d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2832&q=80",
          categoryId: categories.find(c => c.slug === "intelligence-artificielle")?.id || categories[0].id,
          authorId: admin.id,
          status: "published",
          publishedAt: new Date(),
          readTime: 10,
          tags: ["IA", "Modèles de fondation", "Deep Learning", "NLP", "Machine Learning"]
        },
        {
          title: "Les principes fondamentaux de la Zero-Trust Security",
          slug: "principes-fondamentaux-zero-trust-security",
          excerpt: "Découvrez comment mettre en œuvre une architecture de sécurité Zero-Trust pour protéger votre infrastructure informatique.",
          content: `
# Les principes fondamentaux de la Zero-Trust Security

La sécurité Zero-Trust est un modèle de sécurité qui part du principe que rien ni personne ne doit être considéré comme digne de confiance par défaut, qu'il se trouve à l'intérieur ou à l'extérieur du périmètre du réseau.

## Le changement de paradigme

Traditionnellement, la sécurité informatique reposait sur le modèle du "château et du fossé" - une fois à l'intérieur du réseau, les utilisateurs étaient largement considérés comme dignes de confiance. L'approche Zero-Trust élimine ce concept de confiance implicite.

## Principes clés du Zero-Trust

### 1. Vérification continue

Vérifiez toujours, ne faites jamais confiance. Chaque tentative d'accès doit être authentifiée et autorisée, peu importe d'où elle provient.

### 2. Principe du moindre privilège

Accordez uniquement l'accès nécessaire pour effectuer une tâche spécifique, rien de plus. Cela limite l'impact potentiel d'une compromission.

### 3. Microsegmentation

Divisez votre réseau en segments plus petits, isolés les uns des autres, pour contenir les brèches potentielles.

### 4. Surveillance et analyse continues

Surveillez constamment l'activité pour détecter les comportements anormaux qui pourraient indiquer une compromission.

### 5. Authentification multifacteur (MFA)

Exigez plusieurs formes d'identification avant d'accorder l'accès aux ressources.

## Mise en œuvre pratique

La mise en œuvre d'une architecture Zero-Trust n'est pas un projet unique, mais plutôt un parcours continu :

1. **Identifiez vos ressources critiques** - Comprenez ce que vous protégez
2. **Cartographiez les flux de données** - Déterminez comment les informations circulent
3. **Créez des politiques d'accès** - Définissez qui a besoin d'accéder à quoi
4. **Mettez en place la surveillance** - Implémentez des outils pour détecter les activités suspectes
5. **Automatisez la réponse** - Développez des processus pour réagir rapidement aux incidents

## Conclusion

Dans un paysage de menaces en constante évolution, le modèle Zero-Trust offre une approche proactive pour sécuriser les environnements informatiques modernes. Bien que sa mise en œuvre puisse être complexe, les avantages en termes de posture de sécurité renforcée en valent la peine.
          `,
          featuredImage: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          categoryId: categories.find(c => c.slug === "cybersecurite")?.id || categories[0].id,
          authorId: admin.id,
          status: "published",
          publishedAt: new Date(),
          readTime: 9,
          tags: ["Cybersécurité", "Zero-Trust", "Authentification", "MFA", "Sécurité réseau"]
        },
        {
          title: "Comprendre les architectures JAMstack",
          slug: "comprendre-architectures-jamstack",
          excerpt: "Un guide détaillé sur les principes, avantages et cas d'usage des architectures JAMstack modernes.",
          content: `
# Comprendre les architectures JAMstack

Le JAMstack (JavaScript, APIs, Markup) est une architecture moderne de développement web qui offre d'excellentes performances, une sécurité renforcée et une expérience de développement améliorée.

## Qu'est-ce que le JAMstack ?

JAMstack n'est pas une technologie spécifique, mais plutôt une nouvelle façon de construire des sites web et des applications en utilisant :

- **J**avaScript côté client
- **A**PIs réutilisables
- **M**arkup prégénéré

## Principes fondamentaux

### 1. Prérendu et découplage

Les sites JAMstack sont précompilés, ce qui signifie que le HTML est généré à l'avance plutôt qu'à chaque requête. Le frontend est totalement découplé du backend.

### 2. Déploiement sur CDN

Les fichiers statiques générés sont déployés directement sur un CDN global, éliminant la nécessité de serveurs d'applications.

### 3. Revalidation et génération incrémentielle

Des techniques comme la génération statique incrémentielle (ISR) permettent de mettre à jour le contenu sans avoir à reconstruire l'ensemble du site.

## Avantages du JAMstack

- **Performance** : Temps de chargement considérablement réduits
- **Sécurité** : Surface d'attaque réduite (pas de serveur d'applications ou de base de données exposés)
- **Évolutivité** : Facilement scalable grâce aux CDN
- **Expérience développeur** : Flux de travail simplifiés avec des environnements locaux cohérents
- **Coût** : Généralement moins coûteux à héberger et à maintenir

## Outils populaires de l'écosystème JAMstack

- **Frameworks** : Next.js, Gatsby, Nuxt, Astro, SvelteKit
- **CMS headless** : Contentful, Sanity, Strapi, Ghost
- **Hébergement/déploiement** : Vercel, Netlify, Cloudflare Pages

## Quand utiliser le JAMstack ?

Le JAMstack excelle dans plusieurs scénarios :

- Sites vitrines d'entreprise
- Blogs et sites de contenu
- Commerce électronique (avec des API pour les paniers et paiements)
- Applications web avec authentification via des services d'identité

## Limites à considérer

Bien que puissant, le JAMstack n'est pas adapté à tous les cas d'usage :

- Applications nécessitant des mises à jour en temps réel fréquentes
- Systèmes avec des données hautement dynamiques et interdépendantes
- Applications où le contenu généré par l'utilisateur est primordial

## Conclusion

Le JAMstack représente une évolution significative dans le développement web, offrant un excellent équilibre entre performance, sécurité et expérience développeur. En comprenant ses principes et son écosystème, vous pouvez déterminer s'il constitue l'approche idéale pour votre prochain projet web.
          `,
          featuredImage: "https://images.unsplash.com/photo-1590959651373-a3db0f38a961?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          categoryId: categories.find(c => c.slug === "developpement-web")?.id || categories[0].id,
          authorId: admin.id,
          status: "published",
          publishedAt: new Date(),
          readTime: 8,
          tags: ["JAMstack", "Frontend", "Architecture Web", "Performance", "Netlify"]
        }
      ];

      for (const post of posts) {
        await storage.createBlogPost(post);
        console.log(`Article créé: ${post.title}`);
      }
    }

    console.log("Seeding blog demo data completed.");
  } catch (error) {
    console.error("Error seeding blog demo data:", error);
  }
}