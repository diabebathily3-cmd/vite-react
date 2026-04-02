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
- **Maps**: Leaflet + OpenStreetMap + Nominatim API

## What's Been Implemented (All DONE)
1. Full-stack scaffolding (Auth, Users, Rides)
2. Distinct Driver Profile with full dark mode theme
3. Driver Wallet with earnings tracking
4. Platform Commission Wallet (Admin)
5. Rebranding to "SIRA TAXI"
6. Deployment Guide & Backend Optimizations
7. Distinct Passenger Profile (light theme)
8. MOTO-TAXI vehicle option & pricing logic
9. Logo visibility enhancement
10. PWA setup - manifest.json, service-worker.js, icons, favicon, install banner
11. Page Contact / À propos
12. Bug fix: course bloquée (stale closure, polling fix)
13. Bug fix: app bloquée après acceptation (infinite loop fix)
14. Notifications sonores (Web Audio API, loud square wave alerts, vibration)
15. Onglet Paiements Admin
16. GPS & Carte OpenStreetMap (Leaflet, react-leaflet, geolocation)
17. Pages de connexion distinctes (Passager vs Chauffeur)
18. Modification mot de passe (profils passager et chauffeur)
19. Sonnerie notification courses (Web Audio API, repeat every 3s, browser notification)
20. **Barre de recherche de quartiers** - Composant LocationSearch avec recherche Nominatim (OpenStreetMap geocoding), quartiers populaires de Bamako en dropdown, debounce 400ms, résultats en temps réel
21. **Thème sombre complet Profil Chauffeur** - Toutes les sections (Documents, Activité Récente) converties en dark mode (bg-gray-950, bg-gray-900, bg-gray-800)
22. **Sélecteur Type de Véhicule (Voiture/Moto)** - Boutons VOITURE/MOTO dans le profil chauffeur et le modal véhicule du dashboard chauffeur. Badge visuel (bleu=voiture, orange=moto)
23. **Filtrage courses par type de véhicule** - Backend /api/rides/pending filtre les courses par vehicle_category du chauffeur (un chauffeur moto ne voit que les demandes moto)

## Pricing
- **Voiture (TAXI)**: 500 FCFA base + 300 FCFA/km
- **Moto (MOTO-TAXI)**: 200 FCFA base + 150 FCFA/km
- **Commission plateforme**: 15%

## Key API Endpoints
- POST /api/auth/register, /api/auth/login, /api/auth/session (Google OAuth)
- GET /api/auth/me, POST /api/auth/logout
- PUT /api/users/location, /api/users/status, /api/users/vehicle, /api/users/profile, /api/users/password
- POST /api/rides/estimate, POST /api/rides
- GET /api/rides/active, /api/rides/pending (filtered by vehicle_category), /api/rides/history
- PUT /api/rides/{id}/accept, /api/rides/{id}/status
- POST /api/chat/{ride_id}, GET /api/chat/{ride_id}
- POST /api/ratings
- GET /api/wallet, /api/wallet/transactions, /api/wallet/stats, POST /api/wallet/withdraw
- GET /api/admin/stats, /api/admin/users, /api/admin/rides, /api/admin/drivers/wallets
- POST /api/admin/drivers/{id}/pay, GET /api/admin/payments/history
- POST /api/contact

## Backlog / Future Tasks
- P1: Refactoring backend server.py (>1400 lignes → routes séparées auth, rides, users, admin)
- P2: Chat en temps réel (WebSocket) entre passager et chauffeur
- P2: Notifications push natives (service worker)
- P3: Intégration paiement mobile (Orange Money, Moov Money)
