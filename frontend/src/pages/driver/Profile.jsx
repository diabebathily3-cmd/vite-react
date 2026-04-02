import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth, API } from "../../App";
import { 
  Car, Star, Camera, FileText, Shield, Phone, Mail, 
  MapPin, Calendar, Award, TrendingUp, ArrowLeft, Edit, Save, X, Lock, Eye, EyeOff
} from "lucide-react";

const DriverProfile = ({ onClose }) => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rideHistory, setRideHistory] = useState([]);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || ""
  });
  
  // Vehicle info
  const [vehicleInfo, setVehicleInfo] = useState(user?.vehicle_info || {
    make: "",
    model: "",
    year: "",
    plate: "",
    color: "",
    type: "sedan" // sedan, suv, minivan
  });
  
  // Documents
  const [documents, setDocuments] = useState({
    license: user?.documents?.license || false,
    insurance: user?.documents?.insurance || false,
    registration: user?.documents?.registration || false,
    photo_id: user?.documents?.photo_id || false
  });

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
      // Update profile
      await axios.put(`${API}/users/profile`, profileData);
      
      // Update vehicle
      await axios.put(`${API}/users/vehicle`, vehicleInfo);
      
      toast.success("Profil mis à jour avec succès!");
      setEditing(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const completedRides = rideHistory.filter(r => r.status === "completed");
  const totalEarnings = completedRides.reduce((sum, r) => sum + (r.final_price || 0), 0);
  const avgRating = user?.rating || 5.0;
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : "N/A";

  return (
    <div className="min-h-screen bg-[#F4F4F5]" data-testid="driver-profile-page">
      {/* Header */}
      <header className="bg-black text-white px-4 py-4">
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
                className="px-4 py-2 border border-white"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#FFBE00] text-black font-bold"
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
              <div className="w-28 h-28 bg-gray-200 border-2 border-black flex items-center justify-center overflow-hidden">
                {user?.picture ? (
                  <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-gray-400">
                    {user?.name?.charAt(0) || "C"}
                  </span>
                )}
              </div>
              {editing && (
                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#FFBE00] border border-black flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </button>
              )}
              
              {/* Driver Badge */}
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-black flex items-center justify-center">
                <Car className="w-4 h-4 text-[#FFBE00]" />
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
              
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <div className="flex items-center gap-1 px-3 py-1 bg-[#FFBE00] border border-black">
                  <Star className="w-4 h-4" />
                  <span className="font-bold">{avgRating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-gray-600">• {completedRides.length} courses</span>
              </div>
              
              <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1">
                <Calendar className="w-4 h-4" />
                Membre depuis {memberSince}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="brutalist-card bg-white p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-[#FFBE00]" />
            <p className="font-['Outfit'] font-black text-xl">{completedRides.length}</p>
            <p className="text-xs text-gray-600 uppercase">Courses</p>
          </div>
          <div className="brutalist-card bg-white p-4 text-center">
            <Award className="w-6 h-6 mx-auto mb-2 text-[#FFBE00]" />
            <p className="font-['Outfit'] font-black text-xl">{avgRating.toFixed(1)}</p>
            <p className="text-xs text-gray-600 uppercase">Note</p>
          </div>
          <div className="brutalist-card bg-[#FFBE00] p-4 text-center border border-black">
            <p className="text-xs text-black uppercase font-bold">Revenus</p>
            <p className="font-['Outfit'] font-black text-lg">{totalEarnings.toLocaleString()}</p>
            <p className="text-xs">FCFA</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="brutalist-card bg-white p-6 mb-4" data-testid="contact-info">
          <h2 className="font-['Outfit'] font-bold text-lg mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            INFORMATIONS DE CONTACT
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
                <p className="font-medium">{user?.phone || "Non renseigné"}</p>
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

        {/* Vehicle Info */}
        <div className="brutalist-card bg-white p-6 mb-4" data-testid="vehicle-info">
          <h2 className="font-['Outfit'] font-bold text-lg mb-4 flex items-center gap-2">
            <Car className="w-5 h-5" />
            MON VÉHICULE
          </h2>
          
          {editing ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Marque</label>
                <input
                  type="text"
                  value={vehicleInfo.make}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, make: e.target.value })}
                  className="brutalist-input w-full p-3"
                  placeholder="Toyota"
                  data-testid="vehicle-make-input"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Modèle</label>
                <input
                  type="text"
                  value={vehicleInfo.model}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, model: e.target.value })}
                  className="brutalist-input w-full p-3"
                  placeholder="Corolla"
                  data-testid="vehicle-model-input"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Année</label>
                <input
                  type="text"
                  value={vehicleInfo.year}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, year: e.target.value })}
                  className="brutalist-input w-full p-3"
                  placeholder="2020"
                  data-testid="vehicle-year-input"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Couleur</label>
                <input
                  type="text"
                  value={vehicleInfo.color}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, color: e.target.value })}
                  className="brutalist-input w-full p-3"
                  placeholder="Blanc"
                  data-testid="vehicle-color-input"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-600 block mb-1">Plaque d'immatriculation</label>
                <input
                  type="text"
                  value={vehicleInfo.plate}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, plate: e.target.value })}
                  className="brutalist-input w-full p-3"
                  placeholder="AB-1234-ML"
                  data-testid="vehicle-plate-input"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-600 block mb-1">Type de véhicule</label>
                <div className="grid grid-cols-3 gap-2">
                  {["sedan", "suv", "minivan"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setVehicleInfo({ ...vehicleInfo, type })}
                      className={`p-3 border border-black font-medium uppercase text-sm transition-colors ${
                        vehicleInfo.type === type ? "bg-[#FFBE00]" : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {vehicleInfo.make ? (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 border border-black flex items-center justify-center">
                    <Car className="w-10 h-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">
                      {vehicleInfo.make} {vehicleInfo.model}
                    </p>
                    <p className="text-gray-600">
                      {vehicleInfo.year} • {vehicleInfo.color}
                    </p>
                    <p className="font-mono text-lg bg-[#FFBE00] inline-block px-3 py-1 mt-2 border border-black">
                      {vehicleInfo.plate}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Car className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun véhicule enregistré</p>
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-2 text-[#FFBE00] font-bold hover:underline"
                  >
                    Ajouter un véhicule
                  </button>
                </div>
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

        {/* Documents */}
        <div className="brutalist-card bg-white p-6 mb-4" data-testid="documents-section">
          <h2 className="font-['Outfit'] font-bold text-lg mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            DOCUMENTS
          </h2>
          
          <div className="space-y-3">
            {[
              { key: "license", label: "Permis de conduire", icon: <FileText className="w-5 h-5" /> },
              { key: "insurance", label: "Assurance véhicule", icon: <Shield className="w-5 h-5" /> },
              { key: "registration", label: "Carte grise", icon: <FileText className="w-5 h-5" /> },
              { key: "photo_id", label: "Pièce d'identité", icon: <FileText className="w-5 h-5" /> }
            ].map((doc) => (
              <div
                key={doc.key}
                className={`flex items-center justify-between p-4 border border-black ${
                  documents[doc.key] ? "bg-green-50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {doc.icon}
                  <span className="font-medium">{doc.label}</span>
                </div>
                <span className={`status-badge ${documents[doc.key] ? "status-online" : "status-offline"}`}>
                  {documents[doc.key] ? "Vérifié" : "Non soumis"}
                </span>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-gray-500 mt-4 text-center">
            Contactez le support pour soumettre vos documents
          </p>
        </div>

        {/* Recent Activity */}
        <div className="brutalist-card bg-white p-6" data-testid="recent-activity">
          <h2 className="font-['Outfit'] font-bold text-lg mb-4">
            ACTIVITÉ RÉCENTE
          </h2>
          
          {completedRides.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucune course effectuée</p>
          ) : (
            <div className="space-y-3">
              {completedRides.slice(0, 5).map((ride) => (
                <div key={ride.ride_id} className="flex items-center justify-between p-3 border border-gray-200">
                  <div>
                    <p className="font-medium text-sm">{ride.pickup_location.address}</p>
                    <p className="text-xs text-gray-500">→ {ride.dropoff_location.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{(ride.final_price || ride.estimated_price).toLocaleString()} FCFA</p>
                    <p className="text-xs text-gray-500">{new Date(ride.created_at).toLocaleDateString()}</p>
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

export default DriverProfile;
