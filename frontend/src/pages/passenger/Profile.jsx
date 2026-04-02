import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth, API } from "../../App";
import { 
  User, ArrowLeft, MapPin, CreditCard, Star, Clock, 
  Phone, Mail, Edit, Save, Heart, History, Lock, Eye, EyeOff
} from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_uber-mali-drive/artifacts/apw7o3ih_image.png";

const PassengerProfile = ({ onClose }) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rideHistory, setRideHistory] = useState([]);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || ""
  });
  
  // Favorite addresses
  const [favorites, setFavorites] = useState({
    home: user?.favorite_addresses?.home || "",
    work: user?.favorite_addresses?.work || ""
  });
  
  // Preferred payment
  const [preferredPayment, setPreferredPayment] = useState(user?.preferred_payment || "cash");

  // Password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (passwordData.new.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setPwLoading(true);
    try {
      await axios.put(`${API}/users/password`, {
        current_password: passwordData.current,
        new_password: passwordData.new
      });
      toast.success("Mot de passe modifié avec succès !");
      setPasswordData({ current: "", new: "", confirm: "" });
      setShowPasswordSection(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors du changement de mot de passe");
    } finally {
      setPwLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/rides/history`);
      setRideHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/users/profile`, {
        ...profileData,
        favorite_addresses: favorites,
        preferred_payment: preferredPayment
      });
      toast.success("Profil mis à jour!");
      setEditing(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const completedRides = rideHistory.filter(r => r.status === "completed");
  const totalSpent = completedRides.reduce((sum, r) => sum + (r.final_price || r.estimated_price || 0), 0);
  const avgRating = user?.rating || 5.0;

  return (
    <div className="min-h-screen bg-[#F4F4F5]" data-testid="passenger-profile-page">
      {/* Header */}
      <header className="bg-white border-b border-black px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 hover:text-[#FFBE00] transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#FFBE00] text-black font-bold border border-black"
              data-testid="edit-profile-btn"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-black"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#FFBE00] text-black font-bold border border-black"
                data-testid="save-profile-btn"
              >
                <Save className="w-4 h-4" />
                {loading ? "..." : "Sauvegarder"}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {/* Profile Card */}
        <div className="brutalist-card bg-white p-6 mb-4" data-testid="profile-card">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-[#FFBE00] border-2 border-black rounded-full flex items-center justify-center overflow-hidden">
                {user?.picture ? (
                  <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-black">
                    {user?.name?.charAt(0) || "P"}
                  </span>
                )}
              </div>
              
              {/* Passenger Badge */}
              <div className="absolute -bottom-1 -right-1 bg-white border-2 border-black px-2 py-1">
                <span className="text-xs font-bold">PASSAGER</span>
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {editing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="brutalist-input text-xl font-black w-full mb-2 p-2"
                  data-testid="name-input"
                />
              ) : (
                <h1 className="font-['Outfit'] text-2xl font-black mb-1">{user?.name}</h1>
              )}
              
              <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-[#FFBE00]" />
                  {avgRating.toFixed(1)}
                </span>
                <span>•</span>
                <span>{completedRides.length} courses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="brutalist-card bg-white p-4 text-center">
            <History className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <p className="font-['Outfit'] font-black text-xl">{completedRides.length}</p>
            <p className="text-xs text-gray-600 uppercase">Courses</p>
          </div>
          <div className="brutalist-card bg-white p-4 text-center">
            <Star className="w-6 h-6 mx-auto mb-2 text-[#FFBE00]" />
            <p className="font-['Outfit'] font-black text-xl">{avgRating.toFixed(1)}</p>
            <p className="text-xs text-gray-600 uppercase">Note</p>
          </div>
          <div className="brutalist-card bg-white p-4 text-center">
            <CreditCard className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="font-['Outfit'] font-black text-lg">{totalSpent.toLocaleString()}</p>
            <p className="text-xs text-gray-600 uppercase">FCFA dépensés</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="brutalist-card bg-white p-6 mb-4" data-testid="contact-info">
          <h2 className="font-['Outfit'] font-bold text-lg mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            INFORMATIONS PERSONNELLES
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Téléphone</label>
              {editing ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="brutalist-input w-full p-3"
                  placeholder="+223 XX XX XX XX"
                  data-testid="phone-input"
                />
              ) : (
                <p className="font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {user?.phone || "Non renseigné"}
                </p>
              )}
            </div>
            
            <div>
              <label className="text-sm text-gray-600 block mb-1">Email</label>
              <p className="font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Favorite Addresses */}
        <div className="brutalist-card bg-white p-6 mb-4" data-testid="favorite-addresses">
          <h2 className="font-['Outfit'] font-bold text-lg mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            ADRESSES FAVORITES
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" /> Maison
              </label>
              {editing ? (
                <input
                  type="text"
                  value={favorites.home}
                  onChange={(e) => setFavorites({ ...favorites, home: e.target.value })}
                  className="brutalist-input w-full p-3"
                  placeholder="Ex: Hamdallaye ACI 2000"
                  data-testid="home-address-input"
                />
              ) : (
                <p className="font-medium p-3 bg-gray-50 border border-gray-200">
                  {favorites.home || "Non défini - Ajoutez votre adresse"}
                </p>
              )}
            </div>
            
            <div>
              <label className="text-sm text-gray-600 block mb-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" /> Travail
              </label>
              {editing ? (
                <input
                  type="text"
                  value={favorites.work}
                  onChange={(e) => setFavorites({ ...favorites, work: e.target.value })}
                  className="brutalist-input w-full p-3"
                  placeholder="Ex: Quartier du Fleuve"
                  data-testid="work-address-input"
                />
              ) : (
                <p className="font-medium p-3 bg-gray-50 border border-gray-200">
                  {favorites.work || "Non défini - Ajoutez votre adresse"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Preference */}
        <div className="brutalist-card bg-white p-6 mb-4" data-testid="payment-preference">
          <h2 className="font-['Outfit'] font-bold text-lg mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            MODE DE PAIEMENT PRÉFÉRÉ
          </h2>
          
          {editing ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPreferredPayment("cash")}
                className={`p-4 border border-black flex flex-col items-center gap-2 transition-colors ${
                  preferredPayment === "cash" ? "bg-[#FFBE00]" : "bg-white hover:bg-gray-50"
                }`}
                data-testid="payment-cash-btn"
              >
                <CreditCard className="w-6 h-6" />
                <span className="font-medium">Espèces</span>
              </button>
              <button
                type="button"
                onClick={() => setPreferredPayment("mobile_money")}
                className={`p-4 border border-black flex flex-col items-center gap-2 transition-colors ${
                  preferredPayment === "mobile_money" ? "bg-[#FFBE00]" : "bg-white hover:bg-gray-50"
                }`}
                data-testid="payment-mobile-btn"
              >
                <Phone className="w-6 h-6" />
                <span className="font-medium">Mobile Money</span>
              </button>
            </div>
          ) : (
            <div className={`p-4 border border-black flex items-center gap-3 ${
              preferredPayment === "cash" ? "bg-green-50" : "bg-orange-50"
            }`}>
              {preferredPayment === "cash" ? (
                <>
                  <CreditCard className="w-6 h-6 text-green-600" />
                  <span className="font-bold">Espèces</span>
                </>
              ) : (
                <>
                  <Phone className="w-6 h-6 text-orange-600" />
                  <span className="font-bold">Mobile Money (Orange/Moov)</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Password Change */}
        <div className="brutalist-card bg-white p-6 mb-4" data-testid="password-section">
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="w-full flex items-center justify-between"
          >
            <h2 className="font-['Outfit'] font-bold text-lg flex items-center gap-2">
              <Lock className="w-5 h-5" />
              MODIFIER LE MOT DE PASSE
            </h2>
            <span className="text-gray-400 text-sm">{showPasswordSection ? "Fermer" : "Ouvrir"}</span>
          </button>

          {showPasswordSection && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="brutalist-input w-full p-3 pr-12"
                    placeholder="••••••••"
                    data-testid="current-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showCurrentPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="brutalist-input w-full p-3 pr-12"
                    placeholder="••••••••"
                    data-testid="new-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showNewPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  className="brutalist-input w-full p-3"
                  placeholder="••••••••"
                  data-testid="confirm-password-input"
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={pwLoading || !passwordData.current || !passwordData.new || !passwordData.confirm}
                className="w-full bg-[#FFBE00] border border-black py-3 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
                data-testid="change-password-btn"
              >
                {pwLoading ? "MODIFICATION EN COURS..." : "CHANGER LE MOT DE PASSE"}
              </button>
            </div>
          )}
        </div>

        {/* Recent Rides */}
        <div className="brutalist-card bg-white p-6" data-testid="recent-rides">
          <h2 className="font-['Outfit'] font-bold text-lg mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            COURSES RÉCENTES
          </h2>
          
          {completedRides.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune course effectuée</p>
              <p className="text-sm">Réservez votre première course!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedRides.slice(0, 5).map((ride) => (
                <div key={ride.ride_id} className="flex items-center justify-between p-3 border border-gray-200 hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-sm">{ride.pickup_location?.address}</p>
                    <p className="text-xs text-gray-500">→ {ride.dropoff_location?.address}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(ride.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{(ride.final_price || ride.estimated_price)?.toLocaleString()} FCFA</p>
                    {ride.driver && (
                      <p className="text-xs text-gray-500">{ride.driver.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PassengerProfile;
