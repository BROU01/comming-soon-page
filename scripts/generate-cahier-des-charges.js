/**
 * Script de génération du Cahier des Charges PDF
 * Projet : ESCEN - QR Code & Vérification des Relevés de Notes
 *
 * Usage : node scripts/generate-cahier-des-charges.js
 * Le PDF sera créé dans le dossier docs/
 */

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// ─── Couleurs ESCEN ─────────────────────────────────────────
const NAVY = "#1D2B6B";
const CYAN = "#00B7D9";
const DARK = "#1A1A2E";
const GRAY = "#64748B";
const LIGHT_GRAY = "#F3F8FB";
const WHITE = "#FFFFFF";

// ─── Helpers ─────────────────────────────────────────────────
function addTitle(doc, text, size = 24) {
  doc.font("Helvetica-Bold").fontSize(size).fillColor(NAVY).text(text, { align: "left" });
  doc.moveDown(0.3);
  // Ligne de séparation cyan
  doc.rect(doc.x, doc.y, 60, 3).fill(CYAN);
  doc.moveDown(1.2);
}

function addSectionTitle(doc, text, size = 16) {
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(size).fillColor(NAVY).text(text);
  doc.moveDown(0.5);
}

function addSubSectionTitle(doc, text, size = 13) {
  doc.font("Helvetica-Bold").fontSize(size).fillColor(CYAN).text(text);
  doc.moveDown(0.3);
}

function addBody(doc, text, indent = 0) {
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(DARK)
    .text(text, { indent, align: "justify", lineGap: 4 });
  doc.moveDown(0.3);
}

function addBullet(doc, text) {
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(DARK)
    .text(`  •  ${text}`, { indent: 10, lineGap: 5 });
  doc.moveDown(0.1);
}

function addCheckItem(doc, label, status) {
  const icon = status === "fait" ? "✅" : "⬜";
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(DARK)
    .text(`  ${icon}   ${label}`, { indent: 10, lineGap: 5 });
  doc.moveDown(0.1);
}

function addStatusTag(doc, text, color) {
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(color)
    .text(`[ ${text} ]`, { continued: false, lineGap: 4 });
}

// ─── En-tête de page avec bandeau ─────────────────────────────
function addPageHeader(doc) {
  // Bandeau navy en haut
  doc.rect(0, 0, doc.page.width, 50).fill(NAVY);
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor(WHITE)
    .text("ESCEN UNIVERSITY", 50, 16, { align: "left" });
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(WHITE)
    .text("Cahier des Charges — QR Code & Vérification des Relevés", 50, 34, { align: "left" });
  // Ligne cyan
  doc.rect(50, 48, doc.page.width - 100, 1.5).fill(CYAN);
  doc.moveDown(4);
}

// ─── Pied de page ─────────────────────────────────────────────
function addFooter(doc) {
  const bottom = doc.page.height - 30;
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(GRAY)
    .text("ESCEN University — Document confidentiel", 50, bottom, { align: "left" });
  doc.text(
    `Page ${doc.bufferedPageRange().count || doc.page.pageNumber || 1}`,
    50,
    bottom,
    { align: "right" }
  );
}

// ─── Génération du PDF ────────────────────────────────────────
function generatePDF() {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 70, bottom: 50, left: 50, right: 50 },
    info: {
      Title: "ESCEN - Cahier des Charges : QR Code & Vérification des Relevés",
      Author: "ESCEN University / Freebuff AI",
      Subject: "Cahier des charges technique du projet de vérification de diplômes",
      Keywords: "ESCEN, QR Code, vérification, diplôme, cahier des charges",
    },
  });

  const outputPath = path.join(__dirname, "..", "docs", "Cahier_des_charges_ESCEN_Projet.pdf");
  const stream = fs.createWriteStream(outputPath);

  doc.pipe(stream);

  // ==============================================================
  // PAGE DE GARDE
  // ==============================================================
  // Fond
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#FAFBFC");

  // Bandeau haut
  doc.rect(0, 0, doc.page.width, 180).fill(NAVY);

  // Trait cyan décoratif
  doc.rect(50, 140, 80, 4).fill(CYAN);

  doc
    .font("Helvetica-Bold")
    .fontSize(30)
    .fillColor(WHITE)
    .text("CAHIER DES CHARGES", 50, 80, { align: "left" });

  doc
    .font("Helvetica")
    .fontSize(16)
    .fillColor(WHITE)
    .text("QR Code & Vérification des Relevés de Notes", 50, 160, { align: "left" });

  // Infos clés
  const infoY = 240;
  doc.fontSize(11).fillColor(NAVY);
  doc.font("Helvetica-Bold").text("Date :", 50, infoY);
  doc.font("Helvetica").fillColor(DARK).text("Juillet 2026", 120, infoY);

  doc.font("Helvetica-Bold").fillColor(NAVY).text("Statut :", 50, infoY + 22);
  doc.font("Helvetica").fillColor(CYAN).text("En cours de développement", 120, infoY + 22);

  doc.font("Helvetica-Bold").fillColor(NAVY).text("Version :", 50, infoY + 44);
  doc.font("Helvetica").fillColor(DARK).text("1.0", 120, infoY + 44);

  doc.font("Helvetica-Bold").fillColor(NAVY).text("Établissement :", 50, infoY + 66);
  doc.font("Helvetica").fillColor(DARK).text("ESCEN — École Supérieure de Commerce et d'Économie Numérique", 50, infoY + 88);

  // Résumé page de garde
  const resumeY = infoY + 140;
  doc.rect(50, resumeY, doc.page.width - 100, 100).fill(LIGHT_GRAY).stroke(CYAN);
  doc
    .font("Helvetica-BoldOblique")
    .fontSize(10)
    .fillColor(NAVY)
    .text(
      "Un système de vérification de diplômes par QR Code permettant aux recruteurs de " +
      "scanner un code sur un relevé de notes et d'afficher instantanément la version " +
      "numérique officielle, sans compte à créer.",
      60,
      resumeY + 15,
      { width: doc.page.width - 120, align: "center", lineGap: 5 }
    );

  doc.addPage();

  // ==============================================================
  // SOMMAIRE
  // ==============================================================
  addPageHeader(doc);
  addTitle(doc, "Sommaire");
  const toc = [
    "1.  Contexte & Objectifs",
    "2.  Solution Technique",
    "3.  Architecture du Projet",
    "4.  Phase 1 — Ce qui est déjà fait (Coming Soon)",
    "5.  Phase 2 — Page de Vérification Publique",
    "6.  Phase 3 — Espace d'Administration",
    "7.  Phase 4 — Base de Données & API",
    "8.  Phase 5 — Génération de QR Codes & PDF",
    "9.  Sécurité & Traçabilité",
    "10. Roadmap & Planning",
    "11. Questions à Trancher",
    "12. Design System",
  ];
  toc.forEach((item) => {
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(DARK)
      .text(item, { indent: 20, lineGap: 8 });
  });

  doc.addPage();

  // ==============================================================
  // 1. CONTEXTE & OBJECTIFS
  // ==============================================================
  addPageHeader(doc);
  addTitle(doc, "1. Contexte & Objectifs");

  addSectionTitle(doc, "Le Problème");
  addBody(
    doc,
    "Aujourd'hui, un étudiant transmet son relevé de notes à un employeur sous forme de " +
    "papier ou PDF. Ce document ne peut pas être vérifié facilement : il peut être modifié " +
    "ou falsifié, et le recruteur n'a aucun moyen simple de contrôler son authenticité. " +
    "Cette situation expose l'université, les étudiants et les recruteurs à des risques " +
    "de fraude documentaire."
  );

  addSectionTitle(doc, "La Solution");
  addBody(
    doc,
    "ESCEN University souhaite ajouter un QR Code unique sur chaque relevé de notes. " +
    "En scannant ce code, le recruteur arrive sur une page internet officielle, entre " +
    "l'identifiant du relevé, et voit la version numérique authentique du document. " +
    "Simple, rapide, et sans création de compte."
  );

  addSectionTitle(doc, "Objectifs");
  addBullet(doc, "Prouver que les relevés délivrés par l'université sont authentiques");
  addBullet(doc, "Réduire le risque de faux documents et de fraudes");
  addBullet(doc, "Permettre une vérification en quelques secondes depuis un téléphone");
  addBullet(doc, "Garder une trace de chaque vérification (traçabilité complète)");
  addBullet(doc, "Rester simple d'utilisation : zéro compte, zéro installation");

  addSectionTitle(doc, "Personnes Concernées");
  addBullet(doc, "Étudiant / Diplômé — Reçoit un relevé avec QR Code, le transmet aux recruteurs");
  addBullet(doc, "Recruteur — Scanne le QR Code et consulte le relevé officiel");
  addBullet(doc, "Service Scolarité — Suit les relevés et corrige les anomalies");
  addBullet(doc, "Service Informatique — Gère la technique, la sécurité et la disponibilité");

  doc.addPage();

  // ==============================================================
  // 2. SOLUTION TECHNIQUE
  // ==============================================================
  addPageHeader(doc);
  addTitle(doc, "2. Solution Technique");

  addSectionTitle(doc, "Stack Technologique");
  const stackData = [
    ["Framework", "Next.js 16 (App Router)"],
    ["Langage", "TypeScript"],
    ["Styling", "Tailwind CSS v4"],
    ["Font", "Inter / Avenir Next"],
    ["PDF", "PDFKit (génération de QR Codes et relevés)"],
    ["QR Code", "Bibliothèque qrcode (npm)"],
    ["Base de données", "À définir (Supabase / PostgreSQL)"],
    ["Hébergement", "Vercel (Coming Soon) — À définir pour la suite"],
    ["Domaine", "verif.escen-university.fr (à réserver)"],
  ];
  stackData.forEach(([key, val]) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(NAVY)
      .text(`  ${key} : `, { continued: true });
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(DARK)
      .text(val, { lineGap: 6 });
  });

  addSectionTitle(doc, "Fonctionnement Général");
  addSubSectionTitle(doc, "Création du relevé numérique");
  addBullet(doc, "La scolarité valide un relevé dans le système actuel");
  addBullet(doc, "Le relevé est récupéré automatiquement par le nouveau système");
  addBullet(doc, "Un identifiant unique (UUID) est créé pour ce relevé");
  addBullet(doc, "Un QR Code est généré contenant le lien de vérification");
  addBullet(doc, "Le QR Code est ajouté sur le relevé PDF remis à l'étudiant");

  addSubSectionTitle(doc, "Vérification par le recruteur");
  addBullet(doc, "Le recruteur scanne le QR Code avec l'appareil photo de son téléphone");
  addBullet(doc, "Il arrive sur la page de vérification et saisit l'identifiant");
  addBullet(doc, "Il voit le relevé numérique officiel et à jour");
  addBullet(doc, "La vérification est enregistrée (date, heure, résultat)");

  doc.addPage();

  // ==============================================================
  // 3. ARCHITECTURE DU PROJET
  // ==============================================================
  addPageHeader(doc);
  addTitle(doc, "3. Architecture du Projet");

  addBody(
    doc,
    "Le projet est structuré en plusieurs sous-systèmes interconnectés :"
  );

  const archData = [
    [
      "Page publique de vérification",
      "Vue par les recruteurs après le scan du QR Code. Mobile-first, sans compte.",
    ],
    [
      "Espace d'administration",
      "Interface sécurisée pour la scolarité et le service IT. Gestion des relevés, historique, export.",
    ],
    [
      "Cœur du système (API)",
      "Crée les identifiants uniques et QR Codes, gère les relevés et l'historique des vérifications.",
    ],
    [
      "Base de données",
      "Stocke les relevés, les logs de vérification, les actions administrateur.",
    ],
    [
      "Lien avec le système existant",
      "Récupère automatiquement les relevés validés par la scolarité (API ou import fichier).",
    ],
  ];
  archData.forEach(([title, desc]) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(NAVY)
      .text(title, { lineGap: 3 });
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(DARK)
      .text(desc, { indent: 10, lineGap: 8, align: "justify" });
    doc.moveDown(0.3);
  });

  // Schéma architecture (textuel)
  doc.moveDown(0.5);
  doc.rect(50, doc.y, doc.page.width - 100, 170).fill(LIGHT_GRAY).stroke(CYAN);
  let archY = doc.y + 15;
  doc.font("Helvetica-Bold").fontSize(10).fillColor(NAVY).text("Schéma d'Architecture", 65, archY);
  archY += 20;

  const schemaLines = [
    "┌──────────────────────────────────────────────────────────────────┐",
    "│                UTILISATEURS                                      │",
    "│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │",
    "│  │  Recruteur   │  │  Scolarité   │  │  Service IT          │  │",
    "│  │  (Scan QR)   │  │  (Gestion)   │  │  (Administration)    │  │",
    "│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │",
    "└─────────┼────────────────┼──────────────────────┼──────────────┘",
    "          │                │                      │               ",
    "┌─────────▼────────────────▼──────────────────────▼──────────────┐",
    "│                     NEXT.JS 16 (App Router)                     │",
    "│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │",
    "│  │ /verify/[id] │  │ /admin/*     │  │  /api/*              │  │",
    "│  │ Page publique│  │ Dashboard    │  │  API REST            │  │",
    "│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │",
    "└─────────┼────────────────┼──────────────────────┼──────────────┘",
    "          │                │                      │               ",
    "┌─────────▼────────────────▼──────────────────────▼──────────────┐",
    "│                BASE DE DONNÉES                                  │",
    "│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │",
    "│  │ relevés      │  │ vérifications│  │  admin_logs          │  │",
    "│  └──────────────┘  └──────────────┘  └──────────────────────┘  │",
    "└─────────────────────────────────────────────────────────────────┘",
  ];
  schemaLines.forEach((line, i) => {
    doc.font("Courier").fontSize(6.5).fillColor(NAVY).text(line, 58, archY + i * 9);
  });

  doc.addPage();

  // ==============================================================
  // 4. PHASE 1 — CE QUI EST DÉJÀ FAIT
  // ==============================================================
  addPageHeader(doc);
  addTitle(doc, "4. Phase 1 — Page « Coming Soon » (Terminée)");

  addBody(
    doc,
    "Une page d'annonce a été développée et est opérationnelle. Elle sert de teaser " +
    "et permet de collecter les emails des personnes intéressées."
  );

  addSectionTitle(doc, "Composants Livrés");
  const components = [
    ["Next.js 16 + TypeScript", "fait"],
    ["Tailwind CSS v4 — Design system complet (couleurs, espacements, timing)", "fait"],
    ["CountdownTimer — Compte à rebours 60 jours avec animation flip à l'iPhone", "fait"],
    ["EmailForm — Collecte d'emails avec validation et feedback", "fait"],
    ["SocialProof — Citations rotatives animées (Mandela, Roosevelt…)", "fait"],
    ["SiteFooter — Copyright et lien vers l'université", "fait"],
    ["Vidéo de fond avec overlay gradient", "fait"],
    ["SEO complet — Open Graph, JSON-LD, Twitter Cards", "fait"],
    ["Robots.txt et Sitemap.xml dynamiques", "fait"],
    ["CSP (Content Security Policy)", "fait"],
    ["Design tokens — 3 niveaux de bleu marine + cyan, gris neutre", "fait"],
    ["Accessibilité — WCAG AA, aria-live, prefers-reduced-motion", "fait"],
  ];
  components.forEach(([label, status]) => {
    addCheckItem(doc, label, status);
  });

  addSectionTitle(doc, "Design System (Établi)");
  addBullet(doc, "Palette : Bleu marine #1D2B6B, Cyan #00B7D9, Fond #FAFBFC");
  addBullet(doc, "Typographie : Avenir Next / Inter, sérieuse et lisible");
  addBullet(doc, "Style : Minimalisme académique + Digital Premium");
  addBullet(doc, "Mobile-first : le recruteur utilise son téléphone");
  addBullet(doc, "Accessible : WCAG AA, focus-visible, réduction de mouvement");

  doc.addPage();

  // ==============================================================
  // 5. PHASE 2 — PAGE DE VÉRIFICATION PUBLIQUE
  // ==============================================================
  addPageHeader(doc);
  addTitle(doc, "5. Phase 2 — Page de Vérification Publique");

  addSectionTitle(doc, "Route");
  addBody(doc, "GET /verify/[id] — Page accessible sans authentification.");

  addSectionTitle(doc, "Fonctionnement");
  addBullet(doc, "Le recruteur scanne le QR Code → ouvre directement /verify");
  addBullet(doc, "L'identifiant est pré-rempli depuis l'URL (ou saisi manuellement)");
  addBullet(doc, "Le système valide l'identifiant auprès de l'API");
  addBullet(doc, "Si valide → affichage du relevé numérique officiel");
  addBullet(doc, "Si invalide → message d'erreur vague (ne pas aider le fraudeur)");
  addBullet(doc, "Si annulé → message clair indiquant que le relevé n'est plus valide");

  addSectionTitle(doc, "Exigences Techniques");
  addBullet(doc, "Temps de chargement < 2 secondes (objectif < 1.5s)");
  addBullet(doc, "Design responsive : priorité écran mobile (320px → desktop)");
  addBullet(doc, "Page 100 % statique possible avec revalidation côté client");
  addBullet(doc, "Protection anti-robot : rate limiting (5 tentatives/min/IP)");
  addBullet(doc, "Pas de compte requis, pas de cookie superflu, pas de tracking");

  addSectionTitle(doc, "Protection Anti-Fraude");
  addBullet(doc, "Message d'erreur volontairement vague en cas d'ID invalide");
  addBullet(doc, "Rate limiting agressif sur /api/verify");
  addBullet(doc, "Option CAPTCHA après seuil d'échecs atteint");
  addBullet(doc, "Log de chaque tentative (réussie ou échouée)");

  doc.addPage();

  // ==============================================================
  // 6. PHASE 3 — ESPACE D'ADMINISTRATION
  // ==============================================================
  addPageHeader(doc);
  addTitle(doc, "6. Phase 3 — Espace d'Administration");

  addSectionTitle(doc, "Routes");
  addBullet(doc, "/admin/login — Page de connexion sécurisée");
  addBullet(doc, "/admin/dashboard — Vue d'ensemble (statistiques, alertes)");
  addBullet(doc, "/admin/releves — Liste + recherche par ID ou nom étudiant");
  addBullet(doc, "/admin/releves/[id] — Détail d'un relevé (voir, annuler, remplacer)");
  addBullet(doc, "/admin/logs — Historique complet des vérifications et actions");

  addSectionTitle(doc, "Fonctionnalités");
  addBullet(doc, "Authentification sécurisée (JWT ou sessions, RBAC)");
  addBullet(doc, "Recherche par identifiant unique, nom d'étudiant, date");
  addBullet(doc, "Actions sur relevé : voir, annuler, remplacer (nouvelle version)");
  addBullet(doc, "Export CSV de l'historique des vérifications");
  addBullet(doc, "Journal des actions administrateur (qui a fait quoi, quand)");
  addBullet(doc, "Notifications en cas de comportement anormal");

  addSectionTitle(doc, "Niveaux d'Accès (RBAC)");
  addBullet(doc, "Admin (IT) : accès complet, configuration technique");
  addBullet(doc, "Gestionnaire (Scolarité) : gestion des relevés, lecture des logs");
  addBullet(doc, "Auditeur (lecture seule) : consultation des logs et historique");

  doc.addPage();

  // ==============================================================
  // 7. PHASE 4 — BASE DE DONNÉES & API
  // ==============================================================
  addPageHeader(doc);
  addTitle(doc, "7. Phase 4 — Base de Données & API");

  addSectionTitle(doc, "Modèle de Données");
  addSubSectionTitle(doc, "Table : releves");
  addBullet(doc, "id — UUID unique (identifiant du relevé, impossible à deviner)");
  addBullet(doc, "student_name — Nom complet de l'étudiant");
  addBullet(doc, "student_id — Numéro étudiant interne");
  addBullet(doc, "notes_data — Notes et résultats (format JSON structuré)");
  addBullet(doc, "pdf_url — Chemin vers le PDF officiel du relevé");
  addBullet(doc, "status — Statut : active | cancelled | replaced");
  addBullet(doc, "created_at / updated_at — Horodatage");

  addSubSectionTitle(doc, "Table : verifications");
  addBullet(doc, "id — Identifiant unique de vérification");
  addBullet(doc, "releve_id — FK vers releves.id");
  addBullet(doc, "ip_address — Adresse IP hashée (RGPD)");
  addBullet(doc, "user_agent — Navigateur/appareil utilisé");
  addBullet(doc, "result — success | failed");
  addBullet(doc, "timestamp — Date et heure de la vérification");

  addSubSectionTitle(doc, "Table : admin_logs");
  addBullet(doc, "id — Identifiant unique");
  addBullet(doc, "admin_id — FK vers administrateur");
  addBullet(doc, "action — Type d'action (view, cancel, replace, export...)");
  addBullet(doc, "target_releve_id — FK vers releves.id");
  addBullet(doc, "details — JSON optionnel avec les détails de l'action");
  addBullet(doc, "timestamp — Date et heure de l'action");

  addSectionTitle(doc, "Endpoints API");
  const apiData = [
    ["GET /api/releve/[id]", "Renvoie le relevé officiel (public)"],
    ["POST /api/verify", "Vérifie un identifiant et log la tentative"],
    ["POST /api/admin/login", "Authentification administrateur"],
    ["GET /api/admin/releves", "Liste des relevés (protégé)"],
    ["POST /api/admin/releves", "Créer/modifier un relevé (protégé)"],
    ["DELETE /api/admin/releves/[id]", "Annuler un relevé (protégé)"],
    ["GET /api/admin/logs", "Historique des vérifications (protégé)"],
    ["GET /api/admin/logs/export", "Export CSV (protégé)"],
  ];
  apiData.forEach(([endpoint, desc]) => {
    doc
      .font("Courier")
      .fontSize(9)
      .fillColor(CYAN)
      .text(`  ${endpoint}`, { continued: true });
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(DARK)
      .text(`  —  ${desc}`, { lineGap: 6 });
  });

  doc.addPage();

  // ==============================================================
  // 8. PHASE 5 — GÉNÉRATION QR CODE & PDF
  // ==============================================================
  addPageHeader(doc);
  addTitle(doc, "8. Phase 5 — Génération de QR Codes & PDF");

  addSectionTitle(doc, "Génération du QR Code");
  addBullet(doc, "Bibliothèque : qrcode (npm)");
  addBullet(doc, "Contenu du QR : https://verif.escen-university.fr/verify/[UUID]");
  addBullet(doc, "Format : PNG, 300x300px, niveau de correction M (15 %)");
  addBullet(doc, "Placement : en haut à droite du relevé PDF");
  addBullet(doc, "Le QR est régénéré si le statut du relevé change (annulé → message spécifique)");

  addSectionTitle(doc, "Génération du Relevé PDF");
  addBullet(doc, "Bibliothèque : PDFKit (Node.js)");
  addBullet(doc, "Template : reprend la charte ESCEN (couleurs, logo, typographie)");
  addBullet(doc, "Le QR Code est intégré directement dans le PDF généré");
  addBullet(doc, "Le PDF est stocké et servi depuis le serveur ou un CDN");

  addSectionTitle(doc, "Cycle de Vie d'un Relevé");
  addBullet(doc, "Création → statut « active », QR Code généré, PDF créé");
  addBullet(doc, "Correction → statut « replaced », nouvelle version sous le même ID");
  addBullet(doc, "Annulation → statut « cancelled », QR affiche « Relevé annulé »");
  addBullet(doc, "L'identifiant ne change jamais, même après correction ou remplacement");

  doc.addPage();

  // ==============================================================
  // 9. SÉCURITÉ & TRAÇABILITÉ
  // ==============================================================
  addPageHeader(doc);
  addTitle(doc, "9. Sécurité & Traçabilité");

  const secData = [
    ["HTTPS", "Connexion chiffrée sur l'ensemble du site (certificat TLS)"],
    ["UUID non prédictibles", "Les identifiants utilisent UUID v4, impossibles à deviner"],
    ["Rate limiting", "Protection contre les attaques par force brute (5 req/min/IP)"],
    ["CAPTCHA", "Activé après échecs répétés sur un même identifiant"],
    ["Messages d'erreur vagues", "Ne pas révéler si un ID existe ou non"],
    ["Hachage IP", "Les adresses IP sont hashées (conformité RGPD)"],
    ["Journalisation", "Chaque action admin et chaque tentative de vérification est loggée"],
    ["Audit", "Export possible de l'historique pour audit externe"],
    ["CSP", "Content Security Policy stricte (déjà en place)"],
    ["RBAC", "Contrôle d'accès basé sur les rôles (admin, gestionnaire, auditeur)"],
  ];
  secData.forEach(([req, desc]) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(NAVY)
      .text(`  ${req}`, { continued: true });
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(DARK)
      .text(`  —  ${desc}`, { lineGap: 6 });
  });

  addSectionTitle(doc, "Conformité RGPD");
  addBullet(doc, "Minimisation des données : seules les notes et le nom sont affichés");
  addBullet(doc, "Hachage des adresses IP dans les logs");
  addBullet(doc, "Durée de conservation des logs à définir (proposition : 3 ans)");
  addBullet(doc, "Pas de cookie tiers, pas de tracking, pas de publicité");
  addBullet(doc, "Droit à l'effacement des données personnelles sur demande");

  doc.addPage();

  // ==============================================================
  // 10. ROADMAP & PLANNING
  // ==============================================================
  addPageHeader(doc);
  addTitle(doc, "10. Roadmap & Planning");

  const phases = [
    {
      name: "Phase 1 — Coming Soon",
      status: "✅ TERMINÉE",
      color: CYAN,
      duration: "Juillet 2026",
      items: [
        "Page d'annonce avec timer, formulaire email, citations",
        "Design system complet (couleurs, typographie, accessibilité)",
        "SEO, Open Graph, JSON-LD, robots.txt, sitemap.xml",
      ],
    },
    {
      name: "Phase 2 — Fondations",
      status: "⬜ À VENIR",
      color: GRAY,
      duration: "Semaines 1-2",
      items: [
        "Choix et installation de la base de données",
        "Création des API routes Next.js (/api/releve, /api/verify)",
        "Modèles de données et scripts de seed",
      ],
    },
    {
      name: "Phase 3 — Vérification Publique",
      status: "⬜ À VENIR",
      color: GRAY,
      duration: "Semaines 3-5",
      items: [
        "Page /verify avec affichage du relevé officiel",
        "Génération de QR Codes et PDF",
        "Rate limiting et sécurité de base",
      ],
    },
    {
      name: "Phase 4 — Administration",
      status: "⬜ À VENIR",
      color: GRAY,
      duration: "Semaines 6-8",
      items: [
        "Espace d'administration : login, dashboard, recherche",
        "Gestion des relevés (création, annulation, remplacement)",
        "Journalisation complète et export CSV",
      ],
    },
    {
      name: "Phase 5 — Finalisation",
      status: "⬜ À VENIR",
      color: GRAY,
      duration: "Semaines 9-12",
      items: [
        "Tests de sécurité et pénétration",
        "Tests utilisateurs (scolarité, recruteurs)",
        "Déploiement en production",
        "Documentation et formation des équipes",
      ],
    },
  ];

  phases.forEach((phase) => {
    // Carte de phase
    const yStart = doc.y;
    doc.rect(50, yStart, doc.page.width - 100, 20).fill(NAVY);
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(WHITE)
      .text(`${phase.name}  ${phase.status}  [${phase.duration}]`, 60, yStart + 5);
    doc.moveDown(1.2);

    phase.items.forEach((item) => {
      addBullet(doc, item);
    });

    // Espacement entre phases
    const space = phase === phases[phases.length - 1] ? 0 : 1.2;
    doc.moveDown(space);

    // Vérifier si on a besoin d'une nouvelle page
    if (doc.y > doc.page.height - 120 && phase !== phases[phases.length - 1]) {
      doc.addPage();
      addPageHeader(doc);
    }
  });

  doc.addPage();

  // ==============================================================
  // 11. QUESTIONS À TRANCHER
  // ==============================================================
  addPageHeader(doc);
  addTitle(doc, "11. Questions à Trancher avec l'École");

  addSectionTitle(doc, "Base de Données");
  addBody(
    doc,
    "Quelle technologie utiliser ? Supabase (PostgreSQL hébergé, authentification intégrée) " +
    "ou un serveur PostgreSQL dédié ? Supabase simplifie l'authentification pour l'espace admin."
  );

  addSectionTitle(doc, "Hébergement & Domaine");
  addBody(
    doc,
    "Le coming soon est sur Vercel. On continue avec Vercel pour la suite ? " +
    "Le domaine verif.escen-university.fr est-il réservé ?"
  );

  addSectionTitle(doc, "Intégration avec le Système Existant");
  addBody(
    doc,
    "Le système actuel de la scolarité a-t-il une API ? Ou faudra-t-il " +
    "importer les relevés via des fichiers CSV/Excel périodiquement ? " +
    "Cette question impacte directement l'architecture du connecteur."
  );

  addSectionTitle(doc, "Contenu du Relevé sur la Page de Vérification");
  addBody(
    doc,
    "Le recruteur voit-il toutes les notes en détail, ou seulement un résumé " +
    "(moyenne, mention, validation) ? Peut-il télécharger le PDF officiel ?"
  );

  addSectionTitle(doc, "Volume & Dimensionnement");
  addBody(
    doc,
    "Combien de relevés sont créés chaque année ? Cela permet de dimensionner " +
    "correctement le stockage, la bande passante et le budget."
  );

  addSectionTitle(doc, "Langue");
  addBody(
    doc,
    "Le site doit-il être uniquement en français, ou aussi en anglais pour " +
    "les recruteurs internationaux ?"
  );

  addSectionTitle(doc, "Sécurité");
  addBody(
    doc,
    "Faut-il un CAPTCHA dès le lancement ou seulement après détection d'abus ? " +
    "Combien de temps conserver l'historique des vérifications ? (Proposition : 3 ans)"
  );

  doc.addPage();

  // ==============================================================
  // 12. DESIGN SYSTEM
  // ==============================================================
  addPageHeader(doc);
  addTitle(doc, "12. Design System ESCEN");

  addSectionTitle(doc, "Palette de Couleurs");

  // Blocs de couleurs
  const colors = [
    { name: "Bleu Marine", hex: "#1D2B6B", desc: "Couleur principale (textes, boutons, header)" },
    { name: "Bleu Clair", hex: "#3A4A8C", desc: "Hover boutons, accents secondaires" },
    { name: "Cyan", hex: "#00B7D9", desc: "Accent principal (liens, chiffres timer, bordures)" },
    { name: "Cyan Clair", hex: "#DCECF2", desc: "Fond des cartes, slots du timer" },
    { name: "Fond", hex: "#FAFBFC", desc: "Fond de page général" },
    { name: "Surface", hex: "#FFFFFF", desc: "Fond des cartes et conteneurs" },
    { name: "Texte", hex: "#1D2B6B", desc: "Couleur du texte principal" },
    { name: "Texte secondaire", hex: "#64748B", desc: "Sous-titres, labels, footer" },
    { name: "Bordure", hex: "#E6EEF2", desc: "Bordures des cartes et inputs" },
  ];

  colors.forEach(({ name, hex, desc }) => {
    // Petit carré de couleur
    doc.rect(60, doc.y, 16, 16).fill(hex);
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(DARK)
      .text(`  ${name} (${hex})`, 84, doc.y - 1, { continued: false, lineGap: 2 });
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(GRAY)
      .text(`     ${desc}`, 84, doc.y + 2, { lineGap: 10 });
    doc.moveDown(1.5);
  });

  addSectionTitle(doc, "Typographie");
  addBullet(doc, "Police principale : Avenir Next / Inter (Google Fonts)");
  addBullet(doc, "Style : Minimalisme académique, serein et lisible");
  addBullet(doc, "Tailles : clamp() pour le responsive fluide");

  addSectionTitle(doc, "Accessibilité");
  addBullet(doc, "WCAG AA — contrastes suffisants, rôles ARIA");
  addBullet(doc, "prefers-reduced-motion — désactive les animations");
  addBullet(doc, "focus-visible — outline cyan sur tous les éléments interactifs");
  addBullet(doc, "aria-live — annonces pour le timer et les feedbacks");

  // ==============================================================
  // CONCLUSION
  // ==============================================================
  doc.moveDown(2);
  doc.rect(50, doc.y, doc.page.width - 100, 70).fill(LIGHT_GRAY).stroke(CYAN);
  const concY = doc.y + 15;
  doc
    .font("Helvetica-BoldOblique")
    .fontSize(11)
    .fillColor(NAVY)
    .text(
      "Ce document servira de référence tout au long du développement. Il évoluera " +
      "avec les décisions prises avec l'équipe ESCEN. L'objectif final : un système de " +
      "vérification de diplômes simple, sécurisé, et digne de confiance.",
      65,
      concY,
      { width: doc.page.width - 130, align: "center", lineGap: 5 }
    );

  // ==============================================================
  // DERNIÈRE PAGE
  // ==============================================================
  doc.addPage();

  // Pleine page de conclusion
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(NAVY);

  doc
    .font("Helvetica-Bold")
    .fontSize(28)
    .fillColor(WHITE)
    .text("ESCEN", 50, 200, { align: "center" });

  doc
    .font("Helvetica")
    .fontSize(14)
    .fillColor(CYAN)
    .text("La confiance par la technologie", 50, 250, { align: "center" });

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor(WHITE)
    .text(
      "École Supérieure de Commerce et d'Économie Numérique",
      50,
      290,
      { align: "center" }
    );

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#7C89B8")
    .text(
      "Cahier des Charges — Généré le " + new Date().toLocaleDateString("fr-FR"),
      50,
      340,
      { align: "center" }
    );

  // Finaliser
  doc.end();

  stream.on("finish", () => {
    console.log(`✅ PDF généré avec succès : ${outputPath}`);
    console.log(`   Taille : ${(fs.statSync(outputPath).size / 1024).toFixed(1)} Ko`);
  });
}

generatePDF();
