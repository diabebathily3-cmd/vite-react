import { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  ShoppingCart, Phone, MessageCircle, Package, ChevronRight, 
  Menu, X, Plus, Minus, Trash2, Send, MapPin, Clock, Truck,
  LayoutDashboard, PackageSearch, ClipboardList, Mail, LogOut,
  Edit, Check, AlertCircle, TrendingUp, Users, Star, Filter
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Translations
const translations = {
  fr: {
    brand: "PROGET ALIMENTATION",
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
    brand: "PROGET ALIMENTATION",
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

// Product Card
const ProductCard = ({ product, onAddToCart }) => {
  const { t, lang } = useLanguage();
  const name = lang === 'bm' && product.name_bambara ? product.name_bambara : product.name;

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
        {product.stock_quantity < 10 && product.stock_quantity > 0 && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {t('lowStock')}
          </div>
        )}
        {product.stock_quantity === 0 && (
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <a href="tel:+22364487574" className="bg-white p-6 rounded-2xl shadow-sm text-center hover:shadow-md transition-shadow">
            <Phone className="w-8 h-8 text-[#14B53A] mx-auto mb-2" />
            <p className="font-semibold">+223 64 48 75 74</p>
          </a>
          <a href="tel:0614313434" className="bg-white p-6 rounded-2xl shadow-sm text-center hover:shadow-md transition-shadow">
            <Phone className="w-8 h-8 text-[#14B53A] mx-auto mb-2" />
            <p className="font-semibold">06 14 31 34 34</p>
          </a>
          <a href="https://wa.me/22364487574" target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-2xl shadow-sm text-center hover:shadow-md transition-shadow">
            <MessageCircle className="w-8 h-8 text-[#25D366] mx-auto mb-2" />
            <p className="font-semibold">WhatsApp</p>
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
  const { t } = useLanguage();
  const { cart, totalEuro, totalCfa, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    customer_name: '', 
    customer_phone: '', 
    customer_email: '', 
    customer_address: '', 
    notes: '',
    is_wholesale: false 
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
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
      await axios.post(`${API}/orders`, orderData);
      setSuccess(true);
      clearCart();
      setTimeout(() => navigate('/'), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4" data-testid="order-success">
        <div className="bg-white rounded-3xl p-8 text-center max-w-md shadow-lg animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-[#14B53A]" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">{t('orderPlaced')}</h2>
          <p className="text-stone-600 mb-6">{t('orderSuccess')}</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            {t('continueShopping')} <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
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

  return (
    <div className="min-h-screen bg-stone-50 py-8" data-testid="checkout-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-stone-900 mb-8">{t('checkout')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Informations de livraison</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    {t('orderNow')} <ChevronRight className="w-5 h-5" />
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

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
    { id: 'products', icon: PackageSearch, label: t('manageProducts') },
    { id: 'orders', icon: ClipboardList, label: t('manageOrders') },
    { id: 'contacts', icon: Mail, label: t('messages') }
  ];

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
        <div className="mt-auto pt-8">
          <Link to="/" className="admin-nav-item">
            <LogOut className="w-5 h-5" />
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
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="animate-fade-in-up">
            <h1 className="text-2xl font-bold text-stone-900 mb-6">{t('dashboard')}</h1>
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

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="animate-fade-in-up">
            <h1 className="text-2xl font-bold text-stone-900 mb-6">{t('manageProducts')}</h1>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">{t('name')}</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">{t('category')}</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">{t('price')}</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">{t('stock')}</th>
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
                            onClick={() => setEditingProduct(editingProduct === product.id ? null : product.id)}
                            data-testid={`edit-product-${product.id}`}
                            className="p-2 hover:bg-stone-100 rounded-lg text-stone-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
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
          © 2026 PROGET ALIMENTATION. Tous droits réservés.
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
