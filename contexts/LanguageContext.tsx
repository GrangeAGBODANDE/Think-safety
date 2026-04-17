'use client'
import { createContext, useContext, useState, useEffect } from 'react'

export type Lang = 'fr' | 'en'

const translations: Record<Lang, Record<string, string>> = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.sectors': 'Formations',
    'nav.marketplace': 'Marketplace',
    'nav.alerts': 'Alertes',
    'nav.subscriptions': 'Abonnements',
    'nav.search': 'Rechercher',
    'nav.cart': 'Mon panier',
    'nav.login': 'Connexion',
    'nav.myspace': 'Mon espace',
    'nav.orders': 'Mes commandes',
    'nav.admin': 'Administration',
    'nav.logout': 'Deconnexion',

    // Auth
    'auth.login': 'Se connecter',
    'auth.register': "S'inscrire",
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.forgot': 'Oublie ?',
    'auth.connecting': 'Connexion...',
    'auth.profile_question': 'Quel est votre profil ?',
    'auth.learner': 'Je veux apprendre',
    'auth.learner_desc': 'Acces gratuit a toutes les formations securite',
    'auth.company': 'Je suis une entreprise',
    'auth.company_desc': 'Vente de materiel securite, EPI, formations certifiantes',
    'auth.create_account': 'Creer mon compte',
    'auth.creating': 'Creation...',
    'auth.back_site': 'Retour au site',
    'auth.firstname': 'Prenom',
    'auth.lastname': 'Nom',
    'auth.company_name': "Nom de l'entreprise",
    'auth.activity': "Domaine d'activite",
    'auth.phone': 'Telephone',
    'auth.location': 'Localisation',
    'auth.terms': 'En continuant, vous acceptez nos',
    'auth.terms_link': 'CGU',
    'auth.back': 'Retour',
    'auth.confirm_sent': 'Compte cree ! Verifiez votre email pour confirmer, puis connectez-vous.',
    'auth.go_login': 'Aller a la connexion',
    'auth.one_domain': 'Une entreprise est specialisee dans un seul domaine.',
    'auth.min_8': 'Minimum 8 caracteres',

    // Homepage
    'home.badge': 'Plateforme 100% Gratuite • 18 Secteurs',
    'home.title1': "La Securite, ca s'apprend.",
    'home.title2': 'Ensemble.',
    'home.desc': "Formez-vous gratuitement aux regles de securite dans tous les secteurs d'activite. Videos, documents, quiz, alertes locales et marketplace.",
    'home.search_placeholder': 'Rechercher un secteur, un risque...',
    'home.cta1': 'COMMENCER GRATUITEMENT',
    'home.cta2': 'EXPLORER LES SECTEURS',
    'home.social_proof': '| 12 400+ professionnels formes',
    'home.stat1': 'Secteurs couverts',
    'home.stat2': 'Contenus disponibles',
    'home.stat3': 'Utilisateurs actifs',
    'home.stat4': 'Satisfaction',
    'home.sectors_eyebrow': 'Formations par secteur',
    'home.sectors_title': 'Votre secteur,',
    'home.sectors_title2': 'vos risques',
    'home.sectors_desc': "Des contenus specialises pour chaque metier — videos, documents, FAQ et alertes adaptees a votre domaine.",
    'home.sectors_cta': 'Voir tous les secteurs',
    'home.start': 'Commencer',
    'home.alerts_eyebrow': 'Alertes en temps reel',
    'home.alerts_title': 'Restez informe,',
    'home.alerts_title2': 'restez en securite',
    'home.alerts_cta': 'Toutes les alertes →',
    'home.market_eyebrow': 'Marketplace securite',
    'home.market_title': 'Equipements &',
    'home.market_title2': 'Services HSE',
    'home.market_desc': 'Trouvez des equipements certifies, formations et services HSE aupres de fournisseurs verifies.',
    'home.market_cta': 'EXPLORER LE MARKETPLACE',
    'home.cta_eyebrow': 'Think Safety',
    'home.cta_title': 'Pret a commencer ?',
    'home.cta_desc': 'Rejoignez des milliers de professionnels qui se forment gratuitement.',
    'home.cta_btn': 'CREER UN COMPTE GRATUIT',
    'home.on_quote': 'Sur devis',

    // Marketplace
    'market.title': 'Marketplace Securite',
    'market.desc': 'Trouvez equipements et prestataires certifies pres de chez vous.',
    'market.search': 'Rechercher EPI, formation, service...',
    'market.publish': 'Publier une annonce',
    'market.add': 'Ajouter',
    'market.request': 'Demander',
    'market.added': 'Article ajoute au panier !',
    'market.certified': 'Certifie',
    'market.no_results': 'Aucune annonce trouvee',

    // Alertes
    'alerts.title': 'Alertes Securite',
    'alerts.desc': 'Restez informe des dangers et incidents dans votre secteur',
    'alerts.all': 'Toutes',
    'alerts.active': 'Actives',
    'alerts.archived': 'Archivees',

    // Secteurs
    'sectors.title': 'Secteurs de formation',
    'sectors.desc': 'Choisissez votre domaine pour acceder aux formations adaptees',
    'sectors.trainings': 'formations',
    'sectors.videos': 'Videos',
    'sectors.docs': 'Documents',
    'sectors.faq': 'FAQ',
    'sectors.no_content': 'Aucun contenu disponible pour ce secteur.',

    // Dashboard
    'dash.welcome': 'Bienvenue sur Think Safety !',
    'dash.welcome_desc': "Votre compte est pret. Choisissez un secteur d'activite pour commencer votre premiere formation gratuitement.",
    'dash.choose_sector': 'Choisir mon premier secteur',
    'dash.popular': 'Secteurs populaires',
    'dash.my_trainings': 'Mes formations',
    'dash.my_certs': 'Mes certificats',
    'dash.followed': 'Formations suivies',
    'dash.completed': 'Terminees',
    'dash.in_progress': 'En cours',
    'dash.certificates': 'Certificats',
    'dash.no_training': 'Aucune formation commencee',
    'dash.browse': 'Parcourir les formations',
    'dash.complete_for_cert': 'Completez des formations pour obtenir vos certificats',

    // Panier
    'cart.title': 'Mon Panier',
    'cart.empty': 'Votre panier est vide',
    'cart.empty_desc': 'Parcourez le marketplace pour trouver des equipements de securite.',
    'cart.explore': 'Explorer le marketplace',
    'cart.total': 'Total',
    'cart.checkout': 'Passer la commande',
    'cart.continue': 'Continuer mes achats',
    'cart.your_info': 'Vos informations',
    'cart.confirm': 'Confirmer la commande',
    'cart.sending': 'Envoi...',
    'cart.confirmed': 'Commande confirmee !',
    'cart.confirmed_desc': 'Les vendeurs vous contacteront directement par telephone ou email.',
    'cart.back': 'Continuer mes achats',

    // Abonnements
    'sub.eyebrow': 'Pour les entreprises',
    'sub.title': 'Choisissez votre abonnement',
    'sub.monthly': 'Mensuel',
    'sub.annual': 'Annuel',
    'sub.save': '-17%',
    'sub.free': 'Gratuit',
    'sub.popular': 'Plus populaire',
    'sub.start_free': 'Commencer gratuitement',
    'sub.choose': 'Choisir',
    'sub.faq': 'Questions frequentes',

    // Admin
    'admin.dashboard': 'Dashboard',
    'admin.users': 'Utilisateurs',
    'admin.companies': 'Entreprises',
    'admin.contents': 'Contenus',
    'admin.add_content': 'Ajouter contenu',
    'admin.alerts': 'Alertes',
    'admin.marketplace': 'Marketplace',
    'admin.orders': 'Commandes',
    'admin.subscriptions': 'Abonnements',
    'admin.payments': 'Config Paiements',
    'admin.settings': 'Parametres',
    'admin.documentation': 'Documentation Dev',
    'admin.connected_as': 'Connecte en tant que',
    'admin.new_content': 'Nouveau contenu',
    'admin.view_site': 'Voir le site',
    'admin.logout': 'Deconnexion',

    // Common
    'common.save': 'Sauvegarder',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.publish': 'Publier',
    'common.draft': 'Brouillon',
    'common.loading': 'Chargement...',
    'common.back': 'Retour',
    'common.all': 'Tous',
    'common.view_all': 'Voir tout',
    'common.search': 'Rechercher...',
    'common.on_quote': 'Sur devis',
    'common.yes': 'Oui',
    'common.no': 'Non',

    // Maintenance
    'maintenance.title': 'Site en maintenance',
    'maintenance.desc': "Nous effectuons des ameliorations pour vous offrir une meilleure experience. Nous serons de retour tres bientot.",
    'maintenance.working': 'Travaux en cours...',
    'maintenance.admin': 'Acces administrateur',
  },

  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.sectors': 'Training',
    'nav.marketplace': 'Marketplace',
    'nav.alerts': 'Alerts',
    'nav.subscriptions': 'Subscriptions',
    'nav.search': 'Search',
    'nav.cart': 'My cart',
    'nav.login': 'Login',
    'nav.myspace': 'My space',
    'nav.orders': 'My orders',
    'nav.admin': 'Administration',
    'nav.logout': 'Logout',

    // Auth
    'auth.login': 'Sign in',
    'auth.register': 'Sign up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgot': 'Forgot?',
    'auth.connecting': 'Connecting...',
    'auth.profile_question': 'What is your profile?',
    'auth.learner': 'I want to learn',
    'auth.learner_desc': 'Free access to all safety training',
    'auth.company': 'I am a company',
    'auth.company_desc': 'Safety equipment, PPE, certified training sales',
    'auth.create_account': 'Create my account',
    'auth.creating': 'Creating...',
    'auth.back_site': 'Back to site',
    'auth.firstname': 'First name',
    'auth.lastname': 'Last name',
    'auth.company_name': 'Company name',
    'auth.activity': 'Field of activity',
    'auth.phone': 'Phone',
    'auth.location': 'Location',
    'auth.terms': 'By continuing, you accept our',
    'auth.terms_link': 'Terms',
    'auth.back': 'Back',
    'auth.confirm_sent': 'Account created! Check your email to confirm, then log in.',
    'auth.go_login': 'Go to login',
    'auth.one_domain': 'A company specializes in one domain only.',
    'auth.min_8': 'Minimum 8 characters',

    // Homepage
    'home.badge': '100% Free Platform • 18 Sectors',
    'home.title1': 'Workplace Safety,',
    'home.title2': 'Together.',
    'home.desc': 'Train for free on safety rules across all professional sectors in West Africa. Videos, documents, quizzes, local alerts and marketplace.',
    'home.search_placeholder': 'Search a sector, a risk...',
    'home.cta1': 'START FOR FREE',
    'home.cta2': 'EXPLORE SECTORS',
    'home.social_proof': '| 12,400+ trained professionals',
    'home.stat1': 'Sectors covered',
    'home.stat2': 'Available content',
    'home.stat3': 'Active learners',
    'home.stat4': 'Satisfaction',
    'home.sectors_eyebrow': 'Training by sector',
    'home.sectors_title': 'Your sector,',
    'home.sectors_title2': 'your risks',
    'home.sectors_desc': 'Specialized content for each profession — videos, documents, FAQ and alerts tailored to your field.',
    'home.sectors_cta': 'View all sectors',
    'home.start': 'Start',
    'home.alerts_eyebrow': 'Real-time alerts',
    'home.alerts_title': 'Stay informed,',
    'home.alerts_title2': 'stay safe',
    'home.alerts_cta': 'All alerts →',
    'home.market_eyebrow': 'Safety marketplace',
    'home.market_title': 'Equipment &',
    'home.market_title2': 'HSE Services',
    'home.market_desc': 'Find certified equipment, training and HSE services from verified suppliers.',
    'home.market_cta': 'EXPLORE MARKETPLACE',
    'home.cta_eyebrow': 'Think Safety',
    'home.cta_title': 'Ready to start?',
    'home.cta_desc': 'Join thousands of professionals training for free.',
    'home.cta_btn': 'CREATE FREE ACCOUNT',
    'home.on_quote': 'On quote',

    // Marketplace
    'market.title': 'Safety Marketplace',
    'market.desc': 'Find certified equipment and providers near you.',
    'market.search': 'Search PPE, training, service...',
    'market.publish': 'Post an ad',
    'market.add': 'Add',
    'market.request': 'Request',
    'market.added': 'Item added to cart!',
    'market.certified': 'Certified',
    'market.no_results': 'No listings found',

    // Alertes
    'alerts.title': 'Safety Alerts',
    'alerts.desc': 'Stay informed about hazards and incidents in your sector',
    'alerts.all': 'All',
    'alerts.active': 'Active',
    'alerts.archived': 'Archived',

    // Secteurs
    'sectors.title': 'Training sectors',
    'sectors.desc': 'Choose your field to access tailored training',
    'sectors.trainings': 'trainings',
    'sectors.videos': 'Videos',
    'sectors.docs': 'Documents',
    'sectors.faq': 'FAQ',
    'sectors.no_content': 'No content available for this sector.',

    // Dashboard
    'dash.welcome': 'Welcome to Think Safety!',
    'dash.welcome_desc': 'Your account is ready. Choose a sector to start your first free training.',
    'dash.choose_sector': 'Choose my first sector',
    'dash.popular': 'Popular sectors',
    'dash.my_trainings': 'My trainings',
    'dash.my_certs': 'My certificates',
    'dash.followed': 'Followed trainings',
    'dash.completed': 'Completed',
    'dash.in_progress': 'In progress',
    'dash.certificates': 'Certificates',
    'dash.no_training': 'No training started',
    'dash.browse': 'Browse trainings',
    'dash.complete_for_cert': 'Complete trainings to earn your certificates',

    // Panier
    'cart.title': 'My Cart',
    'cart.empty': 'Your cart is empty',
    'cart.empty_desc': 'Browse the marketplace to find safety equipment.',
    'cart.explore': 'Explore marketplace',
    'cart.total': 'Total',
    'cart.checkout': 'Place order',
    'cart.continue': 'Continue shopping',
    'cart.your_info': 'Your information',
    'cart.confirm': 'Confirm order',
    'cart.sending': 'Sending...',
    'cart.confirmed': 'Order confirmed!',
    'cart.confirmed_desc': 'Sellers will contact you directly by phone or email.',
    'cart.back': 'Continue shopping',

    // Abonnements
    'sub.eyebrow': 'For companies',
    'sub.title': 'Choose your subscription',
    'sub.monthly': 'Monthly',
    'sub.annual': 'Annual',
    'sub.save': '-17%',
    'sub.free': 'Free',
    'sub.popular': 'Most popular',
    'sub.start_free': 'Start for free',
    'sub.choose': 'Choose',
    'sub.faq': 'Frequently asked questions',

    // Admin
    'admin.dashboard': 'Dashboard',
    'admin.users': 'Users',
    'admin.companies': 'Companies',
    'admin.contents': 'Contents',
    'admin.add_content': 'Add content',
    'admin.alerts': 'Alerts',
    'admin.marketplace': 'Marketplace',
    'admin.orders': 'Orders',
    'admin.subscriptions': 'Subscriptions',
    'admin.payments': 'Payment Config',
    'admin.settings': 'Settings',
    'admin.documentation': 'Dev Documentation',
    'admin.connected_as': 'Connected as',
    'admin.new_content': 'New content',
    'admin.view_site': 'View site',
    'admin.logout': 'Logout',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.publish': 'Publish',
    'common.draft': 'Draft',
    'common.loading': 'Loading...',
    'common.back': 'Back',
    'common.all': 'All',
    'common.view_all': 'View all',
    'common.search': 'Search...',
    'common.on_quote': 'On quote',
    'common.yes': 'Yes',
    'common.no': 'No',

    // Maintenance
    'maintenance.title': 'Site under maintenance',
    'maintenance.desc': 'We are making improvements to offer you a better experience. We will be back very soon.',
    'maintenance.working': 'Work in progress...',
    'maintenance.admin': 'Administrator access',
  },
}

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LangContext = createContext<LangContextType>({
  lang: 'fr',
  setLang: () => {},
  t: (k) => k,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr')

  useEffect(() => {
    const saved = (localStorage.getItem('ts_lang') as Lang) || 'fr'
    if (saved === 'en' || saved === 'fr') setLangState(saved)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('ts_lang', l)
    document.documentElement.lang = l
  }

  function t(key: string): string {
    return translations[lang]?.[key] || translations['fr']?.[key] || key
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
