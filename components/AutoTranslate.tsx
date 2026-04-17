'use client'
import { useEffect, useRef } from 'react'
import { useLang } from '@/contexts/LanguageContext'

// ============================================================
// DICTIONNAIRE FR → EN
// ============================================================
const DICT: Record<string, string> = {
  // Navigation
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
  // Homepage
  'Plateforme 100% Gratuite • 18 Secteurs': '100% Free Platform • 18 Sectors',
  'Ensemble.': 'Together.',
  'Workplace Safety,': 'Workplace Safety,',
  '| 12 400+ professionnels formes': '| 12,400+ trained professionals',
  'Secteurs couverts': 'Sectors covered',
  'Contenus disponibles': 'Available content',
  'Utilisateurs actifs': 'Active learners',
  'Satisfaction': 'Satisfaction',
  'Formations par secteur': 'Training by sector',
  'Votre secteur,': 'Your sector,',
  'vos risques': 'your risks',
  'Voir tous les secteurs': 'View all sectors',
  'Commencer': 'Start',
  'Alertes en temps reel': 'Real-time alerts',
  'Restez informe,': 'Stay informed,',
  'restez en securite': 'stay safe',
  'Toutes les alertes →': 'All alerts →',
  'Marketplace securite': 'Safety Marketplace',
  'Equipements &': 'Equipment &',
  'Services HSE': 'HSE Services',
  'EXPLORER LE MARKETPLACE': 'EXPLORE MARKETPLACE',
  'COMMENCER GRATUITEMENT': 'START FOR FREE',
  'EXPLORER LES SECTEURS': 'EXPLORE SECTORS',
  'RECHERCHER': 'SEARCH',
  'Pret a commencer ?': 'Ready to start?',
  'CREER UN COMPTE GRATUIT': 'CREATE FREE ACCOUNT',
  'Sur devis': 'On quote',
  // Secteurs
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
  'Secteurs de formation': 'Training sectors',
  'Debutant': 'Beginner',
  'Intermediaire': 'Intermediate',
  'Avance': 'Advanced',
  'formations': 'trainings',
  'Aucun contenu disponible pour ce secteur.': 'No content available for this sector.',
  // Marketplace
  'Marketplace Securite': 'Safety Marketplace',
  'Trouvez equipements et prestataires certifies pres de chez vous.': 'Find certified equipment and providers near you.',
  'Rechercher EPI, formation, service...': 'Search PPE, training, service...',
  'Publier une annonce': 'Post an ad',
  'Ajouter': 'Add',
  'Demander': 'Request',
  'Article ajoute au panier !': 'Item added to cart!',
  'Certifie': 'Certified',
  'Aucune annonce trouvee': 'No listings found',
  'EPI': 'PPE',
  'Formation': 'Training',
  'Service HSE': 'HSE Service',
  'Incendie': 'Fire Safety',
  'Signalisation': 'Signage',
  'Premiers secours': 'First Aid',
  'Tous': 'All',
  'Toutes': 'All',
  // Alertes
  'Alertes Securite': 'Safety Alerts',
  'Restez informe des dangers et incidents dans votre secteur': 'Stay informed about hazards in your sector',
  'Actives': 'Active',
  'Archivees': 'Archived',
  'Aucune alerte trouvee': 'No alerts found',
  'URGENCE': 'EMERGENCY',
  'DANGER': 'DANGER',
  'ATTENTION': 'WARNING',
  // Auth
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
  'Minimum 8 caracteres': 'Minimum 8 characters',
  'Aller a la connexion': 'Go to login',
  '← Retour au site': '← Back to site',
  // Dashboard
  'Bienvenue sur Think Safety !': 'Welcome to Think Safety!',
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
  'Voir toutes les formations': 'View all trainings',
  // Panier
  'Mon Panier': 'My Cart',
  'Votre panier est vide': 'Your cart is empty',
  'Explorer le marketplace': 'Explore marketplace',
  'Total': 'Total',
  'Passer la commande': 'Place order',
  'Continuer mes achats': 'Continue shopping',
  'Vos informations': 'Your information',
  'Confirmer la commande': 'Confirm order',
  'Envoi...': 'Sending...',
  'Commande confirmee !': 'Order confirmed!',
  'Resume': 'Summary',
  'Retour au panier': 'Back to cart',
  'Adresse': 'Address',
  'Ville': 'City',
  'Pays': 'Country',
  'Notes': 'Notes',
  // Abonnements
  'Pour les entreprises': 'For companies',
  'Choisissez votre abonnement': 'Choose your subscription',
  'Mensuel': 'Monthly',
  'Annuel': 'Annual',
  'Gratuit': 'Free',
  'Plus populaire': 'Most popular',
  'Commencer gratuitement': 'Start for free',
  'Choisir': 'Choose',
  'Questions frequentes': 'Frequently asked questions',
  // Admin sidebar
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
  // Admin pages
  'Tableau de bord': 'Dashboard',
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
  'Modifier': 'Edit',
  'Supprimer': 'Delete',
  'Sauvegarder': 'Save',
  'Annuler': 'Cancel',
  'Publier': 'Publish',
  'Brouillon': 'Draft',
  'Chargement...': 'Loading...',
  'Tous les types': 'All types',
  'Tous les statuts': 'All statuses',
  'Retour aux contenus': 'Back to contents',
  'Modifier le contenu': 'Edit content',
  'Nouveau contenu': 'New content',
  'Type de contenu': 'Content type',
  'Video': 'Video',
  'Document': 'Document',
  'Informations': 'Information',
  'Titre': 'Title',
  'Description': 'Description',
  'Secteur': 'Sector',
  'Tous secteurs': 'All sectors',
  'Niveau': 'Level',
  'Publication': 'Publication',
  'Statut': 'Status',
  'Publier maintenant': 'Publish now',
  'Enregistrer brouillon': 'Save draft',
  'Enregistrement...': 'Saving...',
  'Contenu payant': 'Paid content',
  'Nouvelle alerte': 'New alert',
  'Approuver': 'Approve',
  'Suspendre': 'Suspend',
  'Reactiver': 'Reactivate',
  'Nouvelle annonce': 'New listing',
  'En attente': 'Pending',
  'Approuvees': 'Approved',
  'Rejetees': 'Rejected',
  'Creer une entreprise': 'Create company',
  "Plans d'abonnement": 'Subscription plans',
  'Nouveau plan': 'New plan',
  'Inactif': 'Inactive',
  'Configuration des paiements': 'Payment configuration',
  'Activer': 'Activate',
  'Desactiver': 'Deactivate',
  'Configurer': 'Configure',
  'Informations du site': 'Site information',
  'Mode maintenance': 'Maintenance mode',
  'Inscriptions ouvertes': 'Open registrations',
  'Sauvegarder les modifications': 'Save changes',
  // Recherche
  'Recherche': 'Search',
  // Maintenance
  'Site en maintenance': 'Site under maintenance',
  'Travaux en cours...': 'Work in progress...',
  'Acces administrateur': 'Administrator access',
  // Common
  'Nom': 'Name',
  'Source': 'Source',
  'National': 'National',
  'Cliquez pour lancer': 'Click to play',
  'Telecharger': 'Download',
  'Ouvrir': 'Open',
  'Ouvrir le document': 'Open document',
  'Aucun fichier disponible': 'No file available',
}

// Tags à ne pas modifier
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'CODE', 'PRE'])

// Map pour stocker les originaux (clé = nœud texte, valeur = texte original)
const originals = new WeakMap<Text, string>()

// ============================================================
// FONCTIONS DE TRADUCTION
// ============================================================
function translateText(text: string, toEN: boolean): string {
  const trimmed = text.trim()
  if (!trimmed || trimmed.length < 2) return text

  if (toEN) {
    // Chercher correspondance exacte d'abord
    if (DICT[trimmed]) {
      return text.replace(trimmed, DICT[trimmed])
    }
    // Correspondance partielle pour les phrases longues
    let result = text
    for (const [fr, en] of Object.entries(DICT)) {
      if (fr.length > 4 && result.includes(fr)) {
        result = result.split(fr).join(en)
      }
    }
    return result
  } else {
    // EN → FR (restauration depuis les originaux stockés)
    return text
  }
}

function walkAndTranslate(element: Element, toEN: boolean) {
  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const textNode = child as Text
      const content = textNode.textContent || ''

      if (toEN) {
        // Stocker l'original si pas encore stocké
        if (!originals.has(textNode)) {
          originals.set(textNode, content)
        }
        const translated = translateText(content, true)
        if (translated !== content) {
          textNode.textContent = translated
        }
      } else {
        // Restaurer l'original
        const original = originals.get(textNode)
        if (original !== undefined) {
          textNode.textContent = original
        }
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element
      if (!SKIP_TAGS.has(el.tagName) && !el.hasAttribute('data-notranslate')) {
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
    // Nettoyer l'observer précédent
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    const body = document.body
    const toEN = lang === 'en'

    // Délai pour laisser React finir de rendre la page
    const timer = setTimeout(() => {
      walkAndTranslate(body, toEN)

      // Observer les nouvelles insertions (navigation entre pages, modals, données async...)
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
