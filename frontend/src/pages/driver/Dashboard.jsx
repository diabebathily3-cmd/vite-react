import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth, API } from "../../App";
import { 
  Car, MapPin, Clock, DollarSign, Star, MessageCircle, 
  Power, Menu, X, LogOut, User, Navigation, Check, Phone, UserCircle, Wallet, Bike
} from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "../../components/ui/drawer";
import DriverProfile from "./Profile";
import DriverWallet from "./Wallet";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_uber-mali-drive/artifacts/apw7o3ih_image.png";

// Map component
const MapView = ({ rideLocation, driverLocation }) => {
  return (
    <div className="w-full h-full bg-gray-200 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Navigation className="w-16 h-16 mx-auto text-[#FFBE00] mb-4" />
          <p className="text-lg font-medium">Navigation Active</p>
          {rideLocation && (
            <p className="text-sm text-gray-600 mt-2">
              Destination: {rideLocation.address}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [isOnline, setIsOnline] = useState(user?.is_online || false);
  const [activeRide, setActiveRide] = useState(null);
  const [pendingRides, setPendingRides] = useState([]);
  const [rideHistory, setRideHistory] = useState([]);
  const [earnings, setEarnings] = useState(user?.earnings || 0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Vehicle info
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState(user?.vehicle_info || {
    make: "",
    model: "",
    year: "",
    plate: "",
    color: ""
  });
  
  // Chat
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(false);

  const fetchActiveRide = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/rides/active`);
      if (response.data) {
        setActiveRide(response.data);
        if (response.data.passenger_id) {
          fetchMessages(response.data.ride_id);
        }
      } else {
        setActiveRide(null);
      }
    } catch (error) {
      console.error("Error fetching active ride:", error);
    }
  }, []);

  const fetchPendingRides = useCallback(async () => {
    if (!isOnline) return;
    try {
      const response = await axios.get(`${API}/rides/pending`);
      setPendingRides(response.data);
    } catch (error) {
      console.error("Error fetching pending rides:", error);
    }
  }, [isOnline]);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/rides/history`);
      setRideHistory(response.data);
      // Calculate earnings
      const totalEarnings = response.data
        .filter(r => r.status === "completed")
        .reduce((sum, r) => sum + (r.final_price || 0), 0);
      setEarnings(totalEarnings);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  }, []);

  const fetchWalletBalance = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/wallet`);
      setWalletBalance(response.data.balance || 0);
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  }, []);

  const fetchMessages = async (rideId) => {
    try {
      const response = await axios.get(`${API}/chat/${rideId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchActiveRide();
      await fetchHistory();
      await fetchWalletBalance();
      if (isOnline && !activeRide) {
        await fetchPendingRides();
      }
      setLoading(false);
    };
    init();
    
    // Poll for updates
    const interval = setInterval(() => {
      if (activeRide) {
        fetchActiveRide();
        fetchMessages(activeRide.ride_id);
      } else if (isOnline) {
        fetchPendingRides();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [fetchActiveRide, fetchPendingRides, fetchHistory, isOnline, activeRide]);

  const toggleOnlineStatus = async () => {
    try {
      const response = await axios.put(`${API}/users/status`);
      setIsOnline(response.data.is_online);
      toast.success(response.data.is_online ? "Vous êtes maintenant en ligne" : "Vous êtes maintenant hors ligne");
      if (response.data.is_online) {
        fetchPendingRides();
      }
    } catch (error) {
      toast.error("Erreur lors du changement de statut");
    }
  };

  const handleAcceptRide = async (rideId) => {
    try {
      const response = await axios.put(`${API}/rides/${rideId}/accept`);
      setActiveRide(response.data);
      setPendingRides([]);
      toast.success("Course acceptée!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de l'acceptation");
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!activeRide) return;
    
    try {
      const response = await axios.put(`${API}/rides/${activeRide.ride_id}/status`, { status });
      setActiveRide(response.data);
      
      if (status === "completed") {
        toast.success("Course terminée!");
        setActiveRide(null);
        fetchHistory();
        if (isOnline) fetchPendingRides();
      } else if (status === "arrived") {
        toast.success("Vous êtes arrivé au point de départ");
      } else if (status === "in_progress") {
        toast.success("Course en cours");
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeRide) return;
    
    try {
      await axios.post(`${API}/chat/${activeRide.ride_id}`, { content: newMessage });
      setNewMessage("");
      fetchMessages(activeRide.ride_id);
    } catch (error) {
      toast.error("Erreur lors de l'envoi");
    }
  };

  const handleUpdateVehicle = async () => {
    try {
      await axios.put(`${API}/users/vehicle`, vehicleInfo);
      toast.success("Informations véhicule mises à jour");
      setShowVehicleModal(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Show profile page
  if (showProfile) {
    return <DriverProfile onClose={() => setShowProfile(false)} />;
  }

  // Show wallet page
  if (showWallet) {
    return <DriverWallet onClose={() => { setShowWallet(false); fetchWalletBalance(); }} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <img src="https://customer-assets.emergentagent.com/job_uber-mali-drive/artifacts/apw7o3ih_image.png" alt="SIRA TAXI" className="h-20 w-auto mx-auto mb-4" />
          <div className="w-16 h-16 border-4 border-[#FFBE00] border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white" data-testid="driver-dashboard">
      {/* Header */}
      <header className="border-b-2 border-[#FFBE00] px-4 py-3 flex items-center justify-between bg-black z-10">
        <div className="flex items-center gap-2" data-testid="driver-header-logo">
          <img src={LOGO_URL} alt="SIRA TAXI" className="h-12 w-auto" />
          <div className="flex flex-col leading-tight">
            <span className="font-['Outfit'] font-black text-base text-white tracking-tight">SIRA <span className="text-[#FFBE00]">TAXI</span></span>
            <span className="text-[#FFBE00] text-[10px] font-bold tracking-widest">CHAUFFEUR</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Online Toggle */}
          <button
            onClick={toggleOnlineStatus}
            className={`flex items-center gap-2 px-4 py-2 border border-black font-medium transition-colors ${
              isOnline ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
            data-testid="toggle-online-btn"
          >
            <Power className="w-4 h-4" />
            {isOnline ? "EN LIGNE" : "HORS LIGNE"}
          </button>
          
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 border border-black hover:bg-gray-50"
            data-testid="menu-btn"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 relative">
        <MapView 
          rideLocation={activeRide?.pickup_location} 
          driverLocation={null}
        />
        
        {/* Stats Bar */}
        <div className="absolute top-4 left-4 right-4 flex gap-2">
          {/* Wallet Balance - Clickable */}
          <button
            onClick={() => setShowWallet(true)}
            className="brutalist-card bg-[#FFBE00] p-3 flex-1 text-left hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
            data-testid="wallet-card-btn"
          >
            <div className="flex items-center gap-1 mb-1">
              <Wallet className="w-4 h-4" />
              <p className="text-xs uppercase font-bold">Portefeuille</p>
            </div>
            <p className="font-['Outfit'] font-black text-xl">
              {walletBalance.toLocaleString()} <span className="text-sm">FCFA</span>
            </p>
          </button>
          <div className="brutalist-card bg-white p-3 flex-1">
            <p className="text-xs text-gray-600 uppercase">Courses</p>
            <p className="font-['Outfit'] font-black text-xl">
              {rideHistory.filter(r => r.status === "completed").length}
            </p>
          </div>
          <div className="brutalist-card bg-white p-3 flex-1">
            <p className="text-xs text-gray-600 uppercase">Note</p>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-[#FFBE00]" />
              <span className="font-['Outfit'] font-black text-xl">
                {(user?.rating || 5).toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-black pb-14">
          {/* No active ride - Show pending rides or waiting message */}
          {!activeRide && (
            <div className="p-4" data-testid="pending-rides-panel">
              <h2 className="font-['Outfit'] font-bold text-lg mb-4">
                {isOnline ? "COURSES DISPONIBLES" : "VOUS ÊTES HORS LIGNE"}
              </h2>
              
              {!isOnline && (
                <div className="text-center py-8">
                  <Power className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Passez en ligne pour voir les courses disponibles</p>
                </div>
              )}
              
              {isOnline && pendingRides.length === 0 && (
                <div className="text-center py-8">
                  <Car className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Aucune course disponible pour le moment</p>
                </div>
              )}
              
              {isOnline && pendingRides.map((ride) => (
                <div key={ride.ride_id} className="brutalist-card p-4 mb-3" data-testid="pending-ride-card">
                  {/* Vehicle Type Badge */}
                  <div className={`inline-flex items-center gap-1 px-2 py-1 mb-3 text-sm font-bold ${
                    ride.vehicle_type === "moto" 
                      ? "bg-orange-100 text-orange-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {ride.vehicle_type === "moto" ? (
                      <>
                        <Bike className="w-4 h-4" />
                        MOTO-TAXI
                      </>
                    ) : (
                      <>
                        <Car className="w-4 h-4" />
                        TAXI
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">{ride.pickup_location.address}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="font-medium">{ride.dropoff_location.address}</span>
                      </div>
                      
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>{ride.distance_km} km</span>
                        <span>{ride.duration_minutes} min</span>
                        <span className="font-bold text-black">{ride.estimated_price.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleAcceptRide(ride.ride_id)}
                      className="brutalist-btn px-4 py-3"
                      data-testid="accept-ride-btn"
                    >
                      ACCEPTER
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active Ride */}
          {activeRide && (
            <div className="p-4" data-testid="active-ride-panel">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-['Outfit'] font-bold text-lg">
                  {activeRide.status === "accepted" && "EN ROUTE VERS LE PASSAGER"}
                  {activeRide.status === "arrived" && "PASSAGER À RÉCUPÉRER"}
                  {activeRide.status === "in_progress" && "COURSE EN COURS"}
                </h2>
                <span className={`status-badge ${
                  activeRide.status === "in_progress" ? "status-active" : "status-pending"
                }`}>
                  {activeRide.status}
                </span>
              </div>
              
              {/* Passenger Info */}
              {activeRide.passenger && (
                <div className="brutalist-card p-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 border border-black flex items-center justify-center">
                      {activeRide.passenger.picture ? (
                        <img src={activeRide.passenger.picture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{activeRide.passenger.name}</p>
                      {activeRide.passenger.phone && (
                        <p className="text-sm text-gray-600">{activeRide.passenger.phone}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowChat(true)}
                      className="p-3 border border-black hover:bg-gray-50"
                      data-testid="open-chat-btn"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Locations */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">{activeRide.pickup_location.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">{activeRide.dropoff_location.address}</span>
                </div>
              </div>
              
              {/* Price */}
              <div className="flex justify-between items-center mb-4 p-3 bg-gray-100 border border-black">
                <span className="font-medium">Prix de la course</span>
                <span className="font-['Outfit'] font-black text-xl text-[#FFBE00]">
                  {activeRide.estimated_price.toLocaleString()} FCFA
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                {activeRide.status === "accepted" && (
                  <button
                    onClick={() => handleUpdateStatus("arrived")}
                    className="flex-1 brutalist-btn py-4"
                    data-testid="arrived-btn"
                  >
                    <Check className="w-5 h-5 inline mr-2" />
                    JE SUIS ARRIVÉ
                  </button>
                )}
                
                {activeRide.status === "arrived" && (
                  <button
                    onClick={() => handleUpdateStatus("in_progress")}
                    className="flex-1 brutalist-btn py-4"
                    data-testid="start-ride-btn"
                  >
                    <Navigation className="w-5 h-5 inline mr-2" />
                    DÉMARRER LA COURSE
                  </button>
                )}
                
                {activeRide.status === "in_progress" && (
                  <button
                    onClick={() => handleUpdateStatus("completed")}
                    className="flex-1 brutalist-btn py-4 bg-green-500"
                    data-testid="complete-ride-btn"
                  >
                    <Check className="w-5 h-5 inline mr-2" />
                    TERMINER LA COURSE
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50" data-testid="side-menu">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white border-r border-black">
            <div className="p-4 border-b border-black flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 border border-black flex items-center justify-center">
                  {user?.picture ? (
                    <img src={user.picture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="font-bold">{user?.name}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-[#FFBE00]" />
                    <span>{(user?.rating || 5).toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Wallet Summary */}
            <div className="p-4 border-b border-black bg-[#FFBE00]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Wallet className="w-4 h-4" /> Portefeuille
                  </p>
                  <p className="font-['Outfit'] font-black text-3xl">{walletBalance.toLocaleString()} FCFA</p>
                </div>
                <button
                  onClick={() => {
                    setShowWallet(true);
                    setMenuOpen(false);
                  }}
                  className="px-3 py-2 bg-black text-white text-sm font-bold"
                >
                  VOIR
                </button>
              </div>
            </div>
            
            <nav className="p-4">
              <button
                onClick={() => {
                  setShowWallet(true);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-[#FFBE00] border-b border-gray-200 bg-green-50"
                data-testid="menu-wallet-btn"
              >
                <Wallet className="w-5 h-5 text-green-600" />
                <span className="font-bold">Mon Portefeuille</span>
              </button>
              
              <button
                onClick={() => {
                  setShowProfile(true);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-[#FFBE00] border-b border-gray-200 bg-gray-50"
                data-testid="menu-profile-btn"
              >
                <UserCircle className="w-5 h-5" />
                <span className="font-bold">Mon Profil</span>
              </button>
              
              <button
                onClick={() => {
                  setShowVehicleModal(true);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-200"
                data-testid="menu-vehicle-btn"
              >
                <Car className="w-5 h-5" />
                <span className="font-medium">Mon véhicule</span>
              </button>
              
              <Drawer>
                <DrawerTrigger asChild>
                  <button
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-200"
                    data-testid="menu-history-btn"
                  >
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Historique</span>
                  </button>
                </DrawerTrigger>
                <DrawerContent className="border border-black rounded-none">
                  <DrawerHeader>
                    <DrawerTitle className="font-['Outfit'] font-bold">HISTORIQUE DES COURSES</DrawerTitle>
                  </DrawerHeader>
                  <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {rideHistory.length === 0 ? (
                      <p className="text-center text-gray-600 py-8">Aucune course pour le moment</p>
                    ) : (
                      rideHistory.map((ride) => (
                        <div key={ride.ride_id} className="brutalist-card p-4 mb-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{ride.pickup_location.address}</p>
                              <p className="text-sm text-gray-600">→ {ride.dropoff_location.address}</p>
                            </div>
                            <span className={`status-badge ${
                              ride.status === "completed" ? "status-online" : "status-offline"
                            }`}>
                              {ride.status}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>{new Date(ride.created_at).toLocaleDateString()}</span>
                            <span className="font-bold">{(ride.final_price || ride.estimated_price).toLocaleString()} FCFA</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DrawerContent>
              </Drawer>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 hover:bg-red-50 text-red-600 mt-4"
                data-testid="logout-btn"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Déconnexion</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Vehicle Info Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="vehicle-modal">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowVehicleModal(false)}></div>
          <div className="relative w-full max-w-md bg-white border border-black p-6">
            <h3 className="font-['Outfit'] font-bold text-xl mb-4">INFORMATIONS VÉHICULE</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Marque</label>
                <input
                  type="text"
                  value={vehicleInfo.make}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, make: e.target.value })}
                  className="brutalist-input w-full p-3"
                  placeholder="Toyota, Mercedes..."
                  data-testid="vehicle-make-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Modèle</label>
                <input
                  type="text"
                  value={vehicleInfo.model}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, model: e.target.value })}
                  className="brutalist-input w-full p-3"
                  placeholder="Corolla, C-Class..."
                  data-testid="vehicle-model-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Année</label>
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
                  <label className="block text-sm font-medium mb-1">Couleur</label>
                  <input
                    type="text"
                    value={vehicleInfo.color}
                    onChange={(e) => setVehicleInfo({ ...vehicleInfo, color: e.target.value })}
                    className="brutalist-input w-full p-3"
                    placeholder="Blanc"
                    data-testid="vehicle-color-input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Plaque d'immatriculation</label>
                <input
                  type="text"
                  value={vehicleInfo.plate}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, plate: e.target.value })}
                  className="brutalist-input w-full p-3"
                  placeholder="AB-1234-ML"
                  data-testid="vehicle-plate-input"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowVehicleModal(false)}
                className="flex-1 border border-black py-3 font-bold"
              >
                ANNULER
              </button>
              <button
                onClick={handleUpdateVehicle}
                className="flex-1 brutalist-btn py-3"
                data-testid="save-vehicle-btn"
              >
                ENREGISTRER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && activeRide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" data-testid="chat-modal">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowChat(false)}></div>
          <div className="relative w-full max-w-lg bg-white border border-black">
            <div className="p-4 border-b border-black flex items-center justify-between">
              <h3 className="font-['Outfit'] font-bold">Chat avec le passager</h3>
              <button onClick={() => setShowChat(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-64 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <p className="text-center text-gray-500">Aucun message</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.message_id}
                    className={`mb-3 ${msg.sender_id === user?.user_id ? "text-right" : ""}`}
                  >
                    <div
                      className={`inline-block p-3 max-w-[80%] ${
                        msg.sender_id === user?.user_id
                          ? "bg-[#FFBE00] border border-black"
                          : "bg-gray-100 border border-black"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-xs mt-1 opacity-60">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-black flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Votre message..."
                className="brutalist-input flex-1 p-3"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                data-testid="chat-input"
              />
              <button
                onClick={handleSendMessage}
                className="brutalist-btn px-4"
                data-testid="send-message-btn"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
