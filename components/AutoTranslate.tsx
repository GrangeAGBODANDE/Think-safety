'use client'
import { useEffect } from 'react'
import { useLang } from '@/contexts/LanguageContext'

// ============================================================
// DICTIONNAIRE COMPLET FR → EN
// Couvre tout le site : nav, pages, admin, boutons, formulaires
// ============================================================
const DICT: Record<string, string> = {
  // === NAVIGATION ===
  'Accueil': 'Home',
  'Formations': 'Training',
  'Marketplace': 'Marketplace',
  'Alertes': 'Alerts',
  'Abonnements': 'Subscriptions',
  'Rechercher': 'Search',
  'Mon panier': 'My cart',
  'Connexion': 'Login',
  'Mon espace': 'My space',
  'Mes commandes': 'My orders',
  'Administration': 'Administration',
  'Deconnexion': 'Logout',
  'Voir le site': 'View site',

  // === PAGE ACCUEIL ===
  "Plateforme 100% Gratuite • 18 Secteurs": '100% Free Platform • 18 Sectors',
  "La Securite, ca s'apprend.": 'Workplace Safety,',
  'Ensemble.': 'Together.',
  "Formez-vous gratuitement aux regles de securite dans": 'Train for free on safety rules across',
  "tous les secteurs d'activite": 'all professional sectors',
  ". Videos, documents, quiz, alertes locales et marketplace.": '. Videos, documents, quizzes, local alerts and marketplace.',
  'Rechercher un secteur, un risque...': 'Search a sector, a risk...',
  'COMMENCER GRATUITEMENT': 'START FOR FREE',
  'EXPLORER LES SECTEURS': 'EXPLORE SECTORS',
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
  'Think Safety': 'Think Safety',
  'Pret a commencer ?': 'Ready to start?',
  'Rejoignez des milliers de professionnels qui se forment gratuitement.': 'Join thousands of professionals training for free.',
  'CREER UN COMPTE GRATUIT': 'CREATE FREE ACCOUNT',
  'Sur devis': 'On quote',
  'RECHERCHER': 'SEARCH',

  // === SECTEURS ===
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
  'Secteurs de formation': 'Training sectors',
  'Choisissez votre domaine pour acceder aux formations adaptees': 'Choose your field to access tailored training',
  'formations': 'trainings',
  'Videos': 'Videos',
  'Documents': 'Documents',
  'FAQ': 'FAQ',
  'Aucun contenu disponible pour ce secteur.': 'No content available for this sector.',
  'Debutant': 'Beginner',
  'Intermediaire': 'Intermediate',
  'Avance': 'Advanced',
  'minutes': 'minutes',
  'pages': 'pages',

  // === MARKETPLACE ===
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
  'Tous': 'All',
  'Toutes': 'All',
  'Vendeur': 'Seller',
  'Certifie': 'Certified',

  // === ALERTES ===
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
  'Source': 'Source',
  'Region': 'Region',
  'National': 'National',

  // === AUTH ===
  'Se connecter': 'Sign in',
  "S'inscrire": 'Sign up',
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
  'Retour au site': 'Back to site',
  'Prenom': 'First name',
  'Nom': 'Last name',
  "Nom de l'entreprise": 'Company name',
  "Domaine d'activite": 'Field of activity',
  'Telephone': 'Phone',
  'Localisation': 'Location',
  'En continuant, vous acceptez nos': 'By continuing, you accept our',
  'CGU': 'Terms',
  'Retour': 'Back',
  'Compte cree ! Verifiez votre email pour confirmer votre compte, puis connectez-vous.': 'Account created! Check your email to confirm, then log in.',
  'Aller a la connexion': 'Go to login',
  'Une entreprise est specialisee dans un seul domaine.': 'A company specializes in one domain only.',
  'Minimum 8 caracteres': 'Minimum 8 characters',
  'Verification des droits...': 'Checking access...',
  'Votre mot de passe': 'Your password',
  'votre@email.com': 'your@email.com',
  'Choisir un domaine': 'Choose a domain',
  'Cotonou, Benin': 'Cotonou, Benin',
  '+229 97 XX XX XX': '+229 97 XX XX XX',
  'SafeEquip SARL': 'SafeEquip SARL',
  'Jean': 'John',
  '← Retour au site': '← Back to site',

  // === DASHBOARD ===
  'Bienvenue sur Think Safety !': 'Welcome to Think Safety!',
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
  'Bonjour,': 'Hello,',
  'Votre espace formation personnel': 'Your personal training space',
  'Vue d\'ensemble': 'Overview',
  'Voir toutes les formations': 'View all trainings',
  'Cliquez pour lancer': 'Click to play',

  // === PANIER ===
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
  'Notes / Instructions': 'Notes / Instructions',
  'Instructions de livraison, precisions...': 'Delivery instructions, details...',
  'article': 'item',
  'articles': 'items',
  'Qte:': 'Qty:',

  // === ABONNEMENTS ===
  'Pour les entreprises': 'For companies',
  'Choisissez votre abonnement': 'Choose your subscription',
  'Mensuel': 'Monthly',
  'Annuel': 'Annual',
  'Gratuit': 'Free',
  'Plus populaire': 'Most popular',
  'Commencer gratuitement': 'Start for free',
  'Choisir': 'Choose',
  'Questions frequentes': 'Frequently asked questions',
  'Puis-je changer de plan a tout moment ?': 'Can I change plan at any time?',
  'Oui, vous pouvez upgrader ou downgrader votre abonnement a tout moment depuis votre espace entreprise.': 'Yes, you can upgrade or downgrade your subscription at any time from your company space.',
  'Quels moyens de paiement sont acceptes ?': 'What payment methods are accepted?',
  'Que se passe-t-il si je depasse ma limite d\'annonces ?': 'What happens if I exceed my ad limit?',
  'Les commandes des clients sont-elles visibles sans abonnement ?': 'Are customer orders visible without subscription?',
  'Oui, mais les informations de contact': 'Yes, but contact information',

  // === MES COMMANDES ===
  'Mes Commandes': 'My Orders',
  'commandes recues': 'orders received',
  'Debloquez les informations de contact': 'Unlock contact information',
  "Vous recevez des commandes ! Passez a un abonnement Basic pour voir les noms, telephones et adresses de vos clients.": "You're receiving orders! Upgrade to Basic to see customer names, phones and addresses.",
  "S'abonner": 'Subscribe',
  'Aucune commande pour l\'instant': 'No orders yet',
  'Vos commandes apparaitront ici': 'Your orders will appear here',
  'Publier une annonce': 'Post an ad',
  'Informations client': 'Customer information',
  'Informations de contact': 'Contact information',
  'Debloquer avec un abonnement Basic': 'Unlock with a Basic subscription',
  'Article commande': 'Ordered item',
  'En attente': 'Pending',
  'Confirmee': 'Confirmed',
  'En cours': 'In progress',
  'Livree': 'Delivered',
  'Annulee': 'Cancelled',
  'Nom': 'Name',
  'Adresse': 'Address',
  'Ville': 'City',
  'Notes': 'Notes',

  // === ADMIN ===
  'Dashboard': 'Dashboard',
  'Utilisateurs': 'Users',
  'Entreprises': 'Companies',
  'Contenus': 'Contents',
  'Ajouter contenu': 'Add content',
  'Marketplace': 'Marketplace',
  'Commandes': 'Orders',
  'Config Paiements': 'Payment Config',
  'Parametres': 'Settings',
  'Documentation Dev': 'Dev Documentation',
  'Nouveau contenu': 'New content',
  'Connecte en tant que': 'Connected as',
  'Tableau de bord': 'Dashboard',
  "Vue d'ensemble de Think Safety": 'Think Safety overview',
  'Actions rapides': 'Quick actions',
  'Derniers inscrits': 'Latest registrations',
  'Derniers contenus': 'Latest content',
  'Ajouter un contenu': 'Add content',
  'Publier une alerte': 'Publish alert',
  'Moderer les annonces': 'Moderate listings',
  'Gerer les utilisateurs': 'Manage users',
  'Voir tout': 'View all',
  'Creer le premier contenu': 'Create first content',
  'comptes inscrits': 'registered accounts',
  'Super Administrateur': 'Super Administrator',
  'Administrateur': 'Administrator',
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
  'Publier': 'Publish',
  'Brouillon': 'Draft',
  'Rechercher...': 'Search...',
  'Chargement...': 'Loading...',
  'Tous les types': 'All types',
  'Tous les statuts': 'All statuses',
  'contenus au total': 'total contents',
  'Ajouter un contenu': 'Add content',
  'Retour aux contenus': 'Back to contents',
  'Nouveau contenu': 'New content',
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
  'Lien YouTube *': 'YouTube Link *',
  'La video sera integree sans branding YouTube': 'Video embedded without YouTube branding',
  'Upload direct': 'Direct upload',
  'Apercu': 'Preview',
  'Duree (minutes)': 'Duration (minutes)',
  'URL du fichier PDF': 'PDF file URL',
  "Uploadez votre PDF sur Supabase Storage et collez le lien ici.": 'Upload your PDF to Supabase Storage and paste the link here.',
  'Nombre de pages': 'Number of pages',
  'Question *': 'Question *',
  'Reponse *': 'Answer *',
  'Quelle est la question ?': 'What is the question?',
  'Reponse detaillee...': 'Detailed answer...',
  'Publication': 'Publication',
  'Statut': 'Status',
  'Publier maintenant': 'Publish now',
  'Enregistrer brouillon': 'Save draft',
  'Guide': 'Guide',
  'Enregistrement...': 'Saving...',
  'Contenu cree !': 'Content created!',
  'Contenu mis a jour !': 'Content updated!',
  'Contenu publie !': 'Content published!',
  'Contenu payant': 'Paid content',
  "Ce contenu est gratuit pour tous.": 'This content is free for everyone.',
  "Prix d'acces (FCFA)": 'Access price (FCFA)',
  'Nouvelle alerte': 'New alert',
  'alertes actives': 'active alerts',
  'Titre de l\'alerte': 'Alert title',
  'Description detaillee de l\'alerte...': 'Detailed alert description...',
  'Niveau *': 'Level *',
  'Tous secteurs': 'All sectors',
  'Source': 'Source',
  'Archiver': 'Archive',
  'Aucune alerte publiee': 'No alerts published',
  'Creer la premiere alerte': 'Create first alert',
  'Alerte mise a jour !': 'Alert updated!',
  'Alerte publiee !': 'Alert published!',
  'Supprimer cette alerte ?': 'Delete this alert?',
  'annonces au total': 'total listings',
  'Nouvelle annonce': 'New listing',
  'En attente': 'Pending',
  'Approuvees': 'Approved',
  'Rejetees': 'Rejected',
  'Toutes': 'All',
  'Approuver': 'Approve',
  'Suspendre': 'Suspend',
  'Reactiver': 'Reactivate',
  'Annonce approuvee !': 'Listing approved!',
  'Annonce suspendue.': 'Listing suspended.',
  'Annonce creee !': 'Listing created!',
  'Annonce mise a jour !': 'Listing updated!',
  'commandes au total': 'total orders',
  'Voir tout': 'View all',
  'Details': 'Details',
  'entreprises enregistrees': 'registered companies',
  'Creer une entreprise': 'Create company',
  "Plans d'abonnement": 'Subscription plans',
  'Configurez les offres pour les entreprises': 'Configure offers for companies',
  'Nouveau plan': 'New plan',
  'Plan sauvegarde !': 'Plan saved!',
  'Inactif': 'Inactive',
  'Annonces illimitees': 'Unlimited listings',
  'Badge certifie': 'Certified badge',
  'Plan actif (visible aux entreprises)': 'Active plan (visible to companies)',
  'Configuration des paiements': 'Payment configuration',
  'Configurez les passerelles de paiement pour les abonnements et commandes': 'Configure payment gateways for subscriptions and orders',
  'Paiements Afrique de l\'Ouest': "West Africa Payments",
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
  'Parametres': 'Settings',
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

  // === RECHERCHE ===
  'Recherche': 'Search',
  'Rechercher sur Think Safety...': 'Search Think Safety...',
  'Aucun resultat pour': 'No results for',
  'resultats pour': 'results for',
  'Voir le contenu': 'View content',

  // === MAINTENANCE ===
  'Site en maintenance': 'Site under maintenance',
  "Nous effectuons des ameliorations pour vous offrir une meilleure experience. Nous serons de retour tres bientot.": "We're making improvements for a better experience. We'll be back very soon.",
  'Travaux en cours...': 'Work in progress...',
  'Acces administrateur': 'Administrator access',

  // === COMMUN ===
  'Oui': 'Yes',
  'Non': 'No',
  'Fermer': 'Close',
  'Suivant': 'Next',
  'Precedent': 'Previous',
  'Envoyer': 'Send',
  'Telecharger': 'Download',
  'Ouvrir': 'Open',
  'Ouvrir le document': 'Open document',
  'Aucun fichier disponible': 'No file available',
  'Cle publique': 'Public key',
  'Cle secrete': 'Secret key',
  'Voir la documentation': 'View documentation',
  'pages': 'pages',
  'Vendeur certifie (badge bleu)': 'Certified seller (blue badge)',
  'Prix fixe': 'Fixed price',
  'Sur devis': 'On quote',
  'Location': 'Rental',
  'Abonnement': 'Subscription',
  'Nom / Entreprise': 'Name / Company',
  'WhatsApp': 'WhatsApp',
  'Email contact': 'Contact email',
  'Produit / Service': 'Product / Service',
  'Vendeur / Contact': 'Seller / Contact',
  'Publier l\'annonce': "Publish listing",
  'Mettre a jour': 'Update',
  'Soumettre pour validation': 'Submit for review',
  'Publication directe en tant qu\'administrateur.': 'Direct publication as administrator.',
  'Validation sous 24-48h par notre equipe.': 'Review within 24-48h by our team.',
  'Annonce soumise !': 'Listing submitted!',
  'Votre annonce est en cours de moderation.': 'Your listing is under review.',
  'Annonce publiee !': 'Listing published!',
  'Votre annonce est immediatement visible sur le marketplace.': 'Your listing is immediately visible on the marketplace.',
  'Voir le marketplace': 'View marketplace',
  'Gerer les annonces': 'Manage listings',
  'Acces restreint': 'Restricted access',
  'Seules les entreprises inscrites et les administrateurs peuvent publier des annonces sur le marketplace.': 'Only registered companies and administrators can post listings on the marketplace.',
  'Retour': 'Back',
  'Creer un compte entreprise': 'Create company account',
  'Commande confirmee': 'Order confirmed',
}

// Nœuds à ignorer
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'INPUT', 'TEXTAREA', 'SELECT'])

// ============================================================
// MOTEUR DE TRADUCTION
// ============================================================
function translateNode(node: Text, dict: Record<string, string>, reverse = false) {
  const original = node.textContent || ''
  const trimmed = original.trim()
  if (!trimmed) return

  let translated = original

  if (reverse) {
    // EN → FR : chercher dans les valeurs du dictionnaire
    const reverseDict: Record<string, string> = {}
    Object.entries(dict).forEach(([fr, en]) => { reverseDict[en] = fr })
    const key = reverseDict[trimmed]
    if (key) translated = original.replace(trimmed, key)
  } else {
    // FR → EN
    const val = dict[trimmed]
    if (val) translated = original.replace(trimmed, val)
    else {
      // Essai avec correspondance partielle pour les phrases longues
      let result = original
      Object.entries(dict).forEach(([fr, en]) => {
        if (fr.length > 3 && result.includes(fr)) {
          result = result.split(fr).join(en)
        }
      })
      if (result !== original) translated = result
    }
  }

  if (translated !== original) {
    // Stocker l'original pour pouvoir revenir en arrière
    if (!node.parentElement?.dataset.originalText) {
      if (node.parentElement) node.parentElement.dataset.originalText = original
    }
    node.textContent = translated
  }
}

function walkDOM(root: Node, dict: Record<string, string>, toEnglish: boolean) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!parent) return NodeFilter.FILTER_REJECT
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT
      if (parent.closest('[data-notranslate]')) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    }
  })

  const nodes: Text[] = []
  let node
  while ((node = walker.nextNode())) {
    nodes.push(node as Text)
  }
  nodes.forEach(n => translateNode(n, dict, !toEnglish))
}

function restoreOriginals(root: Node) {
  // Restaurer tous les éléments qui avaient un original stocké
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  let node
  while ((node = walker.nextNode())) nodes.push(node as Text)

  nodes.forEach(n => {
    const parent = n.parentElement
    if (parent?.dataset.originalText) {
      n.textContent = parent.dataset.originalText
      delete parent.dataset.originalText
    }
  })
}

// ============================================================
// COMPOSANT
// ============================================================
export default function AutoTranslate() {
  const { lang } = useLang()

  useEffect(() => {
    const body = document.body
    if (!body) return

    if (lang === 'en') {
      // Petit délai pour laisser React finir son rendu
      const timer = setTimeout(() => {
        walkDOM(body, DICT, true)
      }, 50)

      // Observer les changements dynamiques (navigation, modals...)
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(m => {
          m.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              walkDOM(node, DICT, true)
            }
          })
        })
      })

      observer.observe(body, { childList: true, subtree: true })

      return () => {
        clearTimeout(timer)
        observer.disconnect()
      }
    } else {
      // Retour au français
      const timer = setTimeout(() => {
        restoreOriginals(body)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [lang])

  return null
}
