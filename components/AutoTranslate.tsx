'use client'
import { useEffect, useRef } from 'react'
import { useLang } from '@/contexts/LanguageContext'

// ============================================================
// DICTIONNAIRE COMPLET FR → EN
// ============================================================
const DICT: Record<string, string> = {

  // ===== NAVIGATION =====
  'Accueil': 'Home',
  'Formations': 'Training',
  'Marketplace': 'Marketplace',
  'Alertes': 'Alerts',
  'Abonnements': 'Subscriptions',
  'Mon panier': 'My cart',
  'Mon espace': 'My space',
  'Mes commandes': 'My orders',
  'Administration': 'Administration',
  'Deconnexion': 'Logout',
  'Voir le site': 'View site',
  'Se connecter': 'Sign in',
  "S'inscrire": 'Sign up',
  'Connexion': 'Login',
  'Retour': 'Back',
  'Retour au site': 'Back to site',
  '← Retour au site': '← Back to site',

  // ===== HOMEPAGE =====
  'Plateforme 100% Gratuite • 18 Secteurs': '100% Free Platform • 18 Sectors',
  "La Securite, ca s'apprend.": 'Workplace Safety,',
  'Ensemble.': 'Together.',
  'Rechercher un secteur, un risque...': 'Search a sector, a risk...',
  'COMMENCER GRATUITEMENT': 'START FOR FREE',
  'EXPLORER LES SECTEURS': 'EXPLORE SECTORS',
  'RECHERCHER': 'SEARCH',
  '| 12 400+ professionnels formes': '| 12,400+ trained professionals',
  'Secteurs couverts': 'Sectors covered',
  'Contenus disponibles': 'Available content',
  'Utilisateurs actifs': 'Active learners',
  'Satisfaction': 'Satisfaction',
  'Formations par secteur': 'Training by sector',
  'Votre secteur,': 'Your sector,',
  'vos risques': 'your risks',
  "Des contenus specialises pour chaque metier — videos, documents, FAQ et alertes adaptees a votre domaine.": 'Specialized content for each profession — videos, documents, FAQ and alerts tailored to your field.',
  'Voir tous les secteurs': 'View all sectors',
  'Commencer': 'Start',
  'Alertes en temps reel': 'Real-time alerts',
  'Restez informe,': 'Stay informed,',
  'restez en securite': 'stay safe',
  'Toutes les alertes →': 'All alerts →',
  'Marketplace securite': 'Safety Marketplace',
  'Equipements &': 'Equipment &',
  'Services HSE': 'HSE Services',
  'Trouvez des equipements certifies, formations et services HSE aupres de fournisseurs verifies.': 'Find certified equipment, training and HSE services from verified suppliers.',
  'EXPLORER LE MARKETPLACE': 'EXPLORE MARKETPLACE',
  'Pret a commencer ?': 'Ready to start?',
  'Rejoignez des milliers de professionnels qui se forment gratuitement.': 'Join thousands of professionals training for free.',
  'CREER UN COMPTE GRATUIT': 'CREATE FREE ACCOUNT',
  'Sur devis': 'On quote',
  'Voir le marketplace': 'View marketplace',

  // ===== FOOTER =====
  'Formation securite gratuite': 'Free safety training',
  'La plateforme de reference pour la securite au travail en Afrique de l\'Ouest.': 'The reference platform for workplace safety in West Africa.',
  'Liens rapides': 'Quick links',
  'Secteurs de formation': 'Training sectors',
  'Alertes securite': 'Safety alerts',
  'A propos': 'About',
  'Contact': 'Contact',
  'Politique de confidentialite': 'Privacy policy',
  'Conditions d\'utilisation': 'Terms of use',
  'Mentions legales': 'Legal notice',
  'Nous contacter': 'Contact us',
  'Tous droits reserves': 'All rights reserved',
  'Fait avec': 'Made with',
  'pour la securite en Afrique': 'for safety in Africa',
  'Rejoindre la plateforme': 'Join the platform',
  'Inscription gratuite': 'Free registration',
  'Formations gratuites': 'Free trainings',
  'Newsletter': 'Newsletter',
  'Recevez les dernieres alertes': 'Receive the latest alerts',
  'Votre email': 'Your email',
  'S\'abonner': 'Subscribe',
  'Reseau social': 'Social network',
  'Suivez-nous': 'Follow us',
  '© 2024 Thinks Safety. Tous droits reserves.': '© 2024 Thinks Safety. All rights reserved.',
  '© 2025 Thinks Safety. Tous droits reserves.': '© 2025 Thinks Safety. All rights reserved.',

  // ===== SECTEURS =====
  'Construction BTP': 'Construction & Civil Engineering',
  'Sante & Medical': 'Health & Medical',
  'Industrie': 'Industry',
  'Transport & Logistique': 'Transport & Logistics',
  'Agriculture': 'Agriculture',
  'Bureaux & Tertiaire': 'Offices & Tertiary',
  'Energie': 'Energy',
  'Chimie & Pharmacie': 'Chemistry & Pharmacy',
  'Mines & Carrieres': 'Mining & Quarries',
  'Restauration': 'Food Service',
  'Maritime & Peche': 'Maritime & Fishing',
  'Securite & Defense': 'Security & Defense',
  'Numerique & IT': 'Digital & IT',
  'Education': 'Education',
  'Sport & Loisirs': 'Sports & Leisure',
  'Commerce': 'Commerce',
  'Transport Aerien': 'Air Transport',
  'Foret & Environnement': 'Forest & Environment',
  'Choisissez votre domaine pour acceder aux formations adaptees': 'Choose your field to access tailored training',
  'formations': 'trainings',
  'Aucun contenu disponible pour ce secteur.': 'No content available for this sector.',
  'Debutant': 'Beginner',
  'Intermediaire': 'Intermediate',
  'Avance': 'Advanced',
  'minutes': 'minutes',
  'pages': 'pages',
  'YouTube': 'YouTube',
  'Cliquez pour lancer': 'Click to play',
  'Telecharger': 'Download',
  'Ouvrir': 'Open',
  'Ouvrir le document': 'Open document',
  'Aucun fichier disponible': 'No file available',
  'Voir plus': 'View more',
  'Voir moins': 'View less',

  // ===== MARKETPLACE =====
  'Marketplace Securite': 'Safety Marketplace',
  'Trouvez equipements et prestataires certifies pres de chez vous.': 'Find certified equipment and providers near you.',
  'Rechercher EPI, formation, service...': 'Search PPE, training, service...',
  'Publier une annonce': 'Post an ad',
  'Ajouter': 'Add',
  'Demander': 'Request',
  'Article ajoute au panier !': 'Item added to cart!',
  'Certifie': 'Certified',
  'Aucune annonce trouvee': 'No listings found',
  'Ajouter un produit ou service': 'Add a product or service',
  'Publiez une annonce directement sur le marketplace.': 'Post an ad directly on the marketplace.',
  'EPI': 'PPE',
  'Formation': 'Training',
  'Service HSE': 'HSE Service',
  'Detection': 'Detection',
  'Incendie': 'Fire Safety',
  'Signalisation': 'Signage',
  'Premiers secours': 'First Aid',
  'Autre': 'Other',
  'Tous': 'All',
  'Toutes': 'All',
  'Vendeur': 'Seller',
  'Vendeur :': 'Seller:',
  'Acces restreint': 'Restricted access',
  'Seules les entreprises inscrites et les administrateurs peuvent publier des annonces sur le marketplace.': 'Only registered companies and administrators can post listings.',
  'Creer un compte entreprise': 'Create company account',
  'Annonce soumise !': 'Listing submitted!',
  'Votre annonce est en cours de moderation. Validation sous 24-48h.': 'Your listing is under review. Validation within 24-48h.',
  'Annonce publiee !': 'Listing published!',
  'Votre annonce est immediatement visible sur le marketplace.': 'Your listing is immediately visible.',
  'Gerer les annonces': 'Manage listings',
  'Titre de l\'annonce *': 'Listing title *',
  'Ex: Kit EPI complet BTP': 'Ex: Complete PPE kit',
  'Prix fixe': 'Fixed price',
  'Location / jour': 'Rental / day',
  'Nom / Entreprise': 'Name / Company',
  'Votre nom ou celui de votre entreprise': 'Your name or company name',
  'contact@email.com': 'contact@email.com',
  'Cotonou, Benin': 'Cotonou, Benin',
  '+229 97 XX XX XX': '+229 97 XX XX XX',
  'Decrivez votre produit ou service en detail...': 'Describe your product or service in detail...',
  'Publier maintenant': 'Publish now',
  'Soumettre pour validation': 'Submit for review',
  'Publication directe en tant qu\'administrateur.': 'Direct publication as administrator.',
  'Validation sous 24-48h par notre equipe.': 'Review within 24-48h by our team.',
  'Retour au marketplace': 'Back to marketplace',
  'PUBLIER': 'PUBLISH',
  'Admin': 'Admin',
  'Publication directe': 'Direct publication',

  // ===== ALERTES PAGE =====
  'Alertes Securite': 'Safety Alerts',
  'Restez informe des dangers et incidents dans votre secteur': 'Stay informed about hazards in your sector',
  'Actives': 'Active',
  'Archivees': 'Archived',
  'Aucune alerte trouvee': 'No alerts found',
  'URGENCE': 'EMERGENCY',
  'DANGER': 'DANGER',
  'ATTENTION': 'WARNING',
  'INFO': 'INFO',
  'Active': 'Active',
  'Archivee': 'Archived',
  'urgence': 'emergency',
  'danger': 'danger',
  'attention': 'warning',
  'info': 'info',

  // ===== AUTH =====
  'Email': 'Email',
  'Mot de passe': 'Password',
  'Oublie ?': 'Forgot?',
  'Connexion...': 'Connecting...',
  'Quel est votre profil ?': 'What is your profile?',
  'Je veux apprendre': 'I want to learn',
  'Acces gratuit a toutes les formations securite': 'Free access to all safety training',
  'Je suis une entreprise': 'I am a company',
  'Vente de materiel securite, EPI, formations certifiantes': 'Safety equipment, PPE, certified training',
  'Creer mon compte': 'Create my account',
  'Creation...': 'Creating...',
  'Prenom': 'First name',
  'Nom': 'Last name',
  "Nom de l'entreprise": 'Company name',
  "Domaine d'activite": 'Field of activity',
  'Telephone': 'Phone',
  'Localisation': 'Location',
  'En continuant, vous acceptez nos': 'By continuing, you accept our',
  'CGU': 'Terms',
  'Minimum 8 caracteres': 'Minimum 8 characters',
  'Aller a la connexion': 'Go to login',
  'Une entreprise est specialisee dans un seul domaine.': 'A company specializes in one domain only.',
  'votre@email.com': 'your@email.com',
  'Votre mot de passe': 'Your password',
  'Choisir un domaine': 'Choose a domain',
  'Jean': 'John',
  'Dupont': 'Smith',
  'SafeEquip SARL': 'SafeEquip Ltd',

  // ===== DASHBOARD =====
  'Bienvenue sur Thinks Safety !': 'Welcome to Thinks Safety!',
  "Votre compte est pret. Choisissez un secteur d'activite pour commencer votre premiere formation gratuitement.": 'Your account is ready. Choose a sector to start your first free training.',
  'Choisir mon premier secteur': 'Choose my first sector',
  'Secteurs populaires': 'Popular sectors',
  'Mes formations': 'My trainings',
  'Mes certificats': 'My certificates',
  'Formations suivies': 'Followed trainings',
  'Terminees': 'Completed',
  'En cours': 'In progress',
  'Certificats': 'Certificates',
  'Aucune formation commencee': 'No training started',
  'Parcourir les formations': 'Browse trainings',
  'Completez des formations pour obtenir vos certificats': 'Complete trainings to earn certificates',
  'Voir toutes les formations': 'View all trainings',
  'Votre espace formation personnel': 'Your personal training space',
  'Bonjour,': 'Hello,',
  'cher membre': 'dear member',

  // ===== PANIER =====
  'Mon Panier': 'My Cart',
  'Votre panier est vide': 'Your cart is empty',
  'Parcourez le marketplace pour trouver des equipements de securite.': 'Browse the marketplace to find safety equipment.',
  'Explorer le marketplace': 'Explore marketplace',
  'Total': 'Total',
  'Passer la commande': 'Place order',
  'Continuer mes achats': 'Continue shopping',
  'Vos informations': 'Your information',
  'Confirmer la commande': 'Confirm order',
  'Envoi...': 'Sending...',
  'Commande confirmee !': 'Order confirmed!',
  'Les vendeurs vous contacteront directement par telephone ou email.': 'Sellers will contact you directly by phone or email.',
  'Resume': 'Summary',
  'Retour au panier': 'Back to cart',
  'Adresse': 'Address',
  'Ville': 'City',
  'Pays': 'Country',
  'Notes': 'Notes',
  'article': 'item',
  'articles': 'items',
  'Instructions de livraison, precisions...': 'Delivery instructions, details...',
  'Notes / Instructions': 'Notes / Instructions',
  'Votre commande': 'Your order',
  'Les vendeurs vous contacteront directement.': 'Sellers will contact you directly.',

  // ===== ABONNEMENTS =====
  'Pour les entreprises': 'For companies',
  'Choisissez votre abonnement': 'Choose your subscription',
  'Mensuel': 'Monthly',
  'Annuel': 'Annual',
  '-17%': '-17%',
  'Gratuit': 'Free',
  'Plus populaire': 'Most popular',
  'Commencer gratuitement': 'Start for free',
  'Choisir': 'Choose',
  'Questions frequentes': 'Frequently asked questions',
  'Vendez vos equipements de securite, formations et services HSE sur la plateforme la plus consultee d\'Afrique de l\'Ouest.': 'Sell your safety equipment, training and HSE services on the most visited platform in West Africa.',
  'Puis-je changer de plan a tout moment ?': 'Can I change plan at any time?',
  'Oui, vous pouvez upgrader ou downgrader votre abonnement a tout moment depuis votre espace entreprise.': 'Yes, you can upgrade or downgrade your subscription anytime.',
  'Quels moyens de paiement sont acceptes ?': 'What payment methods are accepted?',
  'MTN MoMo, Orange Money, Moov Money, Wave, carte bancaire et PayPal.': 'MTN MoMo, Orange Money, Moov Money, Wave, credit card and PayPal.',
  'Que se passe-t-il si je depasse ma limite d\'annonces ?': 'What if I exceed my listing limit?',
  'Vos annonces restent visibles mais vous ne pourrez pas en ajouter de nouvelles tant que vous n\'avez pas supprime ou upgrade.': 'Your listings remain visible but you cannot add new ones until you delete some or upgrade.',
  'Les commandes des clients sont-elles visibles sans abonnement ?': 'Are customer orders visible without subscription?',
  'Oui, mais les informations de contact (telephone, email, adresse) sont masquees.': 'Yes, but contact info (phone, email, address) is hidden.',
  'FCFA/mois': 'FCFA/month',

  // ===== MES COMMANDES =====
  'Mes Commandes': 'My Orders',
  'commandes recues': 'orders received',
  'Debloquez les informations de contact': 'Unlock contact information',
  'Aucune commande pour l\'instant': 'No orders yet',
  'Vos commandes apparaitront ici des qu\'un client passera une commande pour vos produits.': 'Orders will appear here when a customer orders your products.',
  'Informations client': 'Customer information',
  'Nom complet': 'Full name',
  'En attente': 'Pending',
  'Confirmee': 'Confirmed',
  'Livree': 'Delivered',
  'Annulee': 'Cancelled',
  'Article commande': 'Ordered item',
  'Plan Gratuit': 'Free Plan',
  'Debloquer avec un abonnement Basic': 'Unlock with a Basic subscription',

  // ===== RECHERCHE =====
  'Rechercher sur Thinks Safety...': 'Search Thinks Safety...',
  'Aucun resultat pour': 'No results for',
  'resultats pour': 'results for',
  'Voir le contenu': 'View content',
  'Recherche': 'Search',

  // ===== MAINTENANCE =====
  'Site en maintenance': 'Site under maintenance',
  "Nous effectuons des ameliorations pour vous offrir une meilleure experience. Nous serons de retour tres bientot.": "We're making improvements for a better experience. We'll be back very soon.",
  'Travaux en cours...': 'Work in progress...',
  'Acces administrateur': 'Administrator access',

  // ===== ADMIN SIDEBAR =====
  'Dashboard': 'Dashboard',
  'Utilisateurs': 'Users',
  'Entreprises': 'Companies',
  'Contenus': 'Contents',
  'Ajouter contenu': 'Add content',
  'Commandes': 'Orders',
  'Config Paiements': 'Payment Config',
  'Parametres': 'Settings',
  'Documentation Dev': 'Dev Documentation',
  'Nouveau contenu': 'New content',
  'Connecte en tant que': 'Connected as',

  // ===== ADMIN DASHBOARD =====
  'Tableau de bord': 'Dashboard',
  "Vue d'ensemble de Thinks Safety": 'Thinks Safety overview',
  'Actions rapides': 'Quick actions',
  'Derniers inscrits': 'Latest registrations',
  'Derniers contenus': 'Latest content',
  'Ajouter un contenu': 'Add content',
  'Publier une alerte': 'Publish alert',
  'Moderer les annonces': 'Moderate listings',
  'Gerer les utilisateurs': 'Manage users',
  'Voir tout': 'View all',
  'comptes inscrits': 'registered accounts',
  'contenus au total': 'total contents',
  'annonces au total': 'total listings',
  'commandes au total': 'total orders',
  'entreprises enregistrees': 'registered companies',
  'alertes actives': 'active alerts',
  'Creer le premier contenu': 'Create first content',
  'Super Admin': 'Super Admin',
  'Administrateur': 'Administrator',
  'Moderateur': 'Moderator',

  // ===== ADMIN UTILISATEURS =====
  'Creer un compte': 'Create account',
  'Modifier l\'utilisateur': 'Edit user',
  'Organisation': 'Organisation',
  'Role': 'Role',
  'Inscription': 'Registration',
  'Actions': 'Actions',
  'Sauvegarder': 'Save',
  'Annuler': 'Cancel',
  'Supprimer': 'Delete',
  'Modifier': 'Edit',
  'user': 'user',
  'moderateur': 'moderator',
  'admin': 'admin',
  'superadmin': 'superadmin',
  'Aucun utilisateur trouve': 'No users found',
  'Rechercher par nom, email...': 'Search by name, email...',

  // ===== ADMIN CONTENUS =====
  'Retour aux contenus': 'Back to contents',
  'Modifier le contenu': 'Edit content',
  'Type de contenu': 'Content type',
  'Video': 'Video',
  'Document': 'Document',
  'Informations': 'Information',
  'Titre': 'Title',
  'Description': 'Description',
  'Secteur': 'Sector',
  'Tous secteurs': 'All sectors',
  'Niveau': 'Level',
  'Tags (separes par virgule)': 'Tags (comma separated)',
  'EPI, chantier, BTP...': 'PPE, construction site...',
  'Publication': 'Publication',
  'Statut': 'Status',
  'Brouillon': 'Draft',
  'En revision': 'In review',
  'Publie': 'Published',
  'Publier': 'Publish',
  'Enregistrer brouillon': 'Save draft',
  'Enregistrement...': 'Saving...',
  'Contenu cree !': 'Content created!',
  'Contenu mis a jour !': 'Content updated!',
  'Contenu publie !': 'Content published!',
  'Contenu payant': 'Paid content',
  'Ce contenu est gratuit pour tous.': 'This content is free for everyone.',
  "Prix d'acces (FCFA)": 'Access price (FCFA)',
  'Lien YouTube *': 'YouTube Link *',
  'La video sera integree sans branding YouTube — les visiteurs ne voient que votre contenu.': 'Video embedded without YouTube branding.',
  'Upload direct': 'Direct upload',
  'Apercu': 'Preview',
  'Duree (minutes)': 'Duration (minutes)',
  'URL du fichier PDF': 'PDF file URL',
  'Nombre de pages': 'Number of pages',
  'Question *': 'Question *',
  'Reponse *': 'Answer *',
  'Quelle est la question ?': 'What is the question?',
  'Reponse detaillee...': 'Detailed answer...',
  'Guide': 'Guide',
  'Tous les types': 'All types',
  'Tous les statuts': 'All statuses',
  'Titre du contenu': 'Content title',
  'Aucun contenu': 'No content',
  'Vues': 'Views',
  'Type': 'Type',
  'video': 'video',
  'document': 'document',
  'faq': 'faq',
  'published': 'published',
  'draft': 'draft',
  'review': 'review',

  // ===== ADMIN ALERTES =====
  'Nouvelle alerte': 'New alert',
  'Modifier alerte': 'Edit alert',
  "Titre de l'alerte": 'Alert title',
  "Description detaillee de l'alerte...": 'Detailed alert description...',
  'Niveau *': 'Level *',
  'Source': 'Source',
  'MTFPSS, OIT...': 'MTFPSS, ILO...',
  'Archiver': 'Archive',
  'Aucune alerte publiee': 'No alerts published',
  'Creer la premiere alerte': 'Create first alert',
  'Alerte mise a jour !': 'Alert updated!',
  'Alerte publiee !': 'Alert published!',

  // ===== ADMIN MARKETPLACE =====
  'Nouvelle annonce': 'New listing',
  'En attente (0)': 'Pending (0)',
  'Rejetees': 'Rejected',
  'Approuver': 'Approve',
  'Suspendre': 'Suspend',
  'Reactiver': 'Reactivate',
  'Annonce approuvee !': 'Listing approved!',
  'Annonce suspendue.': 'Listing suspended.',
  'Annonce creee !': 'Listing created!',
  'Annonce mise a jour !': 'Listing updated!',
  'Creer une annonce': 'Create a listing',
  'Modifier l\'annonce': 'Edit listing',
  'Nouvelle annonce marketplace': 'New marketplace listing',
  'Produit / Service': 'Product / Service',
  'Vendeur / Contact': 'Seller / Contact',
  'Mettre a jour': 'Update',
  "Publier l'annonce": 'Publish listing',
  'Prix (FCFA)': 'Price (FCFA)',
  '0 = Sur devis': '0 = On quote',
  'Choisir...': 'Choose...',
  'Vendeur certifie (badge bleu)': 'Certified seller (blue badge)',
  'Approuve (visible)': 'Approved (visible)',

  // ===== ADMIN COMMANDES =====
  'Rechercher par numero, nom, email...': 'Search by order number, name, email...',
  'Details': 'Details',
  'Articles commandes': 'Ordered items',
  'article(s)': 'item(s)',

  // ===== ADMIN ENTREPRISES =====
  'Creer une entreprise': 'Create company',
  'Responsable / Compte': 'Manager / Account',
  'Informations entreprise': 'Company information',
  "Nom de l'entreprise *": 'Company name *',
  "Plan d'abonnement": 'Subscription plan',
  'Creer l\'entreprise': 'Create company',
  'Entreprise creee avec succes !': 'Company created successfully!',
  'Changer plan': 'Change plan',
  'Actif': 'Active',
  'Suspendu': 'Suspended',
  'Aucune entreprise trouvee': 'No companies found',
  'Rechercher par nom d\'entreprise ou email...': 'Search by company name or email...',
  'Domaine': 'Domain',
  'Abonnement': 'Subscription',
  'Aucun': 'None',

  // ===== ADMIN ABONNEMENTS =====
  "Plans d'abonnement": 'Subscription plans',
  'Configurez les offres pour les entreprises': 'Configure offers for companies',
  'Nouveau plan': 'New plan',
  'Plan sauvegarde !': 'Plan saved!',
  'Inactif': 'Inactive',
  'Annonces illimitees': 'Unlimited listings',
  'Badge certifie': 'Certified badge',
  'Priorite dans les resultats': 'Priority in results',
  'Statistiques avancees': 'Advanced analytics',
  'Support prioritaire': 'Priority support',
  'Voir les details complets des commandes': 'View full order details',
  'Plan actif (visible aux entreprises)': 'Active plan (visible to companies)',
  'Nom du plan *': 'Plan name *',
  'Professionnel': 'Professional',
  'Prix mensuel (FCFA)': 'Monthly price (FCFA)',
  'Prix annuel (FCFA)': 'Annual price (FCFA)',
  'Limite annonces': 'Listing limit',
  'Acces aux commandes': 'Order access',
  'Details complets des commandes (telephone, email, adresse)': 'Full order details (phone, email, address)',
  'Fonctionnalites (une par ligne)': 'Features (one per line)',
  'Illimitees': 'Unlimited',

  // ===== ADMIN PAIEMENTS =====
  'Configuration des paiements': 'Payment configuration',
  'Configurez les passerelles de paiement pour les abonnements et commandes': 'Configure payment gateways for subscriptions and orders',
  'Integration prete a connecter': 'Ready to connect integration',
  'Toutes les passerelles sont preparees.': 'All gateways are ready.',
  'Paiements Afrique de l\'Ouest': 'West Africa Payments',
  'Recommandes': 'Recommended',
  'Paiements Internationaux': 'International Payments',
  'Cles API configurees': 'API keys configured',
  'Aucune cle API configuree': 'No API keys configured',
  'Configurer': 'Configure',
  'Tester': 'Test',
  'Activer': 'Activate',
  'Desactiver': 'Deactivate',
  "Mode d'operation": 'Operation mode',
  'Test (Sandbox) — Aucune vraie transaction': 'Test (Sandbox) — No real transactions',
  'Production (Live) — Vraies transactions': 'Production (Live) — Real transactions',
  'Voir la documentation officielle': 'View official documentation',
  'Activer ce moyen de paiement': 'Activate this payment method',
  'Cle publique (commence par pk_test_ en test)': 'Public key (starts with pk_test_ in test)',
  'Cle secrete (commence par sk_test_ en test)': 'Secret key (starts with sk_test_ in test)',
  'Depuis Stripe Dashboard > Developers > Webhooks': 'From Stripe Dashboard > Developers > Webhooks',
  'Les cles sont stockees de facon securisee.': 'Keys are stored securely.',

  // ===== ADMIN PARAMETRES =====
  'Configuration generale de la plateforme': 'General platform configuration',
  'Informations du site': 'Site information',
  'Nom du site': 'Site name',
  'Email de contact': 'Contact email',
  'Pays principal': 'Main country',
  'Devise': 'Currency',
  'Options': 'Options',
  'Mode maintenance': 'Maintenance mode',
  'Desactive l\'acces public temporairement': 'Temporarily disables public access',
  'Inscriptions ouvertes': 'Open registrations',
  'Permet aux nouveaux utilisateurs de s\'inscrire': 'Allows new users to register',
  'Sauvegarder les modifications': 'Save changes',
  'Parametres sauvegardes !': 'Settings saved!',
  '⚠️ Actif — le site public est inaccessible': '⚠️ Active — public site is inaccessible',
  '⚠️ Mode maintenance active !': '⚠️ Maintenance mode activated!',
  '✅ Site remis en ligne !': '✅ Site back online!',
  'Mode maintenance actif': 'Maintenance mode active',
  'Le site public affiche une page de maintenance. Seuls les admins peuvent acceder au site.': 'The public site shows a maintenance page. Only admins can access the site.',

  // ===== ADMIN DOCUMENTATION =====
  "Vue d'ensemble": 'Overview',
  'Stack technique': 'Technical stack',
  'Structure GitHub': 'GitHub structure',
  "Base de données": 'Database',
  'Composants & Classes': 'Components & Classes',
  'APIs & Services': 'APIs & Services',
  'Déploiement': 'Deployment',
  'Testeur API': 'API Tester',
  'Guide développeur complet': 'Complete developer guide',
  'Accès restreint': 'Restricted access',

  // ===== COMMON =====
  'Oui': 'Yes',
  'Non': 'No',
  'Fermer': 'Close',
  'Suivant': 'Next',
  'Precedent': 'Previous',
  'Envoyer': 'Send',
  'Chargement...': 'Loading...',
  'Erreur': 'Error',
  'Succes': 'Success',
  'Verification des droits...': 'Checking access...',
  'Erreur profil:': 'Profile error:',
  'Erreur d\'acces': 'Access error',
  'approved': 'approved',
  'pending': 'pending',
  'rejected': 'rejected',
}

// ===== PLACEHOLDERS à traduire =====
const PLACEHOLDER_DICT: Record<string, string> = {
  'Rechercher un secteur, un risque...': 'Search a sector, a risk...',
  'Rechercher EPI, formation, service...': 'Search PPE, training, service...',
  'Rechercher...': 'Search...',
  'Rechercher par nom, email...': 'Search by name, email...',
  'Rechercher par numero, nom, email...': 'Search by order number, name, email...',
  'Rechercher par nom d\'entreprise ou email...': 'Search by company name or email...',
  'Titre du contenu': 'Content title',
  'votre@email.com': 'your@email.com',
  'Votre mot de passe': 'Your password',
  'Minimum 8 caracteres': 'Minimum 8 characters',
  'Jean': 'John',
  'Dupont': 'Smith',
  'SafeEquip SARL': 'SafeEquip Ltd',
  'Cotonou, Benin': 'Cotonou, Benin',
  '+229 97 XX XX XX': '+229 97 XX XX XX',
  'Decrivez votre produit ou service en detail...': 'Describe your product or service...',
  "Description courte du contenu...": 'Short content description...',
  'Titre du contenu': 'Content title',
  'https://www.youtube.com/watch?v=...': 'https://www.youtube.com/watch?v=...',
  'https://...': 'https://...',
  'Quelle est la question ?': 'What is the question?',
  'Reponse detaillee...': 'Detailed answer...',
  'EPI, chantier, BTP...': 'PPE, construction site...',
  'Titre de l\'alerte': 'Alert title',
  "Description detaillee de l'alerte...": 'Detailed alert description...',
  'MTFPSS, OIT...': 'MTFPSS, ILO...',
  'Ex: Kit EPI complet BTP': 'Ex: Complete PPE kit',
  '0 = Sur devis': '0 = On quote',
  'Votre nom ou celui de votre entreprise': 'Your name or company name',
  'contact@email.com': 'contact@email.com',
  'Instructions de livraison, precisions...': 'Delivery instructions, details...',
  'Rechercher sur Thinks Safety...': 'Search Thinks Safety...',
  'Nom du plan *': 'Plan name *',
}

// ===== ARIA labels / titles =====
const ATTR_DICT: Record<string, string> = {
  'Changer de langue': 'Change language',
  'Sombre': 'Dark',
  'Clair': 'Light',
  'Auto': 'Auto',
  'Depublier': 'Unpublish',
  'Publier': 'Publish',
  'Modifier': 'Edit',
  'Supprimer': 'Delete',
  'Archiver': 'Archive',
  'Activer': 'Activate',
  'Suspendre': 'Suspend',
}

// ============================================================
// Nœuds/tags à ignorer
// ============================================================
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'CODE', 'PRE', 'SVG'])

// Stockage des originaux
const textOriginals = new WeakMap<Text, string>()
const attrOriginals = new WeakMap<Element, Record<string, string>>()

// ============================================================
// TRADUCTION DES NOEUDS TEXTE
// ============================================================
function translateTextNode(node: Text, toEN: boolean) {
  const content = node.textContent || ''
  const trimmed = content.trim()
  if (!trimmed || trimmed.length < 2) return

  if (toEN) {
    if (!textOriginals.has(node)) {
      textOriginals.set(node, content)
    }

    // Correspondance exacte
    if (DICT[trimmed]) {
      node.textContent = content.replace(trimmed, DICT[trimmed])
      return
    }

    // Correspondance partielle
    let result = content
    for (const [fr, en] of Object.entries(DICT)) {
      if (fr.length > 3 && result.includes(fr)) {
        result = result.split(fr).join(en)
      }
    }
    if (result !== content) node.textContent = result
  } else {
    const original = textOriginals.get(node)
    if (original !== undefined) {
      node.textContent = original
    }
  }
}

// ============================================================
// TRADUCTION DES ATTRIBUTS (placeholder, title, alt, aria-label)
// ============================================================
function translateAttributes(element: Element, toEN: boolean) {
  const attrs = ['placeholder', 'title', 'aria-label', 'alt']

  if (toEN) {
    const stored: Record<string, string> = {}
    let hasChange = false

    attrs.forEach(attr => {
      const val = element.getAttribute(attr)
      if (!val) return
      const translated = PLACEHOLDER_DICT[val] || ATTR_DICT[val]
      if (translated && translated !== val) {
        stored[attr] = val
        element.setAttribute(attr, translated)
        hasChange = true
      }
    })

    if (hasChange && !attrOriginals.has(element)) {
      attrOriginals.set(element, stored)
    }
  } else {
    const stored = attrOriginals.get(element)
    if (stored) {
      Object.entries(stored).forEach(([attr, val]) => {
        element.setAttribute(attr, val)
      })
    }
  }
}

// ============================================================
// RÉCURSEUR DOM
// ============================================================
function walkAndTranslate(element: Element, toEN: boolean) {
  // Traduire les attributs de l'élément
  translateAttributes(element, toEN)

  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      translateTextNode(child as Text, toEN)
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element
      if (
        !SKIP_TAGS.has(el.tagName) &&
        !el.hasAttribute('data-notranslate') &&
        !el.closest('[data-notranslate]')
      ) {
        walkAndTranslate(el, toEN)
      }
    }
  }
}

// ============================================================
// COMPOSANT
// ============================================================
export default function AutoTranslate() {
  const { lang } = useLang()
  const observerRef = useRef<MutationObserver | null>(null)

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    const body = document.body
    const toEN = lang === 'en'

    const timer = setTimeout(() => {
      walkAndTranslate(body, toEN)

      if (toEN) {
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            for (const node of Array.from(mutation.addedNodes)) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                walkAndTranslate(node as Element, true)
              }
            }
          }
        })
        observer.observe(body, { childList: true, subtree: true })
        observerRef.current = observer
      }
    }, 200)

    return () => {
      clearTimeout(timer)
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [lang])

  return null
}
