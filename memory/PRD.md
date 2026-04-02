# SIRA TAXI - Product Requirements Document

## Original Problem Statement
Application de transport (ride-hailing) comme Uber pour les taxis au Mali avec toutes les fonctionnalités. Rebaptisée "SIRA TAXI".

## User Personas
- **Passager**: Réserve des courses, suit en temps réel, paye en espèces ou Mobile Money
- **Chauffeur**: Accepte des courses, gère son portefeuille, consulte ses gains
- **Admin**: Gère les utilisateurs, suit les courses, consulte les revenus et commissions de la plateforme

## Core Requirements
- Auth JWT + Google OAuth
- 3 rôles distincts (Admin, Chauffeur, Passager)
- Profils distincts pour chauffeurs et passagers
- Réservation de courses avec choix du véhicule (TAXI/MOTO)
- Tarification dynamique par type de véhicule
- Portefeuille chauffeur pour les gains
- Portefeuille plateforme (admin) avec commission 15%
- Chat en temps réel entre chauffeur et passager
- Historique des courses
- Évaluations/notes
- Design Neo-Brutalist (noir/jaune #FFBE00)

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI, Python
- **Database**: MongoDB (Motor)
- **Auth**: JWT + Emergent Google OAuth

## What's Been Implemented (All DONE)
1. Full-stack scaffolding (Auth, Users, Rides)
2. Distinct Driver Profile
3. Driver Wallet with earnings tracking
4. Platform Commission Wallet (Admin)
5. Rebranding to "SIRA TAXI"
6. Deployment Guide & Backend Optimizations
7. Distinct Passenger Profile
8. MOTO-TAXI vehicle option & pricing logic
9. Logo visibility enhancement - Logo prominent on all pages
10. PWA setup - manifest.json, service-worker.js, icons, favicon, install banner
11. **Page Contact / À propos** - Formulaire de contact (POST /api/contact), coordonnées (contact@sirataxi.ml), section À propos, liens header + footer
12. **Bug fix: course bloquée** - Correction fetchActiveRide (stale closure, état incorrect pour rides pending), suppression polling redondant, padding bottom sheet (pb-14) pour boutons visibles sur mobile
13. **Bug fix: app bloquée après acceptation** - Boucle infinie dans driver Dashboard useEffect (activeRide dans deps), corrigé avec useRef pattern. Flux complet vérifié: pending → accepted → arrived → in_progress → completed
14. **Notifications sonores** - Cloche notification chauffeur (badge + son + dropdown courses disponibles + bouton ACCEPTER), Cloche notification passager (alertes statut : chauffeur trouvé, arrivé, en cours, terminé)
15. **Onglet Paiements Admin** - Gestion paiements chauffeurs : table portefeuilles, cards résumé (total à payer/versé), modal de paiement, historique des paiements. Endpoints: GET /api/admin/drivers/wallets, POST /api/admin/drivers/{id}/pay, GET /api/admin/payments/history
16. **GPS & Carte OpenStreetMap** - Remplacement des cartes statiques par de vraies cartes interactives Leaflet/OpenStreetMap. Géolocalisation native du navigateur (watchPosition). Marqueurs colorés: vert=pickup, rouge=dropoff, bleu=passager, jaune=chauffeur. Position envoyée au backend via PUT /api/users/location. Carte centrée sur Bamako par défaut.
17. **Pages de connexion distinctes** - Écran de choix initial "JE SUIS PASSAGER" / "JE SUIS CHAUFFEUR". Formulaire passager: fond blanc, badge "ESPACE PASSAGER", Google Login. Formulaire chauffeur: fond noir, bordure dorée, badge "ESPACE CHAUFFEUR", sans Google Login. Bouton "Changer de mode" pour revenir au choix.

## Architecture
```
/app/
├── backend/
│   ├── server.py (FastAPI, all endpoints)
│   ├── seed_admin.py
│   ├── .env
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   ├── index.html (PWA meta, SW registration, install banner)
│   │   ├── manifest.json
│   │   ├── service-worker.js
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   └── favicon.ico
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── admin/ (Dashboard.jsx, PlatformWallet.jsx)
│   │   │   ├── driver/ (Dashboard.jsx, Profile.jsx, Wallet.jsx)
│   │   │   └── passenger/ (Dashboard.jsx, Profile.jsx)
│   │   ├── components/ui/ (Shadcn)
│   │   ├── App.js
│   │   └── index.css
│   ├── package.json
│   └── .env
└── memory/ (PRD.md, test_credentials.md)
```

## Key API Endpoints
- POST /api/auth/login, POST /api/auth/register, GET /api/auth/me
- GET /api/rides/estimate, POST /api/rides, GET /api/rides/active
- GET /api/wallet, GET /api/wallet/transactions
- GET /api/admin/stats, GET /api/admin/platform-wallet

## Prioritized Backlog

### P0 (Critical)
- [ ] Driver vehicle type configuration (Voiture/Moto) in profile
- [ ] Driver filtering/dispatching based on vehicle type

### P1 (Important)
- [ ] Backend refactoring - Split server.py into routers

### P2 (Future)
- [ ] Real geolocation APIs (Google Maps) integration
- [ ] Real-time chat with WebSockets
- [ ] Push notifications
- [ ] Payment gateway integration (Orange Money, etc.)
