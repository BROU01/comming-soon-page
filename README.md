# ESCEN — Vérification sécurisée des relevés de notes

Système de vérification par **QR code** des relevés de notes ESCEN : une page publique de contrôle d'authenticité, un espace d'administration complet, une traçabilité totale et une protection anti-fraude.

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4** et **Supabase**.

## Stack

- **Framework:** Next.js 16 (App Router, convention `proxy`)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (design system ESCEN : navy `#1D2B6B`, cyan `#00B7D9`)
- **Base de données:** Supabase (PostgreSQL + RLS + cron de purge RGPD)
- **Email:** Resend (alertes anti-fraude)
- **Anti-robot:** Cloudflare Turnstile (clés configurées en production)

## Pages

| Route | Description |
|---|---|
| `/` | Page d'accueil — compte à rebours + formulaire de notification au lancement (`/api/notify`) |
| `/verify` | Vérification publique par identifiant (UUID ou QR code) |
| `/verify/[id]` | Résultat de vérification d'un relevé |
| `/admin/login` | Connexion administrateur (Supabase Auth) |
| `/admin/dashboard` | Statistiques (relevés actifs/annulés, vérifications, aujourd'hui) |
| `/admin/releves` | Gestion des relevés (création, annulation, remplacement) |
| `/admin/logs` | Journal des actions administrateurs |

## API

| Route | Méthode | Rôle |
|---|---|---|
| `/api/verify` | POST | Vérifie un identifiant + journalise la tentative (rate limiting + CAPTCHA + détection fraude) |
| `/api/releve/[id]` | GET | Détail d'un relevé actif |
| `/api/releve/[id]/qrcode` | GET | QR code du relevé (PNG) |
| `/api/releve/[id]/pdf` | GET | PDF officiel du relevé |
| `/api/notify` | POST | Inscription email « me notifier au lancement » (idempotent, rate limiting) |
| `/api/admin/login` | POST / DELETE | Connexion / déconnexion admin |
| `/api/admin/releves` | GET / POST | Liste / création des relevés |
| `/api/admin/releves/[id]` | GET / PATCH / DELETE | Détail / modification / suppression |
| `/api/admin/releves/[id]/status` | POST | Annulation / remplacement |
| `/api/admin/stats` | GET | Statistiques du dashboard |
| `/api/admin/verifications` | GET | Historique des vérifications |
| `/api/admin/verifications/export` | GET | Export CSV (audit) |

## Sécurité & anti-fraude

- **Réponses génériques** : un relevé annulé ou inconnu renvoie le même `not_found` (aucun indice au fraudeur)
- **Rate limiting** par IP (table `rate_limits`, fenêtre glissante + blocage 5 min)
- **CAPTCHA Turnstile** avant le rate limiting (les robots ne consomment pas de quota)
- **Détection de fraude** : ≥ 5 échecs sur un même identifiant en 15 min → email d'alerte à la scolarité/DSI (cooldown 24 h / identifiant)
- **IP hachées** (SHA-256, RGPD), purges automatiques (vérifications > 5 ans, rate_limits > 24 h)
- **RLS** : les relevés actifs sont publics ; tout le reste (vérifications, logs, fraud_alerts, subscribers) est réservé aux admins
- **`proxy.ts`** protège toutes les routes `/admin` (redirection vers le login si non connecté)

## Configuration (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé anon>
SUPABASE_SERVICE_ROLE_KEY=<clé service role>
SUPABASE_DB_PASSWORD=<mot de passe base>          # setup-db.ts
NEXT_PUBLIC_SITE_URL=https://...
RESEND_API_KEY=<clé Resend>
RESEND_EMAIL_FROM=alerts@escen-university.fr      # domaine vérifié en prod
RESEND_ALERT_TO=<scolarité/DSI>
TURNSTILE_SECRET_KEY=<secret>                     # production
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site key>         # production
ADMIN_SEED_EMAIL=admin@escen.university
ADMIN_SEED_PASSWORD=<mot de passe admin>
```

## Dev

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npx tsx scripts/setup-db.ts   # applique supabase-schema.sql (idempotent) + rôle admin
npx tsx scripts/seed.ts       # données de test (5 étudiants, vérifications, admin)
```

## Build

```bash
npm run build
npm start
```

## Design

- **Style:** Academic Minimalism + Digital Premium
- **Palette:** Bleu marine (#1D2B6B), Cyan (#00B7D9), gris neutre
- **Typographie:** Inter, sereine et lisible
- **Accessibilité:** WCAG AA, `aria-live`, `prefers-reduced-motion`

## Documentation

- [Cahier des charges](docs/Cahier_des_charges_QRCode_Verification.md)
- [Schéma SQL](supabase-schema.sql)
