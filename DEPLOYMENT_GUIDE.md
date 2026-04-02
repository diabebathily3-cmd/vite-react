# Guide de Déploiement SIRA TAXI avec Domaine Personnalisé

## 1. Acheter un Domaine

### Option A: Domaine .ML GRATUIT (Recommandé pour Mali)
1. Allez sur **https://www.freenom.com**
2. Recherchez `sirataxi.ml`
3. Cliquez "Get it now" (gratuit pour 12 mois)
4. Créez un compte et confirmez

### Option B: Domaine .COM (Professionnel)
- **Namecheap**: https://namecheap.com (~$10/an)
- **GoDaddy**: https://godaddy.com (~$12/an)
- **OVH**: https://ovh.com (~€10/an)

Domaines suggérés:
- `sirataxi.ml` (gratuit)
- `sirataxi.com`
- `sira-taxi.com`
- `sirataxibamako.com`

---

## 2. Déployer sur Emergent

### Coût: 50 crédits/mois

### Étapes:
1. Cliquez sur **"Deploy"** dans l'interface Emergent
2. Attendez que le déploiement soit terminé
3. Vous recevrez une URL de production

---

## 3. Connecter le Domaine

### Configuration DNS
Ajoutez ces enregistrements dans votre registraire:

| Type | Nom | Valeur |
|------|-----|--------|
| A | @ | (IP fournie par Emergent) |
| CNAME | www | (URL fournie par Emergent) |

### Via Entri (Automatique)
Emergent utilise Entri pour configurer automatiquement les DNS.
1. Cliquez sur "Connect Domain" dans Emergent
2. Entrez votre domaine (ex: sirataxi.ml)
3. Suivez les instructions Entri

---

## 4. Informations de l'Application

### URLs Actuelles
- Preview: https://uber-mali-drive.preview.emergentagent.com
- API: https://uber-mali-drive.preview.emergentagent.com/api

### Identifiants Admin
- Email: `admin@sirataxi.ml`
- Password: `Admin123!`

### Stack Technique
- Frontend: React + TailwindCSS
- Backend: FastAPI + MongoDB
- Auth: JWT + Google OAuth

### Fonctionnalités
- ✅ Interface Passager (réservation, suivi, chat)
- ✅ Interface Chauffeur (acceptation, navigation, revenus)
- ✅ Dashboard Admin (stats, gestion)
- ✅ Portefeuille Chauffeur (solde, retraits)
- ✅ Portefeuille Plateforme (commissions 15%)
- ✅ Paiement espèces + Mobile Money
- ✅ Système de notation

---

## 5. Checklist Pré-Déploiement

- [x] Application fonctionnelle
- [x] Variables d'environnement configurées
- [x] Pas de valeurs hardcodées
- [x] API optimisée (queries batch)
- [x] Admin seeded
- [x] CORS configuré
- [x] Auth redirect URLs dynamiques

---

## Support
Pour toute question sur le déploiement, contactez le support Emergent.
