# SIRA TAXI - Product Requirements Document

## Original Problem Statement
Application de transport (ride-hailing) comme Uber pour les taxis au Mali avec toutes les fonctionnalités. Rebaptisée "SIRA TAXI".

## User Personas
- **Passager**: Réserve des courses, suit en temps réel, paye en espèces ou Mobile Money
- **Chauffeur**: Accepte des courses, gère son portefeuille, consulte ses gains
- **Admin**: Gère les utilisateurs, suit les courses, consulte les revenus et commissions de la plateforme

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
1. Full-stack scaffolding (Auth, Users, Rides, Admin)
2. MOTO-TAXI vehicle option & zone-based pricing logic
3. PWA setup with icons and service worker
4. Page Contact / À propos
5. Bug fixes: course bloquée, app bloquée, infinite loops
6. Notifications sonores (HTML5 Audio WAV, vibration mobile)
7. Onglet Paiements Admin
8. GPS & Carte OpenStreetMap (Leaflet, react-leaflet, geolocation)
9. Pages de connexion distinctes (Passager vs Chauffeur)
10. Modification mot de passe
11. Barre de recherche de quartiers (Nominatim + quartiers populaires Bamako)
12. Sélecteur Type de Véhicule (Voiture/Moto) + filtrage backend
13. Tarification par zone adaptée au terrain de Bamako
14. Profil Chauffeur en thème sombre (dark mode complet)
15. Profil Passager en thème clair
16. **REFONTE COMPLÈTE Dashboard Chauffeur style Uber Driver** :
    - Navigation en bas avec 4 onglets (Accueil, Revenus, Messages, Menu)
    - Accueil: titre statut + carte GPS + "Passez en ligne" + courses en attente
    - Revenus: carte solde noir + stats (Aujourd'hui/Semaine/Mois/Courses) + historique transactions + retrait
    - Messages: notifications courses + activité récente
    - Menu: profil (photo/nom/note), actions rapides (Aide/Sécurité/Paramètres), sections Gérer/Argent/Ressources, déconnexion
    - Modal véhicule avec sélecteur Voiture/Moto
    - Chat intégré pendant course active
    - Gestion complète des courses (Accepter → Arrivé → Démarrer → Terminer)

## Backlog / Future Tasks
- P1: Refactoring backend server.py (>1400 lignes → routes séparées)
- P2: Chat en temps réel (WebSocket)
- P2: Notifications push natives (service worker)
- P3: Intégration paiement mobile (Orange Money, Moov Money)
