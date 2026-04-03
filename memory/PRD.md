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
- Tarification par zone adaptée au terrain de Bamako
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
- **Audio**: HTML5 Audio (ride_alert.wav, passenger_alert.wav)

## Pricing (Zone-Based - Bamako)
| Distance | Voiture (TAXI) | Moto (MOTO-TAXI) |
|----------|---------------|-------------------|
| < 2 km | 500 FCFA | 250 FCFA |
| 2-4 km | 1 000 FCFA | 500 FCFA |
| 4-7 km | 1 500 FCFA | 750 FCFA |
| 7-12 km | 2 000 FCFA | 1 000 FCFA |
| > 12 km | 2 500 + 200/km | 1 500 + 100/km |
- Commission plateforme: 15%

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
10. PWA setup
11. Page Contact / À propos
12. Bug fixes: course bloquée, app bloquée après acceptation
13. Notifications sonores (HTML5 Audio - fichiers WAV réels, vibration mobile)
14. Onglet Paiements Admin
15. GPS & Carte OpenStreetMap (Leaflet, react-leaflet, geolocation)
16. Pages de connexion distinctes (Passager vs Chauffeur)
17. Modification mot de passe
18. Barre de recherche de quartiers (Nominatim + quartiers populaires Bamako)
19. Sélecteur Type de Véhicule (Voiture/Moto) dans profil chauffeur
20. Filtrage courses par type de véhicule (backend)
21. **Tarification par zone** adaptée au terrain de Bamako (pas au km linéaire)
22. **Notifications audio refaites** avec fichiers WAV réels (HTML5 Audio) au lieu de Web Audio API synthétique

## Backlog / Future Tasks
- P1: Refactoring backend server.py (>1400 lignes → routes séparées)
- P2: Chat en temps réel (WebSocket)
- P2: Notifications push natives (service worker)
- P3: Intégration paiement mobile (Orange Money, Moov Money)
