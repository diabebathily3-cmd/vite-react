# MaliRide - PRD (Product Requirements Document)

## Original Problem Statement
Application de taxi type Uber pour le Mali avec toutes les fonctionnalités.

## User Choices
1. **Interfaces**: Passager + Chauffeur + Admin Dashboard
2. **Paiement**: Espèces + Mobile Money
3. **Fonctionnalités**: Chat temps réel, GPS, estimation prix, historique, notation
4. **Authentification**: JWT + Google OAuth

## Architecture
- **Backend**: FastAPI + MongoDB
- **Frontend**: React + TailwindCSS + Shadcn UI
- **Style**: Neo-Brutalist (Swiss High-Contrast)
- **Couleurs**: Primary #FFBE00, Secondary #0A0A0A

## User Personas
1. **Passager**: Réserve courses, suit chauffeur, paie, note
2. **Chauffeur**: Accepte courses, navigue, gère revenus
3. **Admin**: Gère utilisateurs, surveille courses, statistiques

## Core Requirements (Static)
- [x] Système d'authentification (JWT + Google OAuth)
- [x] Interface passager avec réservation
- [x] Interface chauffeur avec acceptation de courses
- [x] Dashboard admin avec statistiques
- [x] Estimation de prix avant course
- [x] Système de notation
- [x] Chat en temps réel
- [x] Historique des courses

## What's Been Implemented (02/04/2026)
- Backend API complet avec tous les endpoints
- Frontend avec 3 interfaces (passager, chauffeur, admin)
- Authentification JWT + Google OAuth
- Estimation de prix basée sur distance
- Système de notation
- Chat entre passager et chauffeur
- Dashboard admin avec stats

## Prioritized Backlog

### P0 (Done)
- [x] MVP fonctionnel

### P1 (Next)
- [ ] Intégration carte réelle (Leaflet/Google Maps)
- [ ] Notifications push
- [ ] Orange Money API integration

### P2
- [ ] Système de promotion/codes promo
- [ ] Support multi-langue
- [ ] Analytics avancées

## Test Credentials
- Admin: admin@maliride.ml / Admin123!

## Next Tasks
1. Intégrer vraies cartes GPS
2. Connecter Orange Money API
3. Ajouter notifications temps réel
