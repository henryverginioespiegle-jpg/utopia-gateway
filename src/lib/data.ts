import { HeartPulse, GraduationCap, Home, TramFront, Leaf, type LucideIcon } from "lucide-react";

export type CategoryId = "sante" | "education" | "logement" | "transport" | "environnement";

export const categories: { id: CategoryId; label: string; icon: LucideIcon; blurb: string }[] = [
  { id: "sante", label: "Santé", icon: HeartPulse, blurb: "Soins, prévention et bien-être" },
  { id: "education", label: "Éducation", icon: GraduationCap, blurb: "Écoles, académies et savoir" },
  { id: "logement", label: "Logement", icon: Home, blurb: "Habitats adaptatifs et aides" },
  { id: "transport", label: "Transport", icon: TramFront, blurb: "Mobilité orbitale et urbaine" },
  { id: "environnement", label: "Environnement", icon: Leaf, blurb: "Biosphère et énergie propre" },
];

export const categoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? id;

export type Service = {
  slug: string;
  name: string;
  category: CategoryId;
  summary: string;
  description: string;
  delay: string;
  cost: string;
  documents: string[];
  location: string;
  popular?: boolean;
};

export const services: Service[] = [
  { slug: "bilan-sante-genomique", name: "Bilan santé génomique", category: "sante", popular: true,
    summary: "Analyse préventive complète réalisée par les biocentres planétaires.",
    description: "Le bilan génomique annuel permet d'anticiper les risques de santé grâce à une analyse non invasive. Les résultats sont transmis à votre médecin référent et à votre espace citoyen en toute confidentialité.",
    delay: "48 heures", cost: "Gratuit", documents: ["Identifiant citoyen", "Consentement numérique"], location: "Biocentre Aurora, Anneau Nord" },
  { slug: "teleconsultation", name: "Téléconsultation holographique", category: "sante",
    summary: "Consultez un praticien en hologramme depuis votre habitat.",
    description: "Un service disponible 24h/24 qui connecte les citoyens à un médecin certifié via projection holographique sécurisée.",
    delay: "Immédiat", cost: "Gratuit", documents: ["Identifiant citoyen"], location: "Depuis votre habitat" },
  { slug: "inscription-academie", name: "Inscription à l'Académie", category: "education", popular: true,
    summary: "Inscrivez un enfant ou vous-même dans une académie de Terra Nova.",
    description: "Les académies proposent des parcours personnalisés, de l'éveil jusqu'à la recherche avancée. L'inscription se fait en ligne et un conseiller vous recontacte.",
    delay: "5 jours", cost: "Gratuit", documents: ["Identifiant citoyen", "Historique d'apprentissage"], location: "Académies de quartier" },
  { slug: "bourse-savoir", name: "Bourse du savoir", category: "education",
    summary: "Aide financière pour les formations et la recherche.",
    description: "La bourse du savoir finance les projets d'apprentissage individuels, des métiers artisanaux à l'astrophysique.",
    delay: "15 jours", cost: "Gratuit", documents: ["Projet de formation", "Identifiant citoyen"], location: "En ligne" },
  { slug: "attribution-habitat", name: "Attribution d'habitat adaptatif", category: "logement", popular: true,
    summary: "Demandez un logement modulable adapté à votre foyer.",
    description: "Les habitats adaptatifs se reconfigurent selon la taille et les besoins du foyer. Déposez votre demande et suivez son attribution en temps réel.",
    delay: "30 jours", cost: "Selon revenus", documents: ["Composition du foyer", "Identifiant citoyen"], location: "Office de l'Habitat, District Central" },
  { slug: "renovation-energetique", name: "Aide à la rénovation énergétique", category: "logement",
    summary: "Subvention pour améliorer l'autonomie énergétique de votre habitat.",
    description: "Financement jusqu'à 80 % des travaux d'optimisation solaire et d'isolation biosourcée.",
    delay: "20 jours", cost: "Gratuit", documents: ["Devis", "Titre d'habitat"], location: "En ligne" },
  { slug: "pass-mobilite", name: "Pass Mobilité orbitale", category: "transport", popular: true,
    summary: "Accès illimité aux trams magnétiques et navettes orbitales.",
    description: "Le Pass Mobilité donne un accès illimité au réseau de transport de surface et aux navettes vers les stations orbitales.",
    delay: "Immédiat", cost: "12 crédits / mois", documents: ["Identifiant citoyen"], location: "En ligne ou bornes de station" },
  { slug: "signalement-voirie", name: "Signalement voirie", category: "transport",
    summary: "Signalez un incident sur les voies ou le réseau.",
    description: "Un capteur défaillant, une voie obstruée ? Signalez-le et suivez l'intervention des équipes municipales.",
    delay: "24 heures", cost: "Gratuit", documents: [], location: "En ligne" },
  { slug: "jardin-partage", name: "Parcelle de jardin vertical", category: "environnement", popular: true,
    summary: "Obtenez une parcelle dans les jardins verticaux communautaires.",
    description: "Cultivez vos propres végétaux dans les tours-jardins. Formation à la permaculture incluse.",
    delay: "10 jours", cost: "Gratuit", documents: ["Identifiant citoyen"], location: "Tours-jardins Éden" },
  { slug: "collecte-recyclage", name: "Collecte et recyclage moléculaire", category: "environnement",
    summary: "Planifiez l'enlèvement d'objets à recycler.",
    description: "Les objets sont décomposés et réintégrés dans le cycle de matière de la planète.",
    delay: "48 heures", cost: "Gratuit", documents: [], location: "À domicile" },
];

export type Article = { slug: string; title: string; date: string; category: string; excerpt: string; body: string[] };

export const articles: Article[] = [
  { slug: "inauguration-anneau-solaire", title: "Inauguration du nouvel anneau solaire", date: "2200-03-14", category: "Énergie",
    excerpt: "Terra Nova atteint 140 % d'autonomie énergétique grâce à son troisième anneau orbital.",
    body: ["Le Conseil planétaire a inauguré ce matin le troisième anneau solaire, une structure de 4 000 km captant l'énergie stellaire.", "Cette infrastructure porte l'autonomie énergétique de la planète à 140 %. L'excédent sera redistribué aux colonies voisines.", "Les citoyens peuvent suivre la production en temps réel depuis leur espace personnel."] },
  { slug: "nova-assistant-2-0", title: "NOVA 2.0 : votre assistante évolue", date: "2200-03-08", category: "Services",
    excerpt: "L'assistante virtuelle du portail comprend désormais 412 langues et dialectes.",
    body: ["NOVA, l'assistante IA du portail citoyen, bénéficie d'une mise à jour majeure.", "Elle guide désormais les citoyens pas à pas dans leurs démarches et comprend 412 langues.", "Retrouvez NOVA en bas à droite de chaque page du portail."] },
  { slug: "festival-biosphere", title: "Festival de la Biosphère : programme dévoilé", date: "2200-02-27", category: "Culture",
    excerpt: "Trois jours de célébration dans les jardins suspendus d'Éden.",
    body: ["Le Festival de la Biosphère revient du 21 au 23 avril dans les jardins suspendus.", "Au programme : concerts bioluminescents, ateliers de permaculture et observation des deux lunes.", "L'entrée est libre pour tous les citoyens."] },
  { slug: "nouvelles-lignes-tram", title: "Deux nouvelles lignes de tram magnétique", date: "2200-02-15", category: "Transport",
    excerpt: "Les quartiers Lumen et Cascade désormais reliés en 4 minutes.",
    body: ["Les lignes M7 et M8 entrent en service ce mois-ci.", "Elles relient les quartiers Lumen et Cascade en moins de 4 minutes.", "Le Pass Mobilité orbitale y donne un accès illimité."] },
];
