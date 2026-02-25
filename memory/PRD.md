# PROGET ALIMENTATION - PRD

## Énoncé du Problème
Application de gestion de stock et commandes pour PROGET ALIMENTATION, une entreprise de vente de produits alimentaires basée à Bamako, Mali.

## Date de Création
25 Février 2026

## Personas Utilisateurs
1. **Clients** - Acheteurs de produits alimentaires (gros et détail) à Bamako et diaspora malienne
2. **Administrateur** - Gérant de PROGET ALIMENTATION pour gérer stocks, commandes et messages

## Exigences Principales
- Catalogue de produits avec prix en Euro et CFA
- Formulaire de contact/demande de devis
- Prise de commande en ligne
- Contact WhatsApp/appel direct
- Gestion des stocks et prix (admin)
- Interface bilingue Français/Bambara
- Design aux couleurs du Mali (vert/jaune/rouge)

## Architecture
- **Frontend**: React 19 + TailwindCSS
- **Backend**: FastAPI (Python)
- **Base de données**: MongoDB
- **Style**: Design moderne "Vibrant Market" avec couleurs Mali

## Ce Qui a Été Implémenté

### Frontend (25/02/2026)
- [x] Page d'accueil avec hero section et produits vedettes
- [x] Catalogue produits avec filtres par catégorie
- [x] Recherche de produits
- [x] Panier avec gestion des quantités
- [x] Page checkout avec formulaire de commande
- [x] Page contact
- [x] Changement de langue FR/Bambara
- [x] Dashboard admin avec statistiques
- [x] Admin: gestion des produits (stock, prix)
- [x] Admin: gestion des commandes (statuts)
- [x] Admin: gestion des messages
- [x] Boutons WhatsApp et appel direct
- [x] Design responsive mobile

### Backend (25/02/2026)
- [x] API CRUD Produits (/api/products)
- [x] API CRUD Commandes (/api/orders)
- [x] API CRUD Contacts (/api/contacts)
- [x] API Dashboard Stats (/api/dashboard/stats)
- [x] Seed data avec 12 produits initiaux

### Produits Inclus
| Produit | Prix € | Prix CFA |
|---------|--------|----------|
| Riz Royal 25kg | 46€ | 30,000 F |
| Riz Parfumé 25kg | 43€ | 28,000 F |
| Riz Gambiyaga 25kg | 34€ | 21,000 F |
| Sucre 50kg | 39€ | 25,000 F |
| Mil 50kg | 23€ | 15,000 F |
| Mixwell Lait 25kg | 92€ | 60,000 F |
| Mixwell Lait 12kg | 46€ | 30,000 F |
| Mixwell Lait 5kg | 22€ | 14,000 F |
| Huile 20L | 32€ | 21,000 F |
| Huile 5L | 11€ | 7,000 F |
| Pasta Douma 5kg | 16€ | 11,000 F |
| Malo Wousu 25kg | 31€ | 20,000 F |

## Résultats des Tests
- Backend: 100%
- Frontend: 95%
- Intégration: 100%

## Backlog Priorisé

### P0 (Critique) - Complété ✅
- Catalogue produits
- Panier et commandes
- Dashboard admin

### P1 (Important) - À Faire
- [ ] Authentification admin sécurisée
- [ ] Notifications par SMS/Email pour nouvelles commandes
- [ ] Export des commandes en PDF/Excel

### P2 (Souhaité) - À Faire
- [ ] Historique des commandes client
- [ ] Système de fidélité/réductions
- [ ] Intégration paiement mobile (Orange Money, Wave)
- [ ] Mode hors ligne pour zones à faible connexion

## Prochaines Actions
1. Ajouter authentification admin
2. Intégrer notifications SMS via Twilio pour nouvelles commandes
3. Ajouter paiement mobile Mali (Orange Money/Wave)

## Contacts
- Téléphone Mali: +223 64 48 75 74
- Téléphone France: 06 14 31 34 34
- Localisation: Bamako, Mali 🇲🇱
