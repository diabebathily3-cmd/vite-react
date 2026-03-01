# Groupe BT Alimentaire - PRD

## Énoncé du Problème
Application e-commerce complète pour **Groupe BT Alimentaire**, entreprise de vente de produits alimentaires en gros et détail basée à Bamako, Mali. Permet aux clients d'acheter des produits alimentaires avec livraison et paiement mobile (Orange Money, Wave).

## Date de Création
25 Février 2026

## Dernière Mise à Jour
1er Mars 2026

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
- Paiement mobile Orange Money et Wave

## Architecture
- **Frontend**: React 19 + TailwindCSS
- **Backend**: FastAPI (Python)
- **Base de données**: MongoDB
- **Style**: Design moderne "Vibrant Market" avec couleurs Mali
- **Paiements**: Orange Money + Wave (mode démo)

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
- [x] **Paiement mobile Orange Money** (nouveau)
- [x] **Paiement mobile Wave** (nouveau)
- [x] **Page instructions paiement avec USSD** (nouveau)

### Backend (25/02/2026)
- [x] API CRUD Produits (/api/products)
- [x] API CRUD Commandes (/api/orders)
- [x] API CRUD Contacts (/api/contacts)
- [x] API Dashboard Stats (/api/dashboard/stats)
- [x] Seed data avec 12 produits initiaux
- [x] **API /api/payments/init** - Initialiser paiement mobile (nouveau)
- [x] **API /api/payments/callback** - Webhook paiement (nouveau)
- [x] **API /api/payments/simulate** - Simulation démo (nouveau)
- [x] **API /api/payments/status** - Statut paiement (nouveau)

### Méthodes de Paiement
| Méthode | Statut | Description |
|---------|--------|-------------|
| Cash | ✅ Actif | Paiement à la livraison |
| Orange Money | ✅ Démo | USSD *144*4*1*montant# |
| Wave | ✅ Démo | Via app Wave |

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

## Résultats des Tests (Iteration 2)
- Backend: 100%
- Frontend: 100%
- Intégration: 100%
- Mobile Payments: 100%

## Backlog Priorisé

### P0 (Critique) - Complété ✅
- Catalogue produits
- Panier et commandes
- Dashboard admin
- Paiement mobile Orange Money & Wave

### P1 (Important) - À Faire
- [ ] Authentification admin sécurisée
- [ ] Notifications par SMS/Email pour nouvelles commandes
- [ ] Activation production Orange Money (credentials marchands)
- [ ] Activation production Wave (credentials marchands)

### P2 (Souhaité) - À Faire
- [ ] Historique des commandes client
- [ ] Système de fidélité/réductions
- [ ] QR Code pour paiement Wave
- [ ] Mode hors ligne pour zones à faible connexion

## Configuration Production (À Obtenir)

### Orange Money Mali
```
ORANGE_MONEY_MERCHANT_ID=votre_merchant_id
ORANGE_MONEY_API_KEY=votre_api_key
ORANGE_MONEY_SECRET_KEY=votre_secret_key
ORANGE_MONEY_SANDBOX=false
```

### Wave Mali
```
WAVE_MERCHANT_ID=votre_merchant_id
WAVE_CLIENT_ID=votre_client_id
WAVE_CLIENT_SECRET=votre_client_secret
WAVE_SANDBOX=false
```

## Prochaines Actions
1. Obtenir credentials marchands Orange Money Mali
2. Obtenir credentials marchands Wave
3. Ajouter authentification admin sécurisée
4. Intégrer notifications SMS pour nouvelles commandes

## Contacts
- Téléphone Mali: +223 64 48 75 74
- Téléphone France: 06 14 31 34 34
- Localisation: Bamako, Mali 🇲🇱
