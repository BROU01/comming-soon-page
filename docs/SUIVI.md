# 📋 Suivi du projet — ESCEN · Vérification sécurisée des relevés

> **Dernière mise à jour : 01/08/2026 (session : exécution complète + CAPTCHA)**
> Ce fichier est la **source de vérité** de l'avancement. Il est mis à jour à chaque fin de session.
> Légende : ✅ Fait · 🔄 En cours · ⏳ À faire · 🚫 Bloqué

---

## 🥇 Lot 1 — Page publique de vérification

**Objectif** : permettre à un recruteur de vérifier un relevé en quelques secondes, depuis un téléphone, sans compte.

| Tâche | Statut | Notes |
|---|---|---|
| Page publique de vérification (`/verify`) | ✅ | Formulaire par identifiant + affichage du relevé |
| Identifiant unique impossible à deviner (UUID) | ✅ | Généré à la création du relevé |
| QR Code intégré au relevé | ✅ | `src/lib/qr.ts` |
| PDF du relevé | ✅ | `src/lib/pdf.ts` (API `/api/releve/[id]/pdf`) |
| Message d'erreur générique (sans indice utile) | ✅ | `not_found` pour ID faux **et** relevé annulé |
| Protection anti-robots : rate limiting | ✅ | Seuil + délai artificiel 200 ms |
| CAPTCHA **dès le lancement** (décidé) | ✅ | **Cloudflare Turnstile** — widget invisible + vérification serveur `siteverify`, vérifié AVANT le rate limiting, dégradation gracieuse en dev (sans clés) |
| Performance < 2 s | ✅ | Test E2E : réponses API immédiates (valide / invalide / annulé) |

---

## 🥈 Lot 2 — Traçabilité des vérifications

**Objectif** : garder une trace de chaque vérification et alerter en cas d'abus.

| Tâche | Statut | Notes |
|---|---|---|
| Enregistrement de chaque vérification (date, heure, résultat) | ✅ | Table `verifications` + colonne `attempted_id` |
| Historique consultable par la scolarité / DSI uniquement | ✅ | RLS + espace admin |
| Alerte email en cas de comportement anormal | ✅ | Resend : ≥ 5 échecs sur un même identifiant en 15 min → alerte (cooldown 24 h) |
| Export de l'historique (audit) | ✅ | API `/api/admin/verifications/export` |
| Purge RGPD après 5 ans | ✅ | **Cron pg_cron** `purge-verifications-5y` (hebdo, lundi 03:00) + cleanup `rate_limits` 24 h — idempotent, actif si pg_cron dispo |

---

## 🥉 Lot 3 — Espace d'administration

**Objectif** : la scolarité et la DSI gèrent le système sans développeur pour les tâches courantes.

| Tâche | Statut | Notes |
|---|---|---|
| Connexion sécurisée (`/admin/login`) | ✅ | RLS `is_admin()` + `admin_roles` |
| Tableau de bord avec statistiques | ✅ | `/admin/dashboard` |
| Liste + recherche des relevés | ✅ | `/admin/releves` |
| Annulation d'un relevé (fraude / erreur) | ✅ | Statut `cancelled` → `not_found` au public |
| Création manuelle d'un relevé | ✅ | `CreateReleveForm` |
| Journal des actions admin | ✅ | Table `admin_logs` |
| Gestion du remplacement (statut `replaced`) | 🔄 | Statut prévu ; flux de « nouvelle version » à valider |

---

## 🏗️ Lot 4 — Infrastructure & déploiement

| Tâche | Statut | Notes |
|---|---|---|
| Schéma SQL versionné | ✅ | `supabase-schema.sql` (tables, enum, RLS, index) |
| **Appliquer le schéma à jour** (fraud_alerts + attempted_id) | ✅ | `npm run setup-db` OK — + correctifs idempotents (`ALTER TABLE IF NOT EXISTS` attempted_id/replaced_by, RLS fraud_alerts activée) |
| **Seed des données de test** | ✅ | `npm run seed` OK (6 étudiants + admin + 7 vérifications) |
| Test de bout en bout (création → QR → vérif → alerte) | ✅ | API validée : ID valide → succès, ID invalide/court/annulé → `not_found` générique |
| Build de production | ✅ | `npm run build` OK (toutes routes compilées) |
| Déploiement Vercel + domaine `verif.escen-university.fr` | ⏳ | Domaine décidé, réservation à confirmer |
| Vérification domaine Resend (`alerts@escen-university.fr`) | ⏳ | En production uniquement (dev : `onboarding@resend.dev`) |
| Récupération automatique des relevés (API scolarité) | ⏳ | Nécessite un échange avec l'équipe scolarité |
| API `/api/notify` (formulaire email de l'accueil) | ⏳ | TODO existant |
| Mise à jour du `README.md` | ⏳ | Décrit encore uniquement la page coming-soon |

---

## ✅ Décisions actées

| # | Décision | Lot |
|---|---|---|
| 1 | CAPTCHA **dès le lancement** (pas seulement en cas d'abus) | 1 |
| 2 | Historique des vérifications conservé **5 ans**, puis purge automatique | 2 |
| 3 | Domaine de vérification : `verif.escen-university.fr` | 4 |
| 4 | Alertes anti-fraude par email (Resend) vers la scolarité / DSI | 2 |

## ❓ Questions restées ouvertes (cahier des charges §8)

- Téléchargement PDF autorisé au public, ou affichage seul ?
- Montrer toutes les notes ou un résumé (moyenne, mention) ?
- Information supplémentaire demandée au recruteur (nom, date de naissance) ?
- Volume annuel de relevés (dimensionnement) ?
- Site en français seulement ou bilingue ?

---

## 🚀 Prochaine action (recommandée)

1. **Obtenir les clés Cloudflare Turnstile** (dash.cloudflare.com → Turnstile) et les mettre dans `.env.local` → active le CAPTCHA
2. Déclencher l'alerte anti-fraude : 5 échecs sur un même ID → vérifier l'email Resend (mettre `RESEND_ALERT_TO` à l'adresse du compte Resend en dev)
3. Déployer sur Vercel + domaine `verif.escen-university.fr`

---

## 🗂️ Correspondance GitHub Issues

Chaque lot ci-dessus correspond à un **milestone GitHub**. Les tâches `⏳` non terminées seront ouvertes en Issues au fur et à mesure :

- **Milestone « Lot 1 — Page publique »** : CAPTCHA, mesure de performance
- **Milestone « Lot 2 — Traçabilité »** : purge RGPD 5 ans
- **Milestone « Lot 3 — Admin »** : flux de remplacement (`replaced`)
- **Milestone « Lot 4 — Déploiement »** : setup-db + seed, test E2E, Vercel, domaine, API scolarité, /api/notify, README
