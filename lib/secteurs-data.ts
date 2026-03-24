// lib/secteurs-data.ts

export const SECTEURS = [
  { slug: 'construction-btp', nom: 'Construction & BTP', description: 'Sécurité sur les chantiers, EPI, travail en hauteur, engins de chantier et manutention.', icon: '🏗️', couleur: '#FF6B35', nb_contenus: 48, risques: ['Chute de hauteur', 'Effondrement', 'Électrocution', 'Bruit'] },
  { slug: 'industrie-manufacturiere', nom: 'Industrie Manufacturière', description: 'Protection machines, risques chimiques, ergonomie et sécurité des lignes de production.', icon: '⚙️', couleur: '#6C63FF', nb_contenus: 42, risques: ['Écrasement', 'Coupure', 'Exposition chimique', 'Chaleur'] },
  { slug: 'sante-medical', nom: 'Santé & Médical', description: 'Prévention infections, manipulation DASRI, radioprotection et ergonomie soignante.', icon: '🏥', couleur: '#00C896', nb_contenus: 55, risques: ['Infections nosocomiales', 'Risque biologique', 'TMS', 'Radiation'] },
  { slug: 'agriculture', nom: 'Agriculture & Élevage', description: 'Pesticides, engins agricoles, zoonoses, sécurité silos et travaux en milieu rural.', icon: '🌾', couleur: '#8BC34A', nb_contenus: 31, risques: ['Pesticides', 'Renversement engin', 'Zoonoses', 'Chaleur'] },
  { slug: 'transport-logistique', nom: 'Transport & Logistique', description: "Sécurité routière professionnelle, manutention, gestion d'entrepôt et marchandises dangereuses.", icon: '🚛', couleur: '#FF9800', nb_contenus: 39, risques: ['Accident route', 'TMS manutention', 'ADR', 'Fatigue'] },
  { slug: 'mines-carrieres', nom: 'Mines & Carrières', description: 'Risques miniers, gaz, explosifs, stabilité des parois et équipements souterrains.', icon: '⛏️', couleur: '#795548', nb_contenus: 27, risques: ['Éboulement', 'Gaz toxiques', 'Explosifs', 'Silicose'] },
  { slug: 'energie', nom: 'Énergie (Électricité, Pétrole, Gaz)', description: 'Habilitation électrique, risques ATEX, travaux sous tension et sécurité pétrolière.', icon: '⚡', couleur: '#FFD700', nb_contenus: 44, risques: ['Électrocution', 'Explosion ATEX', 'Incendie', 'H2S'] },
  { slug: 'chimie-pharmacie', nom: 'Chimie & Pharmacie', description: 'Manipulation produits dangereux, FDS, équipements de protection et gestion des déversements.', icon: '🧪', couleur: '#E91E63', nb_contenus: 36, risques: ['Inhalation', 'Brûlure chimique', 'Explosion', 'Contamination'] },
  { slug: 'bureaux-tertiaire', nom: 'Bureaux & Tertiaire', description: "Ergonomie poste de travail, prévention TMS, risques psychosociaux et sécurité incendie bureau.", icon: '🏢', couleur: '#2196F3', nb_contenus: 33, risques: ['TMS', 'Stress/RPS', 'Incendie', 'Chute'] },
  { slug: 'restauration-hotellerie', nom: 'Restauration & Hôtellerie', description: 'HACCP, sécurité alimentaire, prévention brûlures et coupures, hygiène en cuisine.', icon: '👨‍🍳', couleur: '#FF5722', nb_contenus: 29, risques: ['Brûlure', 'Coupure', 'TIAC', 'Glissade'] },
  { slug: 'commerce-distribution', nom: 'Commerce & Distribution', description: 'Sécurité caissières, manutention en magasin, gestion clients et prévention vols.', icon: '🛒', couleur: '#9C27B0', nb_contenus: 24, risques: ['Agression', 'TMS', 'Glissade', 'Incendie'] },
  { slug: 'education-formation', nom: 'Éducation & Formation', description: "Sécurité établissements scolaires, plan PPMS, prévention harcèlement et sécurité laboratoires.", icon: '🎓', couleur: '#00BCD4', nb_contenus: 22, risques: ['PPMS', 'Harcèlement', 'Labo chimie', 'Incendie'] },
  { slug: 'sport-loisirs', nom: 'Sport & Loisirs', description: 'Premiers secours sportifs, sécurité piscines, équipements EPI sport et gestion des foules.', icon: '🏋️', couleur: '#4CAF50', nb_contenus: 18, risques: ['Noyade', 'Blessure sportive', 'Surmenage', 'Foule'] },
  { slug: 'numerique-it', nom: 'Numérique & IT', description: 'Cybersécurité, ergonomie informatique, gestion des data centers et risques psychosociaux digitaux.', icon: '💻', couleur: '#607D8B', nb_contenus: 26, risques: ['Cyber menaces', 'TMS écran', 'RPS numérique', 'Électrique'] },
  { slug: 'maritime-peche', nom: 'Maritime & Pêche', description: 'Sécurité en mer, équipements de survie, man overboard, météo marine et embarquement.', icon: '⚓', couleur: '#03A9F4', nb_contenus: 21, risques: ['Noyade', 'Tempête', 'MOB', 'Hypothermie'] },
  { slug: 'aerien', nom: 'Transport Aérien', description: "Sécurité aéroportuaire, piste, soute, contrôle d'accès et gestion des urgences.", icon: '✈️', couleur: '#1976D2', nb_contenus: 19, risques: ['Bird strike', 'Piste', 'Fret dangereux', 'Incendie aéronef'] },
  { slug: 'foret-environnement', nom: 'Forêt & Environnement', description: 'Sécurité bucheronnage, débroussaillage, DFCI, protection faune/flore et risques naturels.', icon: '🌲', couleur: '#388E3C', nb_contenus: 17, risques: ['Tronçonneuse', 'Arbre tombant', 'Incendie forêt', 'Guêpes'] },
  { slug: 'securite-defense', nom: 'Sécurité & Défense', description: 'Sécurité des agents, gestion des situations de crise, protection rapprochée et SSLIA.', icon: '🛡️', couleur: '#37474F', nb_contenus: 23, risques: ['Agression', 'Stress post-trauma', 'Armement', 'Foule hostile'] },
];

export const NIVEAUX = [
  { value: 'debutant', label: 'Débutant', color: '#00C896' },
  { value: 'intermediaire', label: 'Intermédiaire', color: '#FFD700' },
  { value: 'avance', label: 'Avancé', color: '#FF4757' },
];

export const PAYS_AFRIQUE_OUEST = [
  'Bénin', 'Togo', 'Burkina Faso', "Côte d'Ivoire", 'Ghana',
  'Nigeria', 'Niger', 'Mali', 'Sénégal', 'Guinée',
];

// ✅ Force TypeScript à reconnaître ce fichier comme module
export {}
