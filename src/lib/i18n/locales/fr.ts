/**
 * Traductions françaises — ESCEN Verification System
 */
const fr = {
  // ─── Général ─────────────────────────────────────────────
  app: {
    title: "ESCEN - Vérification des relevés de notes",
    short_title: "ESCEN Vérification",
    tagline: "Vérification officielle des relevés de notes ESCEN",
  },

  // ─── Page de vérification ────────────────────────────────
  verify: {
    title: "Vérification de relevé de notes",
    subtitle: "Entrez l'identifiant unique présent sur votre document pour vérifier son authenticité.",
    input_label: "Identifiant du relevé",
    input_placeholder: "Exemple : a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    submit: "Vérifier",
    verifying: "Vérification en cours...",
    manual_link: "Vous avez déjà un identifiant ? Saisissez-le ici.",
    scan_title: "Scannez le QR Code",
    scan_instruction: "Utilisez l'appareil photo de votre téléphone pour scanner le QR Code présent sur le relevé.",
  },

  // ─── Résultat de vérification ────────────────────────────
  result: {
    valid_title: "✅ Relevé authentifié",
    valid_description: "Ce relevé de notes a été émis par ESCEN University et est authentique.",
    not_found_title: "Identifiant non reconnu",
    not_found_description: "Aucun relevé ne correspond à cet identifiant. Vérifiez le code saisi.",
    rate_limited_title: "Trop de tentatives",
    rate_limited_description:
      "Vous avez effectué trop de tentatives. Veuillez réessayer dans quelques minutes.",
    error_title: "Erreur technique",
    error_description: "Une erreur est survenue. Veuillez réessayer ou contacter le service informatique.",
    back: "Nouvelle vérification",
    student: "Étudiant",
    promo: "Promotion",
    moyenne: "Moyenne générale",
    mention: "Mention",
    status: "Statut",
    details_title: "Détail des notes",
    matiere: "Matière",
    code: "Code",
    credit: "Crédits",
    note: "Note",
    verified_at: "Vérifié le",
    download: "Télécharger le PDF",
  },

  // ─── Admin ───────────────────────────────────────────────
  admin: {
    login_title: "Espace d'administration ESCEN",
    login_subtitle: "Connectez-vous pour gérer les relevés de notes.",
    email_label: "Adresse e-mail",
    email_placeholder: "prenom@escen.university",
    password_label: "Mot de passe",
    password_placeholder: "Votre mot de passe",
    login_button: "Connexion",
    logging_in: "Connexion en cours...",
    login_error: "Identifiants incorrects. Veuillez réessayer.",
    logout: "Déconnexion",
    dashboard: "Tableau de bord",
    releves: "Relevés",
    logs: "Historique",
    settings: "Paramètres",

    // Dashboard
    dashboard_title: "Tableau de bord",
    stats_active: "Relevés actifs",
    stats_cancelled: "Relevés annulés",
    stats_verifications: "Vérifications totales",
    stats_today: "Aujourd'hui",
    recent_verifications: "Dernières vérifications",
    recent_actions: "Actions récentes",

    // Relevés
    releves_title: "Gestion des relevés",
    search_placeholder: "Rechercher par nom, identifiant ou promo...",
    create_releve: "Nouveau relevé",
    detail_title: "Détail du relevé",
    cancel_releve: "Annuler ce relevé",
    cancel_confirm: "Êtes-vous sûr de vouloir annuler ce relevé ? Cette action est irréversible.",
    replaced_by: "Remplacé par",
    no_results: "Aucun relevé trouvé.",

    // Logs
    logs_title: "Historique des vérifications",
    export_csv: "Exporter en CSV",
    no_logs: "Aucune vérification enregistrée.",
    log_date: "Date",
    log_releve: "Relevé",
    log_result: "Résultat",
    log_ip: "IP (hashée)",
    log_user_agent: "Navigateur",
  },

  // ─── Common ──────────────────────────────────────────────
  common: {
    loading: "Chargement...",
    error: "Une erreur est survenue.",
    retry: "Réessayer",
    close: "Fermer",
    save: "Enregistrer",
    cancel: "Annuler",
    confirm: "Confirmer",
    search: "Rechercher",
    export: "Exporter",
    fr: "Français",
    en: "English",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
  },

  // ─── Mentions légales ────────────────────────────────────
  legal: {
    copyright: "ESCEN University. Tous droits réservés.",
    privacy: "Protection des données",
    terms: "Conditions d'utilisation",
  },
};

export default fr;
export type Translations = typeof fr;
