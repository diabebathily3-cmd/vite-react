import { useState, useEffect, createContext, useContext, useRef, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  ShoppingCart, Phone, MessageCircle, Package, ChevronRight, 
  Menu, X, Plus, Minus, Trash2, Send, MapPin, Clock, Truck,
  LayoutDashboard, PackageSearch, ClipboardList, Mail, LogOut,
  Edit, Check, AlertCircle, TrendingUp, Users, Star, Filter,
  RefreshCw, Smartphone, Banknote, CreditCard, Wallet, Bell, Volume2,
  Store, Receipt
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Translations
const translations = {
  fr: {
    brand: "Groupe BT Alimentaire",
    tagline: "Qualité - Bons prix - Disponibilité immédiate",
    home: "Accueil",
    products: "Produits",
    contact: "Contact",
    admin: "Admin",
    cart: "Panier",
    addToCart: "Ajouter au panier",
    orderNow: "Commander maintenant",
    viewDetails: "Voir détails",
    wholesale: "Vente en gros & détail",
    delivery: "Livraison possible",
    privateContact: "Contact en privé",
    callUs: "Appelez-nous",
    whatsapp: "WhatsApp",
    location: "À Bamako",
    allCategories: "Toutes catégories",
    rice: "Riz",
    milk: "Lait",
    oil: "Huile",
    sugar: "Sucre",
    cereals: "Céréales",
    pasta: "Pâtes",
    others: "Autres",
    promo: "PROMO",
    inStock: "En stock",
    outOfStock: "Rupture",
    lowStock: "Stock bas",
    yourCart: "Votre panier",
    emptyCart: "Votre panier est vide",
    total: "Total",
    checkout: "Passer commande",
    continueShopping: "Continuer les achats",
    name: "Nom",
    phone: "Téléphone",
    email: "Email",
    address: "Adresse",
    message: "Message",
    subject: "Sujet",
    send: "Envoyer",
    orderPlaced: "Commande envoyée !",
    messageSent: "Message envoyé !",
    dashboard: "Tableau de bord",
    manageProducts: "Gérer produits",
    manageOrders: "Gérer commandes",
    messages: "Messages",
    totalProducts: "Produits",
    totalOrders: "Commandes",
    pendingOrders: "En attente",
    revenue: "Revenus",
    notes: "Notes",
    status: "Statut",
    actions: "Actions",
    pending: "En attente",
    confirmed: "Confirmée",
    processing: "En cours",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
    save: "Sauvegarder",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    quantity: "Quantité",
    price: "Prix",
    weight: "Poids",
    category: "Catégorie",
    description: "Description",
    available: "Disponible",
    promotion: "Promotion",
    stock: "Stock",
    addProduct: "Ajouter produit",
    heroTitle: "Produits Alimentaires de Qualité",
    heroSubtitle: "Direct de Bamako vers votre table",
    discoverProducts: "Découvrir nos produits",
    featuredProducts: "Produits Vedettes",
    wholesaleNote: "Prix spéciaux pour commandes en gros",
    orderSuccess: "Votre commande a été enregistrée avec succès !",
    contactSuccess: "Votre message a été envoyé avec succès !",
    searchProducts: "Rechercher un produit...",
    paymentMethod: "Méthode de paiement",
    cash: "Paiement à la livraison",
    orangeMoney: "Orange Money",
    wave: "Wave",
    payNow: "Payer maintenant",
    awaitingPayment: "En attente de paiement",
    paid: "Payé",
    paymentInstructions: "Instructions de paiement",
    simulatePayment: "Simuler le paiement (démo)",
    paymentSuccess: "Paiement effectué avec succès !",
    selectPayment: "Choisissez votre mode de paiement"
  },
  bm: {
    brand: "Groupe BT Alimentaire",
    tagline: "Ɲumanya - Sɔngɔ ɲuman - A bɛ sɔrɔ yɔrɔnin na",
    home: "So",
    products: "Fɛnw",
    contact: "Bɛn",
    admin: "Admin",
    cart: "Panyɛ",
    addToCart: "A fara panyɛ kan",
    orderNow: "A san sisan",
    viewDetails: "A lajɛ kosɛbɛ",
    wholesale: "Feere caman ni fitinin",
    delivery: "A bɛ se ka bila",
    privateContact: "Bɛn gundo la",
    callUs: "An wele",
    whatsapp: "WhatsApp",
    location: "Bamakɔ",
    allCategories: "Sugu bɛɛ",
    rice: "Malo",
    milk: "Nɔnɔ",
    oil: "Tulu",
    sugar: "Sukaro",
    cereals: "Ɲɔ",
    pasta: "Makaroni",
    others: "Tɔw",
    promo: "PROMO",
    inStock: "A bɛ yen",
    outOfStock: "A banna",
    lowStock: "A ka dɔɔnin",
    yourCart: "I ka panyɛ",
    emptyCart: "I ka panyɛ lankolon don",
    total: "Bɛɛ lajɛlen",
    checkout: "San",
    continueShopping: "Taa ɲini tɔ la",
    name: "Tɔgɔ",
    phone: "Telefɔni",
    email: "Imɛli",
    address: "Sigiyɔrɔ",
    message: "Ci",
    subject: "Kuma",
    send: "A ci",
    orderPlaced: "San cilen !",
    messageSent: "Ci cilen !",
    dashboard: "Jatebla",
    manageProducts: "Fɛnw kunbɛn",
    manageOrders: "Sanw kunbɛn",
    messages: "Ciw",
    totalProducts: "Fɛnw",
    totalOrders: "Sanw",
    pendingOrders: "Min bɛ kɔnɔ",
    revenue: "Wari",
    notes: "Sɛbɛn",
    status: "Cogoya",
    actions: "Baara",
    pending: "A bɛ kɔnɔ",
    confirmed: "A sabatilen",
    processing: "A bɛ kɛ",
    shipped: "A cilɛ",
    delivered: "A sera",
    cancelled: "A dabɔra",
    save: "A mara",
    cancel: "A dabɔ",
    delete: "A bɔ",
    edit: "A Changé",
    quantity: "Hakɛ",
    price: "Sɔngɔ",
    weight: "Girinya",
    category: "Sugu",
    description: "Ɲɛfɔli",
    available: "A bɛ sɔrɔ",
    promotion: "Promo",
    stock: "Marayɔrɔ",
    addProduct: "Fɛn kura fara",
    heroTitle: "Dumuni Fɛn Ɲumanw",
    heroSubtitle: "Ka bɔ Bamakɔ ka na i ka tabali kan",
    discoverProducts: "An ka fɛnw lajɛ",
    featuredProducts: "Fɛn Ɲumanw",
    wholesaleNote: "Sɔngɔ kɛrɛnkɛrɛnnen san caman ye",
    orderSuccess: "I ka san sɛbɛnnen don kojugu !",
    contactSuccess: "I ka ci cilen don kojugu !",
    searchProducts: "Fɛn ɲini...",
    paymentMethod: "Sara cogoya",
    cash: "Sara bila waati",
    orangeMoney: "Orange Money",
    wave: "Wave",
    payNow: "Sara sisan",
    awaitingPayment: "Sara bɛ kɔnɔ",
    paid: "A saralen",
    paymentInstructions: "Sara ɲɛfɔli",
    simulatePayment: "Sara kɛcogo lajɛ",
    paymentSuccess: "Sara kɛra kojugu !",
    selectPayment: "I ka sara cogoya sugandi"
  }
};

// Language Context
const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('fr');
  const t = (key) => translations[lang][key] || key;
  
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Cart Context
const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalEuro = cart.reduce((sum, item) => sum + (item.price_euro * item.quantity), 0);
  const totalCfa = cart.reduce((sum, item) => sum + (item.price_cfa * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      totalItems, totalEuro, totalCfa, isCartOpen, setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Header Component
const Header = () => {
  const { t, lang, setLang } = useLanguage();
  const { totalItems, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: t('home') },
    { path: '/products', label: t('products') },
    { path: '/contact', label: t('contact') },
  ];

  return (
    <>
      <div className="mali-flag-strip"></div>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
              <div className="w-10 h-10 rounded-full green-gradient flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg text-stone-900 hidden sm:block">{t('brand')}</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link 
                  key={link.path}
                  to={link.path}
                  data-testid={`nav-${link.path.replace('/', '') || 'home'}`}
                  className={`font-medium transition-colors ${
                    location.pathname === link.path 
                      ? 'text-[#14B53A]' 
                      : 'text-stone-600 hover:text-[#14B53A]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link 
                to="/admin"
                data-testid="nav-admin"
                className="text-stone-600 hover:text-[#14B53A] font-medium"
              >
                {t('admin')}
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-stone-100 rounded-full p-1">
                <button 
                  onClick={() => setLang('fr')}
                  data-testid="lang-fr"
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    lang === 'fr' ? 'bg-[#14B53A] text-white' : 'text-stone-600'
                  }`}
                >
                  FR
                </button>
                <button 
                  onClick={() => setLang('bm')}
                  data-testid="lang-bm"
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    lang === 'bm' ? 'bg-[#14B53A] text-white' : 'text-stone-600'
                  }`}
                >
                  BM
                </button>
              </div>

              {/* Cart Button */}
              <button 
                onClick={() => setIsCartOpen(true)}
                data-testid="cart-button"
                className="relative p-2 rounded-full hover:bg-stone-100 transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-stone-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#CE1126] text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="mobile-menu-btn"
                className="md:hidden p-2 rounded-full hover:bg-stone-100"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-stone-100 bg-white animate-fade-in-up">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map(link => (
                <Link 
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg hover:bg-stone-50 font-medium text-stone-700"
                >
                  {link.label}
                </Link>
              ))}
              <Link 
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg hover:bg-stone-50 font-medium text-stone-700"
              >
                {t('admin')}
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

// Cart Sidebar
const CartSidebar = () => {
  const { t } = useLanguage();
  const { cart, isCartOpen, setIsCartOpen, totalEuro, totalCfa, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)}></div>
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl animate-slide-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold">{t('yourCart')}</h2>
            <button onClick={() => setIsCartOpen(false)} data-testid="close-cart" className="p-2 hover:bg-stone-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-stone-500">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>{t('emptyCart')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 p-3 bg-stone-50 rounded-xl" data-testid={`cart-item-${item.id}`}>
                    <img 
                      src={item.image_url || 'https://via.placeholder.com/80'} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-stone-900">{item.name}</h4>
                      <p className="text-sm text-stone-500">{item.weight}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="price-euro">{item.price_euro}€</span>
                        <span className="text-stone-400">/</span>
                        <span className="price-cfa text-sm">{item.price_cfa.toLocaleString()} F</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        data-testid={`remove-${item.id}`}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 bg-white rounded-full border px-2">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          data-testid={`decrease-${item.id}`}
                          className="p-1"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          data-testid={`increase-${item.id}`}
                          className="p-1"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-4 border-t bg-stone-50">
              <div className="flex justify-between mb-4">
                <span className="font-semibold text-lg">{t('total')}:</span>
                <div className="text-right">
                  <div className="price-euro text-xl">{totalEuro.toFixed(2)}€</div>
                  <div className="price-cfa text-sm">{totalCfa.toLocaleString()} F CFA</div>
                </div>
              </div>
              <button 
                onClick={() => { setIsCartOpen(false); navigate('/checkout'); }}
                data-testid="checkout-btn"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {t('checkout')} <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Products that require phone order
const PHONE_ORDER_PRODUCTS = ['Poulet', 'Poissons', 'Viande (Petit tas)', 'Viande (Grand tas)'];
const PHONE_ORDER_NUMBER = '+33 7 45 90 21 34';

// Product Card
const ProductCard = ({ product, onAddToCart }) => {
  const { t, lang } = useLanguage();
  const name = lang === 'bm' && product.name_bambara ? product.name_bambara : product.name;
  const requiresPhoneOrder = PHONE_ORDER_PRODUCTS.includes(product.name);

  return (
    <div className="product-card" data-testid={`product-card-${product.id}`}>
      <div className="relative">
        <img 
          src={product.image_url || 'https://via.placeholder.com/300'} 
          alt={name}
          className="w-full h-48 object-cover"
        />
        {product.is_promotion && (
          <div className="absolute top-3 left-3 fire-badge">
            <span>{t('promo')}</span>
          </div>
        )}
        {requiresPhoneOrder && (
          <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Phone className="w-3 h-3" /> Sur commande
          </div>
        )}
        {!requiresPhoneOrder && product.stock_quantity < 10 && product.stock_quantity > 0 && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {t('lowStock')}
          </div>
        )}
        {!requiresPhoneOrder && product.stock_quantity === 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {t('outOfStock')}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-stone-900 mb-1">{name}</h3>
        <p className="text-sm text-stone-500 mb-3">{product.weight}</p>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="price-euro text-xl">{product.price_euro}€</span>
            <span className="text-stone-400 mx-2">/</span>
            <span className="price-cfa">{product.price_cfa.toLocaleString()} F</span>
          </div>
        </div>
        
        {requiresPhoneOrder ? (
          <a 
            href={`tel:${PHONE_ORDER_NUMBER.replace(/\s/g, '')}`}
            data-testid={`phone-order-${product.id}`}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-2 font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Phone className="w-5 h-5" />
            Appeler pour commander
          </a>
        ) : (
          <button 
            onClick={() => onAddToCart(product)}
            disabled={product.stock_quantity === 0}
            data-testid={`add-to-cart-${product.id}`}
            className={`w-full rounded-full py-2 font-semibold flex items-center justify-center gap-2 transition-all ${
              product.stock_quantity === 0 
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            <Plus className="w-5 h-5" />
            {t('addToCart')}
          </button>
        )}
        
        {requiresPhoneOrder && (
          <p className="text-xs text-center text-blue-600 mt-2 font-medium">
            📞 {PHONE_ORDER_NUMBER}
          </p>
        )}
      </div>
    </div>
  );
};

// Home Page
const HomePage = () => {
  const { t, lang } = useLanguage();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API}/products?promotion_only=true`);
        setProducts(res.data.slice(0, 6));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section className="relative fire-gradient-soft overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 leading-tight mb-6">
                {t('heroTitle')}
              </h1>
              <p className="text-xl text-stone-600 mb-8">{t('heroSubtitle')}</p>
              <p className="text-stone-500 mb-8 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#14B53A]" />
                {t('location')} 🇲🇱
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" data-testid="discover-products-btn" className="btn-primary flex items-center gap-2">
                  {t('discoverProducts')} <ChevronRight className="w-5 h-5" />
                </Link>
                <a 
                  href="https://wa.me/22364487574" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  data-testid="whatsapp-btn"
                  className="whatsapp-btn"
                >
                  <MessageCircle className="w-5 h-5" /> WhatsApp
                </a>
              </div>
            </div>
            <div className="hidden md:block relative">
              <img 
                src="https://images.unsplash.com/photo-1719532520316-4cc0d8886ab7?crop=entropy&cs=srgb&fm=jpg&q=85" 
                alt="Groceries" 
                className="rounded-3xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Star, label: t('tagline').split(' - ')[0], color: 'text-[#FCD116]' },
              { icon: TrendingUp, label: t('tagline').split(' - ')[1], color: 'text-[#14B53A]' },
              { icon: Clock, label: t('tagline').split(' - ')[2], color: 'text-[#CE1126]' },
              { icon: Truck, label: t('delivery'), color: 'text-blue-500' }
            ].map((feature, idx) => (
              <div key={idx} className="text-center p-4">
                <feature.icon className={`w-8 h-8 mx-auto mb-2 ${feature.color}`} />
                <p className="font-medium text-stone-700 text-sm">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-stone-900 mb-4">{t('featuredProducts')}</h2>
            <p className="text-stone-500">{t('wholesaleNote')}</p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#14B53A] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/products" data-testid="view-all-products" className="btn-secondary inline-flex items-center gap-2">
              {t('products')} <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 green-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">{t('contact')}</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="tel:+22364487574" data-testid="phone-btn" className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-full flex items-center gap-2 transition-colors">
              <Phone className="w-5 h-5" /> +223 64 48 75 74
            </a>
            <a href="tel:+33745902134" className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-full flex items-center gap-2 transition-colors">
              <Phone className="w-5 h-5" /> +33 7 45 90 21 34
            </a>
            <a href="tel:0614313434" className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-full flex items-center gap-2 transition-colors">
              <Phone className="w-5 h-5" /> 06 14 31 34 34
            </a>
            <a href="https://wa.me/22364487574" target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
              <MessageCircle className="w-5 h-5" /> WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

// Products Page
const ProductsPage = () => {
  const { t, lang } = useLanguage();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { value: null, label: t('allCategories') },
    { value: 'riz', label: t('rice') },
    { value: 'lait', label: t('milk') },
    { value: 'huile', label: t('oil') },
    { value: 'sucre', label: t('sugar') },
    { value: 'cereales', label: t('cereals') },
    { value: 'pates', label: t('pasta') },
    { value: 'autres', label: t('others') }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = `${API}/products`;
        if (selectedCategory) {
          url += `?category=${selectedCategory}`;
        }
        const res = await axios.get(url);
        setProducts(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  const filteredProducts = products.filter(p => {
    const name = lang === 'bm' && p.name_bambara ? p.name_bambara : p.name;
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-stone-50 py-8" data-testid="products-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-stone-900 mb-8">{t('products')}</h1>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchProducts')}
                data-testid="search-input"
                className="w-full px-4 py-3 rounded-full border border-stone-200 focus:border-[#14B53A] focus:ring-2 focus:ring-[#14B53A]/20 outline-none transition-all"
              />
            </div>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value || 'all'}
                  onClick={() => setSelectedCategory(cat.value)}
                  data-testid={`category-${cat.value || 'all'}`}
                  className={`category-pill ${selectedCategory === cat.value ? 'active' : ''}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#14B53A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            <PackageSearch className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Contact Page
const ContactPage = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/contacts`, form);
      setSuccess(true);
      setForm({ name: '', phone: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8" data-testid="contact-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-stone-900 mb-8 text-center">{t('contact')}</h1>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <a href="tel:+22364487574" className="bg-white p-6 rounded-2xl shadow-sm text-center hover:shadow-md transition-shadow">
            <Phone className="w-8 h-8 text-[#14B53A] mx-auto mb-2" />
            <p className="font-semibold">+223 64 48 75 74</p>
            <p className="text-xs text-stone-500">Mali</p>
          </a>
          <a href="tel:+33745902134" className="bg-white p-6 rounded-2xl shadow-sm text-center hover:shadow-md transition-shadow">
            <Phone className="w-8 h-8 text-[#14B53A] mx-auto mb-2" />
            <p className="font-semibold">+33 7 45 90 21 34</p>
            <p className="text-xs text-stone-500">France</p>
          </a>
          <a href="tel:0614313434" className="bg-white p-6 rounded-2xl shadow-sm text-center hover:shadow-md transition-shadow">
            <Phone className="w-8 h-8 text-[#14B53A] mx-auto mb-2" />
            <p className="font-semibold">06 14 31 34 34</p>
            <p className="text-xs text-stone-500">France</p>
          </a>
          <a href="https://wa.me/22364487574" target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-2xl shadow-sm text-center hover:shadow-md transition-shadow">
            <MessageCircle className="w-8 h-8 text-[#25D366] mx-auto mb-2" />
            <p className="font-semibold">WhatsApp</p>
            <p className="text-xs text-stone-500">Chat direct</p>
          </a>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-2">
              <Check className="w-5 h-5" />
              {t('contactSuccess')}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">{t('name')} *</label>
                <input 
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  required
                  data-testid="contact-name"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#14B53A] focus:ring-2 focus:ring-[#14B53A]/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">{t('phone')} *</label>
                <input 
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  required
                  data-testid="contact-phone"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#14B53A] focus:ring-2 focus:ring-[#14B53A]/20 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">{t('email')}</label>
              <input 
                type="email"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                data-testid="contact-email"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#14B53A] focus:ring-2 focus:ring-[#14B53A]/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">{t('subject')} *</label>
              <input 
                type="text"
                value={form.subject}
                onChange={(e) => setForm({...form, subject: e.target.value})}
                required
                data-testid="contact-subject"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#14B53A] focus:ring-2 focus:ring-[#14B53A]/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">{t('message')} *</label>
              <textarea 
                value={form.message}
                onChange={(e) => setForm({...form, message: e.target.value})}
                required
                rows={5}
                data-testid="contact-message"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#14B53A] focus:ring-2 focus:ring-[#14B53A]/20 outline-none resize-none"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              data-testid="contact-submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" /> {t('send')}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Checkout Page
const CheckoutPage = () => {
  const { t, lang } = useLanguage();
  const { cart, totalEuro, totalCfa, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: info, 2: payment, 3: confirmation
  const [form, setForm] = useState({ 
    customer_name: '', 
    customer_phone: '', 
    customer_email: '', 
    customer_address: '', 
    notes: '',
    is_wholesale: false,
    payment_method: 'cash'
  });
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const handleSubmitInfo = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const orderData = {
        ...form,
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price_euro: item.price_euro,
          price_cfa: item.price_cfa
        }))
      };
      const res = await axios.post(`${API}/orders`, orderData);
      setOrderId(res.data.id);
      
      if (form.payment_method === 'cash' || form.payment_method === 'in_store') {
        // Direct to success for cash payment or in-store pickup
        clearCart();
        setStep(3);
      } else {
        // Initialize mobile payment
        const paymentRes = await axios.post(`${API}/payments/init`, {
          order_id: res.data.id,
          payment_method: form.payment_method,
          phone_number: form.customer_phone
        });
        setPaymentData(paymentRes.data);
        setStep(2);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const simulatePayment = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      await axios.post(`${API}/payments/simulate/${orderId}`);
      setPaymentStatus('success');
      clearCart();
      setTimeout(() => setStep(3), 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!orderId) return;
    try {
      const res = await axios.get(`${API}/payments/status/${orderId}`);
      if (res.data.payment_status === 'success') {
        setPaymentStatus('success');
        clearCart();
        setTimeout(() => setStep(3), 1500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Step 3: Success
  if (step === 3) {
    // Build detailed order summary for WhatsApp
    const itemsList = cart.map(item => `• ${item.quantity}x ${item.name} (${item.price_euro}€)`).join('\n');
    const orderSummary = `🛒 *NOUVELLE COMMANDE*\n\n👤 *Client:* ${form.customer_name}\n📞 *Tél:* ${form.customer_phone}\n📍 *Adresse:* ${form.customer_address}\n\n*Articles:*\n${itemsList}\n\n💰 *Total:* ${totalEuro.toFixed(2)}€ / ${totalCfa.toLocaleString()} F CFA\n💳 *Paiement:* ${form.payment_method === 'cash' ? 'À la livraison' : form.payment_method === 'orange_money' ? 'Orange Money' : form.payment_method === 'wave' ? 'Wave' : 'Retrait en magasin'}`;
    const whatsappLink = `https://wa.me/33614313434?text=${encodeURIComponent(orderSummary)}`;
    
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4" data-testid="order-success">
        <div className="bg-white rounded-3xl p-8 text-center max-w-md shadow-lg animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-[#14B53A]" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">{t('orderPlaced')}</h2>
          <p className="text-stone-600 mb-2">{t('orderSuccess')}</p>
          {form.payment_method !== 'cash' && (
            <p className="text-[#14B53A] font-semibold mb-4">{t('paymentSuccess')}</p>
          )}
          
          {/* Notification Info */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm text-green-800 font-medium">
                Notification envoyée !
              </p>
            </div>
            <p className="text-xs text-green-600">
              L'équipe Groupe BT a reçu votre commande et vous contactera bientôt.
            </p>
          </div>

          {/* WhatsApp confirmation button - more prominent */}
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="whatsapp-confirm-btn"
            className="w-full whatsapp-btn justify-center mb-4 py-4 text-lg"
          >
            <MessageCircle className="w-6 h-6" />
            Envoyer via WhatsApp
          </a>
          <p className="text-xs text-stone-400 mb-4">
            Cliquez pour confirmer votre commande par WhatsApp
          </p>
          
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            {t('continueShopping')} <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && step === 1) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-stone-900 mb-4">{t('emptyCart')}</h2>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            {t('continueShopping')} <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  // Step 2: Payment
  if (step === 2 && paymentData) {
    return (
      <div className="min-h-screen bg-stone-50 py-8" data-testid="payment-page">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-stone-900 mb-8 text-center">{t('paymentInstructions')}</h1>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            {/* Payment Provider Logo */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {paymentData.provider === 'orange_money' ? (
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-black text-2xl">OM</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-500">Orange Money</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-[#1DC9FF] rounded-2xl flex items-center justify-center">
                    <span className="text-white font-black text-2xl">W</span>
                  </div>
                  <span className="text-2xl font-bold text-[#1DC9FF]">Wave</span>
                </div>
              )}
            </div>

            {/* Amount */}
            <div className="text-center mb-6 p-4 bg-stone-50 rounded-xl">
              <p className="text-stone-500 text-sm mb-1">{t('total')}</p>
              <p className="text-4xl font-black text-stone-900">{paymentData.amount.toLocaleString()} F CFA</p>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-stone-700 leading-relaxed">
                {paymentData.instructions[lang === 'bm' ? 'bm' : 'fr']}
              </p>
            </div>

            {/* USSD Code for Orange Money */}
            {paymentData.provider === 'orange_money' && (
              <div className="bg-orange-100 rounded-xl p-4 mb-6 text-center">
                <p className="text-sm text-orange-700 mb-2">Envoyez le paiement à ce numéro :</p>
                <p className="text-2xl font-mono font-bold text-orange-600">+223 75 31 98 92</p>
                <p className="text-xs text-orange-500 mt-2">Groupe BT Alimentaire</p>
              </div>
            )}

            {/* Wave number */}
            {paymentData.provider === 'wave' && (
              <div className="bg-cyan-100 rounded-xl p-4 mb-6 text-center">
                <p className="text-sm text-cyan-700 mb-2">Envoyez le paiement à ce numéro :</p>
                <p className="text-2xl font-mono font-bold text-cyan-600">+223 75 31 98 92</p>
                <p className="text-xs text-cyan-500 mt-2">Groupe BT Alimentaire</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {paymentStatus === 'success' ? (
                <div className="bg-green-100 text-green-700 p-4 rounded-xl flex items-center justify-center gap-2">
                  <Check className="w-6 h-6" />
                  <span className="font-semibold">{t('paymentSuccess')}</span>
                </div>
              ) : (
                <>
                  <button 
                    onClick={checkPaymentStatus}
                    data-testid="check-payment-btn"
                    className="w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 rounded-xl font-semibold text-stone-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" /> Vérifier le paiement
                  </button>
                  
                  {/* Demo: Simulate Payment Button */}
                  <button 
                    onClick={simulatePayment}
                    disabled={loading}
                    data-testid="simulate-payment-btn"
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      paymentData.provider === 'orange_money' 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-[#1DC9FF] hover:bg-[#15B5E8] text-white'
                    }`}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Smartphone className="w-5 h-5" /> {t('simulatePayment')}
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Note */}
            <p className="text-xs text-stone-400 text-center mt-4">
              Mode démo - En production, le paiement sera validé automatiquement
            </p>
          </div>

          {/* Back Button */}
          <button 
            onClick={() => setStep(1)}
            className="w-full py-3 text-stone-500 hover:text-stone-700 transition-colors"
          >
            ← Retour aux informations
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Information Form
  return (
    <div className="min-h-screen bg-stone-50 py-8" data-testid="checkout-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-stone-900 mb-8">{t('checkout')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Informations de livraison</h2>
            <form onSubmit={handleSubmitInfo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">{t('name')} *</label>
                <input 
                  type="text"
                  value={form.customer_name}
                  onChange={(e) => setForm({...form, customer_name: e.target.value})}
                  required
                  data-testid="checkout-name"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#14B53A] focus:ring-2 focus:ring-[#14B53A]/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">{t('phone')} *</label>
                <input 
                  type="tel"
                  value={form.customer_phone}
                  onChange={(e) => setForm({...form, customer_phone: e.target.value})}
                  required
                  data-testid="checkout-phone"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#14B53A] focus:ring-2 focus:ring-[#14B53A]/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">{t('email')}</label>
                <input 
                  type="email"
                  value={form.customer_email}
                  onChange={(e) => setForm({...form, customer_email: e.target.value})}
                  data-testid="checkout-email"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#14B53A] focus:ring-2 focus:ring-[#14B53A]/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">{t('address')} *</label>
                <textarea 
                  value={form.customer_address}
                  onChange={(e) => setForm({...form, customer_address: e.target.value})}
                  required
                  rows={3}
                  data-testid="checkout-address"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#14B53A] focus:ring-2 focus:ring-[#14B53A]/20 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">{t('notes')}</label>
                <textarea 
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  rows={2}
                  data-testid="checkout-notes"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#14B53A] focus:ring-2 focus:ring-[#14B53A]/20 outline-none resize-none"
                />
              </div>
              
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">{t('paymentMethod')} *</label>
                <div className="space-y-3">
                  {/* Cash */}
                  <label 
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.payment_method === 'cash' 
                        ? 'border-[#14B53A] bg-green-50' 
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <input 
                      type="radio"
                      name="payment_method"
                      value="cash"
                      checked={form.payment_method === 'cash'}
                      onChange={(e) => setForm({...form, payment_method: e.target.value})}
                      data-testid="payment-cash"
                      className="w-5 h-5 text-[#14B53A] focus:ring-[#14B53A]"
                    />
                    <div className="w-12 h-12 bg-stone-200 rounded-xl flex items-center justify-center">
                      <Banknote className="w-6 h-6 text-stone-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-stone-900">{t('cash')}</p>
                      <p className="text-sm text-stone-500">Payer à la réception</p>
                    </div>
                  </label>

                  {/* France Cash Payment Notice */}
                  {form.payment_method === 'cash' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900">🇫🇷 Commandes en France</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Pour payer après la livraison, contactez le :
                        </p>
                        <a 
                          href="tel:0614313434" 
                          className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          06 14 31 34 34
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Orange Money */}
                  <label 
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.payment_method === 'orange_money' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <input 
                      type="radio"
                      name="payment_method"
                      value="orange_money"
                      checked={form.payment_method === 'orange_money'}
                      onChange={(e) => setForm({...form, payment_method: e.target.value})}
                      data-testid="payment-orange"
                      className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                    />
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-black text-lg">OM</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-stone-900">Orange Money</p>
                      <p className="text-sm text-stone-500">Paiement mobile Orange</p>
                    </div>
                  </label>

                  {/* Wave */}
                  <label 
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.payment_method === 'wave' 
                        ? 'border-[#1DC9FF] bg-cyan-50' 
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <input 
                      type="radio"
                      name="payment_method"
                      value="wave"
                      checked={form.payment_method === 'wave'}
                      onChange={(e) => setForm({...form, payment_method: e.target.value})}
                      data-testid="payment-wave"
                      className="w-5 h-5 text-[#1DC9FF] focus:ring-[#1DC9FF]"
                    />
                    <div className="w-12 h-12 bg-[#1DC9FF] rounded-xl flex items-center justify-center">
                      <span className="text-white font-black text-lg">W</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-stone-900">Wave</p>
                      <p className="text-sm text-stone-500">Paiement mobile Wave</p>
                    </div>
                  </label>

                  {/* In-Store Payment Option */}
                  <label 
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.payment_method === 'in_store' 
                        ? 'border-[#14B53A] bg-green-50' 
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <input 
                      type="radio"
                      name="payment_method"
                      value="in_store"
                      checked={form.payment_method === 'in_store'}
                      onChange={(e) => setForm({...form, payment_method: e.target.value})}
                      data-testid="payment-instore"
                      className="w-5 h-5 text-[#14B53A] focus:ring-[#14B53A]"
                    />
                    <div className="w-12 h-12 bg-[#14B53A] rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-stone-900">Retrait en magasin</p>
                      <p className="text-sm text-stone-500">Venez récupérer et payer sur place</p>
                    </div>
                  </label>
                  {form.payment_method === 'in_store' && (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                      <p className="font-semibold text-green-900 mb-2">📍 Adresse du magasin :</p>
                      <p className="text-green-800">Bamako, Mali</p>
                      <p className="text-green-700 text-sm mt-2">📞 +223 75 31 98 92</p>
                      <p className="text-green-600 text-xs mt-2">Ouvert : Lun-Sam 8h-18h</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
                <input 
                  type="checkbox"
                  id="wholesale"
                  checked={form.is_wholesale}
                  onChange={(e) => setForm({...form, is_wholesale: e.target.checked})}
                  data-testid="checkout-wholesale"
                  className="w-5 h-5 rounded border-stone-300 text-[#14B53A] focus:ring-[#14B53A]"
                />
                <label htmlFor="wholesale" className="text-sm font-medium text-stone-700">
                  {t('wholesale')}
                </label>
              </div>

              {/* Order notification info */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Notification de commande</p>
                  <p className="text-sm text-green-700 mt-1">
                    Votre commande sera envoyée au :
                  </p>
                  <p className="font-bold text-green-800 mt-1">📞 06 14 31 34 34</p>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                data-testid="submit-order"
                className="btn-fire w-full flex items-center justify-center gap-2 py-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {form.payment_method === 'cash' ? t('orderNow') : t('payNow')} <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm h-fit">
            <h2 className="text-xl font-bold mb-6">{t('yourCart')}</h2>
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 p-3 bg-stone-50 rounded-xl">
                  <img 
                    src={item.image_url || 'https://via.placeholder.com/60'} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-stone-900">{item.name}</h4>
                    <p className="text-sm text-stone-500">{item.quantity} x {item.price_euro}€</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#14B53A]">{(item.price_euro * item.quantity).toFixed(2)}€</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>{t('total')}</span>
                <div className="text-right">
                  <div className="text-[#14B53A]">{totalEuro.toFixed(2)}€</div>
                  <div className="text-[#CE1126] text-sm">{totalCfa.toLocaleString()} F CFA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = () => {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastNotificationCount = useRef(0);
  const audioRef = useRef(null);
  
  // POS States
  const [posCart, setPosCart] = useState([]);
  const [posPaymentMethod, setPosPaymentMethod] = useState('cash');
  const [posCustomerName, setPosCustomerName] = useState('');
  const [posSales, setPosSales] = useState([]);
  const [posDailySummary, setPosDailySummary] = useState(null);
  const [posLoading, setPosLoading] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    name_bambara: '',
    category: 'riz',
    price_euro: '',
    price_cfa: '',
    weight: '',
    description: '',
    image_url: '',
    stock_quantity: 0,
    is_available: true,
    is_promotion: false
  });

  // Admin credentials (in production, use environment variables)
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'GroupeBT2024!';

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  }, [soundEnabled]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await axios.get(`${API}/notifications?unread_only=true`);
      const newNotifs = res.data;
      
      // Play sound if there are new notifications
      if (newNotifs.length > lastNotificationCount.current && lastNotificationCount.current !== 0) {
        playNotificationSound();
      }
      lastNotificationCount.current = newNotifs.length;
      setNotifications(newNotifs);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  }, [isAuthenticated, playNotificationSound]);

  // Poll for new notifications every 10 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  const markNotificationRead = async (notificationId) => {
    try {
      await axios.put(`${API}/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await axios.put(`${API}/notifications/read-all`);
      fetchNotifications();
      setShowNotifications(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === ADMIN_USERNAME && loginForm.password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError('');
      localStorage.setItem('adminAuth', 'true');
    } else {
      setLoginError('Nom d\'utilisateur ou mot de passe incorrect');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
  };

  // Check if already logged in
  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const categories = [
    { value: 'riz', label: 'Riz' },
    { value: 'lait', label: 'Lait' },
    { value: 'huile', label: 'Huile' },
    { value: 'sucre', label: 'Sucre' },
    { value: 'cereales', label: 'Céréales' },
    { value: 'pates', label: 'Pâtes' },
    { value: 'autres', label: 'Autres' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, productsRes, ordersRes, contactsRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/products`),
        axios.get(`${API}/orders`),
        axios.get(`${API}/contacts`)
      ]);
      setStats(statsRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      setContacts(contactsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API}/orders/${orderId}/status?status=${status}`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const updateProduct = async (productId, data) => {
    try {
      await axios.put(`${API}/products/${productId}`, data);
      setEditingProduct(null);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    try {
      await axios.delete(`${API}/products/${productId}`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const togglePromotion = async (productId, currentStatus) => {
    try {
      await axios.put(`${API}/products/${productId}`, { is_promotion: !currentStatus });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // POS Functions
  const addToPosCart = (product) => {
    const existing = posCart.find(item => item.id === product.id);
    if (existing) {
      setPosCart(posCart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setPosCart([...posCart, { ...product, quantity: 1 }]);
    }
  };

  const updatePosQuantity = (productId, delta) => {
    setPosCart(posCart.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removePosItem = (productId) => {
    setPosCart(posCart.filter(item => item.id !== productId));
  };

  const clearPosCart = () => {
    setPosCart([]);
    setPosCustomerName('');
  };

  const posTotalCfa = posCart.reduce((sum, item) => sum + (item.price_cfa * item.quantity), 0);
  const posTotalEuro = posCart.reduce((sum, item) => sum + (item.price_euro * item.quantity), 0);

  const fetchPosSales = async () => {
    try {
      const [salesRes, summaryRes] = await Promise.all([
        axios.get(`${API}/pos/sales`),
        axios.get(`${API}/pos/daily-summary`)
      ]);
      setPosSales(salesRes.data);
      setPosDailySummary(summaryRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const processPOSSale = async () => {
    if (posCart.length === 0) return;
    
    setPosLoading(true);
    try {
      const saleData = {
        items: posCart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price_euro: item.price_euro,
          price_cfa: item.price_cfa
        })),
        payment_method: posPaymentMethod,
        customer_name: posCustomerName || 'Client magasin'
      };
      
      await axios.post(`${API}/pos/sale`, saleData);
      clearPosCart();
      fetchData(); // Refresh stock
      fetchPosSales(); // Refresh sales
      alert('✅ Vente enregistrée !');
    } catch (e) {
      console.error(e);
      alert('Erreur lors de l\'enregistrement de la vente');
    } finally {
      setPosLoading(false);
    }
  };

  // Fetch POS sales when tab changes to POS
  useEffect(() => {
    if (activeTab === 'pos') {
      fetchPosSales();
    }
  }, [activeTab]);

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/products`, {
        ...newProduct,
        price_euro: parseFloat(newProduct.price_euro),
        price_cfa: parseInt(newProduct.price_cfa),
        stock_quantity: parseInt(newProduct.stock_quantity)
      });
      setShowAddProduct(false);
      setNewProduct({
        name: '',
        name_bambara: '',
        category: 'riz',
        price_euro: '',
        price_cfa: '',
        weight: '',
        description: '',
        image_url: '',
        stock_quantity: 0,
        is_available: true,
        is_promotion: false
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const markContactRead = async (contactId) => {
    try {
      await axios.put(`${API}/contacts/${contactId}/read`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const statusColors = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    processing: 'status-processing',
    shipped: 'status-shipped',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled'
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'pos', icon: Store, label: 'Caisse' },
    { id: 'products', icon: PackageSearch, label: t('manageProducts') },
    { id: 'orders', icon: ClipboardList, label: t('manageOrders') },
    { id: 'contacts', icon: Mail, label: t('messages') }
  ];

  // Login Page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4" data-testid="admin-login">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full green-gradient flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900">Admin - Groupe BT</h1>
            <p className="text-stone-500 mt-2">Connectez-vous pour gérer l'application</p>
          </div>
          
          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-6 text-sm">
              {loginError}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Nom d'utilisateur</label>
              <input 
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                required
                data-testid="admin-username"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#14B53A] focus:ring-2 focus:ring-[#14B53A]/20 outline-none"
                placeholder="Entrez votre nom d'utilisateur"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Mot de passe</label>
              <input 
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                required
                data-testid="admin-password"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#14B53A] focus:ring-2 focus:ring-[#14B53A]/20 outline-none"
                placeholder="Entrez votre mot de passe"
              />
            </div>
            <button 
              type="submit"
              data-testid="admin-login-btn"
              className="btn-primary w-full py-3"
            >
              Se connecter
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/" className="text-[#14B53A] hover:underline text-sm">
              ← Retour au site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#14B53A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex" data-testid="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar hidden md:block">
        <div className="flex items-center gap-3 mb-8 px-4">
          <div className="w-10 h-10 rounded-full green-gradient flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold">Admin</span>
        </div>
        <nav className="space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              data-testid={`admin-nav-${item.id}`}
              className={`admin-nav-item w-full ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-8 space-y-2">
          <button onClick={handleLogout} className="admin-nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
          <Link to="/" className="admin-nav-item">
            <ChevronRight className="w-5 h-5 rotate-180" />
            Retour au site
          </Link>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around py-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-3 rounded-xl ${activeTab === item.id ? 'text-[#14B53A]' : 'text-stone-500'}`}
            >
              <item.icon className="w-6 h-6" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        {/* Notification Sound */}
        <audio ref={audioRef} preload="auto">
          <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQ09LqnL7bhjJwU2mNXrlWwhCji6yMeDfnx5fIqNhYWLgYJ9f3+BhoyLj4yFgn54dHt/hYqNjoqEfnl0dn2Dh4uMi4WCfHZ0eH6DhoqLiYSAe3Z1en+Eh4mKiIJ9eHV4fIKGiImHgn16dnZ7gIWHiIeEf3t4d3qAhIeIh4R/e3d3eoGFhoiGg396d3d7gYSGh4aDf3t4eHuBhIaGhYF9enh5e4KFhoaCf3x4eHuBhIWFhIF+e3l5fIKEhYWDgH17enp8goOFhYOAfHt6e32Cg4SEgoB9e3p7fYKDhISCgH18e3t9gYODg4F+fHt7fH+Bg4OCgX58fHt8f4GCgoKBfnx8e3x/gIGCgoF+fXx7fH+AgIGBgH59fHx8f4CAgYCAfn18fH1/gICAf358fX19f4CAgH99fX19fX9/f399fX19fn5/f399fX19fn5+fn59fX5+fn5+fn19fn5+fn5+fX1+fn5+fn59fX5+fn5+fn19fn5+fn5+fX19fn5+fn59fX1+fn5+fn19fX5+fn5+fX19fn5+fn59fX1+fn5+fn19fX5+fn5+fX19fX5+fn59fX19fn5+fn19fX19fn5+fX19fX1+fn59fX19fX5+fn19fX19fn5+fX19fX1+fn59fX19fX5+fn19fX19fn5+fX19fX1+fn59fX19fX19fn19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fQ==" type="audio/wav" />
        </audio>

        {/* Top Bar with Notifications */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-stone-900">
            {activeTab === 'dashboard' && t('dashboard')}
            {activeTab === 'pos' && '🏪 Caisse'}
            {activeTab === 'products' && t('manageProducts')}
            {activeTab === 'orders' && t('manageOrders')}
            {activeTab === 'contacts' && t('messages')}
          </h1>
          
          <div className="flex items-center gap-3">
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-full transition-colors ${soundEnabled ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-400'}`}
              title={soundEnabled ? 'Son activé' : 'Son désactivé'}
            >
              <Volume2 className="w-5 h-5" />
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                data-testid="notifications-btn"
                className="relative p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <Bell className={`w-6 h-6 ${notifications.length > 0 ? 'text-[#CE1126]' : 'text-stone-500'}`} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#CE1126] text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden">
                  <div className="p-4 border-b bg-stone-50 flex items-center justify-between">
                    <h3 className="font-bold text-stone-900">Notifications</h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-[#14B53A] hover:underline"
                      >
                        Tout marquer lu
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-stone-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucune nouvelle notification</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          className="p-4 border-b hover:bg-stone-50 cursor-pointer transition-colors"
                          onClick={() => {
                            markNotificationRead(notif.id);
                            setActiveTab('orders');
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-stone-900 text-sm">Nouvelle commande!</p>
                              <p className="text-sm text-stone-600 truncate">{notif.customer_name}</p>
                              <p className="text-xs text-[#14B53A] font-bold mt-1">
                                {notif.total_euro}€ / {notif.total_cfa?.toLocaleString()} F
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="animate-fade-in-up">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <Package className="w-8 h-8 text-[#14B53A] mb-2" />
                <p className="text-2xl font-bold text-stone-900">{stats.total_products}</p>
                <p className="text-stone-500 text-sm">{t('totalProducts')}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <ClipboardList className="w-8 h-8 text-blue-500 mb-2" />
                <p className="text-2xl font-bold text-stone-900">{stats.total_orders}</p>
                <p className="text-stone-500 text-sm">{t('totalOrders')}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <Clock className="w-8 h-8 text-[#FCD116] mb-2" />
                <p className="text-2xl font-bold text-stone-900">{stats.pending_orders}</p>
                <p className="text-stone-500 text-sm">{t('pendingOrders')}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <TrendingUp className="w-8 h-8 text-[#CE1126] mb-2" />
                <p className="text-2xl font-bold text-stone-900">{stats.total_revenue_euro.toFixed(2)}€</p>
                <p className="text-stone-500 text-sm">{t('revenue')}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Stock bas: {stats.low_stock_count} produits
                </h3>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-500" />
                  Messages non lus: {stats.unread_contacts}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* POS / Caisse Tab */}
        {activeTab === 'pos' && (
          <div className="animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Products Grid */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                  <h2 className="font-bold text-lg mb-4">Sélectionner les produits</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {products.filter(p => p.is_available).map(product => (
                      <button
                        key={product.id}
                        onClick={() => addToPosCart(product)}
                        className="p-3 border-2 border-stone-200 rounded-xl hover:border-[#14B53A] hover:bg-green-50 transition-all text-left"
                      >
                        <p className="font-semibold text-sm truncate">{product.name}</p>
                        <p className="text-xs text-stone-500">{product.price_cfa?.toLocaleString()} F</p>
                        <p className="text-xs text-[#14B53A] font-bold">{product.price_euro}€</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Summary */}
                {posDailySummary && (
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
                    <h3 className="font-bold text-lg mb-4">📊 Ventes du jour</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-green-100 text-sm">Nombre de ventes</p>
                        <p className="text-3xl font-black">{posDailySummary.total_sales}</p>
                      </div>
                      <div>
                        <p className="text-green-100 text-sm">Total CFA</p>
                        <p className="text-2xl font-bold">{posDailySummary.total_cfa?.toLocaleString()} F</p>
                      </div>
                      <div>
                        <p className="text-green-100 text-sm">Total EUR</p>
                        <p className="text-2xl font-bold">{posDailySummary.total_euro?.toFixed(2)}€</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart / Receipt */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-4">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Receipt className="w-5 h-5" /> Ticket de caisse
                  </h2>
                  
                  {posCart.length === 0 ? (
                    <div className="text-center py-8 text-stone-400">
                      <Store className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Panier vide</p>
                      <p className="text-sm">Cliquez sur un produit pour l'ajouter</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                        {posCart.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{item.name}</p>
                              <p className="text-xs text-stone-500">{item.price_cfa?.toLocaleString()} F x {item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => updatePosQuantity(item.id, -1)}
                                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-bold">{item.quantity}</span>
                              <button 
                                onClick={() => updatePosQuantity(item.id, 1)}
                                className="w-8 h-8 rounded-full bg-[#14B53A] text-white hover:bg-green-600 flex items-center justify-center"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => removePosItem(item.id)}
                                className="w-8 h-8 rounded-full bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center ml-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="border-t-2 border-dashed pt-4 mb-4">
                        <div className="flex justify-between text-lg font-bold">
                          <span>TOTAL:</span>
                          <span className="text-[#14B53A]">{posTotalCfa.toLocaleString()} F CFA</span>
                        </div>
                        <div className="flex justify-between text-sm text-stone-500">
                          <span></span>
                          <span>{posTotalEuro.toFixed(2)}€</span>
                        </div>
                      </div>

                      {/* Customer Name (optional) */}
                      <input
                        type="text"
                        placeholder="Nom du client (optionnel)"
                        value={posCustomerName}
                        onChange={(e) => setPosCustomerName(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-stone-200 mb-4 text-sm"
                      />

                      {/* Payment Method */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <button
                          onClick={() => setPosPaymentMethod('cash')}
                          className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                            posPaymentMethod === 'cash' 
                              ? 'bg-[#14B53A] text-white' 
                              : 'bg-stone-100 hover:bg-stone-200'
                          }`}
                        >
                          💵 Cash
                        </button>
                        <button
                          onClick={() => setPosPaymentMethod('orange_money')}
                          className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                            posPaymentMethod === 'orange_money' 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-stone-100 hover:bg-stone-200'
                          }`}
                        >
                          🟠 Orange
                        </button>
                        <button
                          onClick={() => setPosPaymentMethod('wave')}
                          className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                            posPaymentMethod === 'wave' 
                              ? 'bg-cyan-500 text-white' 
                              : 'bg-stone-100 hover:bg-stone-200'
                          }`}
                        >
                          🔵 Wave
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <button
                          onClick={processPOSSale}
                          disabled={posLoading}
                          className="w-full py-4 bg-[#14B53A] hover:bg-green-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors"
                        >
                          {posLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <Check className="w-5 h-5" /> Encaisser
                            </>
                          )}
                        </button>
                        <button
                          onClick={clearPosCart}
                          className="w-full py-2 bg-stone-100 hover:bg-stone-200 rounded-xl font-semibold text-stone-600 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-stone-900">{t('manageProducts')}</h1>
              <button 
                onClick={() => setShowAddProduct(true)}
                data-testid="add-product-btn"
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Ajouter un produit
              </button>
            </div>

            {/* Add Product Modal */}
            {showAddProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddProduct(false)}></div>
                <div className="relative bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Ajouter un produit</h2>
                    <button onClick={() => setShowAddProduct(false)} className="p-2 hover:bg-stone-100 rounded-full">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={addProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Nom (Français) *</label>
                        <input 
                          type="text"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                          required
                          data-testid="new-product-name"
                          className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#14B53A] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Nom (Bambara)</label>
                        <input 
                          type="text"
                          value={newProduct.name_bambara}
                          onChange={(e) => setNewProduct({...newProduct, name_bambara: e.target.value})}
                          className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#14B53A] outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Catégorie *</label>
                        <select 
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                          data-testid="new-product-category"
                          className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#14B53A] outline-none"
                        >
                          {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Poids</label>
                        <input 
                          type="text"
                          value={newProduct.weight}
                          onChange={(e) => setNewProduct({...newProduct, weight: e.target.value})}
                          placeholder="Ex: 25 kg"
                          className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#14B53A] outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Prix (€) *</label>
                        <input 
                          type="number"
                          step="0.01"
                          value={newProduct.price_euro}
                          onChange={(e) => setNewProduct({...newProduct, price_euro: e.target.value})}
                          required
                          data-testid="new-product-price-euro"
                          className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#14B53A] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Prix (F CFA) *</label>
                        <input 
                          type="number"
                          value={newProduct.price_cfa}
                          onChange={(e) => setNewProduct({...newProduct, price_cfa: e.target.value})}
                          required
                          data-testid="new-product-price-cfa"
                          className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#14B53A] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Stock *</label>
                        <input 
                          type="number"
                          value={newProduct.stock_quantity}
                          onChange={(e) => setNewProduct({...newProduct, stock_quantity: e.target.value})}
                          required
                          data-testid="new-product-stock"
                          className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#14B53A] outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">URL de l'image</label>
                      <input 
                        type="url"
                        value={newProduct.image_url}
                        onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                        placeholder="https://..."
                        className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#14B53A] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                      <textarea 
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        rows={2}
                        className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[#14B53A] outline-none resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={newProduct.is_available}
                          onChange={(e) => setNewProduct({...newProduct, is_available: e.target.checked})}
                          className="w-5 h-5 rounded border-stone-300 text-[#14B53A] focus:ring-[#14B53A]"
                        />
                        <span className="text-sm font-medium text-stone-700">Disponible</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={newProduct.is_promotion}
                          onChange={(e) => setNewProduct({...newProduct, is_promotion: e.target.checked})}
                          data-testid="new-product-promo"
                          className="w-5 h-5 rounded border-stone-300 text-[#CE1126] focus:ring-[#CE1126]"
                        />
                        <span className="text-sm font-medium text-stone-700">En promotion</span>
                      </label>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button 
                        type="button"
                        onClick={() => setShowAddProduct(false)}
                        className="flex-1 py-3 px-4 rounded-xl border border-stone-200 font-semibold text-stone-600 hover:bg-stone-50"
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit"
                        data-testid="submit-new-product"
                        className="flex-1 btn-primary"
                      >
                        Ajouter le produit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">{t('name')}</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">{t('category')}</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">{t('price')}</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">{t('stock')}</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Promo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-stone-50" data-testid={`admin-product-${product.id}`}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img src={product.image_url || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <p className="font-semibold text-stone-900">{product.name}</p>
                              <p className="text-sm text-stone-500">{product.weight}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-stone-600">{product.category}</td>
                        <td className="px-4 py-4">
                          <span className="price-euro">{product.price_euro}€</span>
                          <span className="text-stone-400 mx-1">/</span>
                          <span className="price-cfa text-sm">{product.price_cfa.toLocaleString()}F</span>
                        </td>
                        <td className="px-4 py-4">
                          {editingProduct === product.id ? (
                            <input 
                              type="number"
                              defaultValue={product.stock_quantity}
                              className="w-20 px-2 py-1 border rounded"
                              onBlur={(e) => updateProduct(product.id, { stock_quantity: parseInt(e.target.value) })}
                            />
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                              product.stock_quantity > 20 ? 'stock-high' :
                              product.stock_quantity > 10 ? 'stock-medium' : 'stock-low'
                            }`}>
                              {product.stock_quantity}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <button 
                            onClick={() => togglePromotion(product.id, product.is_promotion)}
                            data-testid={`promo-toggle-${product.id}`}
                            className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                              product.is_promotion 
                                ? 'bg-[#CE1126] text-white' 
                                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}
                          >
                            {product.is_promotion ? 'PROMO' : 'Non'}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => setEditingProduct(editingProduct === product.id ? null : product.id)}
                              data-testid={`edit-product-${product.id}`}
                              className="p-2 hover:bg-stone-100 rounded-lg text-stone-600"
                              title="Modifier le stock"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteProduct(product.id)}
                              data-testid={`delete-product-${product.id}`}
                              className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in-up">
            <h1 className="text-2xl font-bold text-stone-900 mb-6">{t('manageOrders')}</h1>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-stone-500">
                  <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Aucune commande</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm" data-testid={`admin-order-${order.id}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="font-bold text-stone-900">{order.customer_name}</p>
                        <p className="text-sm text-stone-500">{order.customer_phone}</p>
                        <p className="text-sm text-stone-500">{order.customer_address}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#14B53A]">{order.total_euro.toFixed(2)}€</p>
                        <p className="text-sm text-[#CE1126]">{order.total_cfa.toLocaleString()} F</p>
                        {order.is_wholesale && (
                          <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Grossiste
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-sm text-stone-500 mb-2">Articles:</p>
                      <div className="space-y-1 mb-4">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-sm text-stone-700">
                            {item.quantity}x {item.product_name} - {item.price_euro}€
                          </p>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                          {t(order.status)}
                        </span>
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          data-testid={`order-status-${order.id}`}
                          className="px-3 py-1 border rounded-full text-sm"
                        >
                          <option value="pending">{t('pending')}</option>
                          <option value="confirmed">{t('confirmed')}</option>
                          <option value="processing">{t('processing')}</option>
                          <option value="shipped">{t('shipped')}</option>
                          <option value="delivered">{t('delivered')}</option>
                          <option value="cancelled">{t('cancelled')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="animate-fade-in-up">
            <h1 className="text-2xl font-bold text-stone-900 mb-6">{t('messages')}</h1>
            <div className="space-y-4">
              {contacts.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-stone-500">
                  <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Aucun message</p>
                </div>
              ) : (
                contacts.map(contact => (
                  <div 
                    key={contact.id} 
                    className={`bg-white rounded-2xl p-6 shadow-sm ${!contact.is_read ? 'border-l-4 border-[#14B53A]' : ''}`}
                    data-testid={`admin-contact-${contact.id}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="font-bold text-stone-900">{contact.name}</p>
                        <p className="text-sm text-stone-500">{contact.phone}</p>
                        {contact.email && <p className="text-sm text-stone-500">{contact.email}</p>}
                      </div>
                      {!contact.is_read && (
                        <button 
                          onClick={() => markContactRead(contact.id)}
                          data-testid={`mark-read-${contact.id}`}
                          className="px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-full text-sm font-medium text-stone-600 flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" /> Marquer lu
                        </button>
                      )}
                    </div>
                    <p className="font-medium text-stone-800 mb-2">{contact.subject}</p>
                    <p className="text-stone-600">{contact.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Footer
const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-stone-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full green-gradient flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg">{t('brand')}</span>
            </div>
            <p className="text-stone-400">{t('tagline')}</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">{t('contact')}</h4>
            <div className="space-y-2 text-stone-400">
              <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +223 64 48 75 74</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +33 7 45 90 21 34</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> 06 14 31 34 34</p>
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Bamako, Mali 🇲🇱</p>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Services</h4>
            <div className="space-y-2 text-stone-400">
              <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#14B53A]" /> {t('wholesale')}</p>
              <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#14B53A]" /> {t('delivery')}</p>
              <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#14B53A]" /> {t('privateContact')}</p>
            </div>
          </div>
        </div>
        <div className="mali-flag-strip mt-8 rounded-full"></div>
        <p className="text-center text-stone-500 mt-4 text-sm">
          © 2026 Groupe BT Alimentaire. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
};

// Layout Component
const Layout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Header />}
      <CartSidebar />
      <main>{children}</main>
      {!isAdmin && <Footer />}
    </>
  );
};

// Main App
function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </CartProvider>
    </LanguageProvider>
  );
}

export default App;
