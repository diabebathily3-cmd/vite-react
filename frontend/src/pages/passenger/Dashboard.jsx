import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth, API } from "../../App";
import { 
  Car, MapPin, Clock, CreditCard, Star, MessageCircle, 
  History, Menu, X, LogOut, User, Navigation, Phone, UserCircle
} from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "../../components/ui/drawer";
import PassengerProfile from "./Profile";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_uber-mali-drive/artifacts/apw7o3ih_image.png";

// Map component with Leaflet
const MapView = ({ pickup, dropoff, driverLocation }) => {
  return (
    <div className="w-full h-full bg-gray-200 relative">
      <div 
        className="w-full h-full"
        style={{
          backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${pickup?.lng || -8.0029},${pickup?.lat || 12.6392},13,0/800x600?access_token=pk.placeholder')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Fallback map visualization */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 mx-auto text-[#FFBE00] mb-4" />
            <p className="text-lg font-medium">Carte de Bamako</p>
            {pickup && (
              <p className="text-sm text-gray-600 mt-2">
                {pickup.address || "Point de départ sélectionné"}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating location markers */}
      {pickup && (
        <div className="absolute top-4 left-4 brutalist-card bg-white p-3 max-w-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium truncate">{pickup.address || "Départ"}</span>
          </div>
        </div>
      )}
      {dropoff && (
        <div className="absolute top-16 left-4 brutalist-card bg-white p-3 max-w-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium truncate">{dropoff.address || "Arrivée"}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Passenger Dashboard
const PassengerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeRide, setActiveRide] = useState(null);
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Booking state
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [bookingStep, setBookingStep] = useState("location"); // location, confirm, searching, active
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(false);

  // Bamako locations for demo
  const bamakoLocations = [
    { name: "ACI 2000", lat: 12.6461, lng: -7.9925 },
    { name: "Hamdallaye", lat: 12.6234, lng: -8.0156 },
    { name: "Badalabougou", lat: 12.6178, lng: -7.9845 },
    { name: "Hippodrome", lat: 12.6512, lng: -8.0234 },
    { name: "Kalaban Coura", lat: 12.5823, lng: -8.0012 },
    { name: "Magnambougou", lat: 12.5956, lng: -7.9567 },
    { name: "Sotuba", lat: 12.6734, lng: -7.9234 },
    { name: "Quartier du Fleuve", lat: 12.6456, lng: -7.9923 }
  ];

  const fetchActiveRide = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/rides/active`);
      if (response.data) {
        setActiveRide(response.data);
        setBookingStep("active");
        if (response.data.driver_id) {
          fetchMessages(response.data.ride_id);
        }
      }
    } catch (error) {
      console.error("Error fetching active ride:", error);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/rides/history`);
      setRideHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
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
      setLoading(false);
    };
    init();
    
    // Poll for updates
    const interval = setInterval(() => {
      if (activeRide) {
        fetchActiveRide();
        if (activeRide.driver_id) {
          fetchMessages(activeRide.ride_id);
        }
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [fetchActiveRide, fetchHistory]);

  const handleEstimate = async () => {
    if (!pickup || !dropoff) {
      toast.error("Veuillez sélectionner les points de départ et d'arrivée");
      return;
    }
    
    try {
      const response = await axios.post(`${API}/rides/estimate`, {
        pickup_location: pickup,
        dropoff_location: dropoff
      });
      setEstimate(response.data);
      setBookingStep("confirm");
    } catch (error) {
      toast.error("Erreur lors de l'estimation");
    }
  };

  const handleBookRide = async () => {
    try {
      const response = await axios.post(`${API}/rides`, {
        pickup_location: pickup,
        dropoff_location: dropoff,
        payment_method: paymentMethod
      });
      setActiveRide(response.data);
      setBookingStep("searching");
      toast.success("Course demandée! Recherche d'un chauffeur...");
      
      // Poll for driver assignment
      const checkDriver = setInterval(async () => {
        const updated = await axios.get(`${API}/rides/active`);
        if (updated.data?.driver_id) {
          setActiveRide(updated.data);
          setBookingStep("active");
          clearInterval(checkDriver);
          toast.success("Chauffeur trouvé!");
        }
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de la réservation");
    }
  };

  const handleCancelRide = async () => {
    if (!activeRide) return;
    
    try {
      await axios.put(`${API}/rides/${activeRide.ride_id}/status`, { status: "cancelled" });
      setActiveRide(null);
      setBookingStep("location");
      setPickup(null);
      setDropoff(null);
      setEstimate(null);
      toast.success("Course annulée");
      fetchHistory();
    } catch (error) {
      toast.error("Erreur lors de l'annulation");
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

  const handleRateRide = async (rideId, score) => {
    try {
      await axios.post(`${API}/ratings`, { ride_id: rideId, score });
      toast.success("Merci pour votre évaluation!");
      fetchHistory();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de la notation");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Show profile page
  if (showProfile) {
    return <PassengerProfile onClose={() => setShowProfile(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-[#FFBE00] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white" data-testid="passenger-dashboard">
      {/* Header */}
      <header className="border-b border-black px-4 py-3 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-2">
          <img src={LOGO_URL} alt="SIRA TAXI" className="h-10 w-auto" />
        </div>
        
        <button
          onClick={() => setMenuOpen(true)}
          className="p-2 border border-black hover:bg-gray-50"
          data-testid="menu-btn"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Map Area */}
      <div className="flex-1 relative">
        <MapView pickup={pickup} dropoff={dropoff} driverLocation={activeRide?.driver?.current_location} />
        
        {/* Bottom Sheet */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-black slide-up">
          {/* Location Selection */}
          {bookingStep === "location" && (
            <div className="p-4" data-testid="booking-location-step">
              <h2 className="font-['Outfit'] font-bold text-lg mb-4">OÙ ALLEZ-VOUS?</h2>
              
              {/* Pickup */}
              <div className="mb-3">
                <label className="text-sm font-medium text-gray-600 block mb-1">Point de départ</label>
                <select
                  className="brutalist-input w-full p-3"
                  onChange={(e) => {
                    const loc = bamakoLocations.find(l => l.name === e.target.value);
                    if (loc) setPickup({ ...loc, address: loc.name });
                  }}
                  value={pickup?.address || ""}
                  data-testid="pickup-select"
                >
                  <option value="">Sélectionner le départ</option>
                  {bamakoLocations.map(loc => (
                    <option key={loc.name} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Dropoff */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-600 block mb-1">Destination</label>
                <select
                  className="brutalist-input w-full p-3"
                  onChange={(e) => {
                    const loc = bamakoLocations.find(l => l.name === e.target.value);
                    if (loc) setDropoff({ ...loc, address: loc.name });
                  }}
                  value={dropoff?.address || ""}
                  data-testid="dropoff-select"
                >
                  <option value="">Sélectionner la destination</option>
                  {bamakoLocations.map(loc => (
                    <option key={loc.name} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleEstimate}
                disabled={!pickup || !dropoff}
                className="brutalist-btn w-full py-4 disabled:opacity-50"
                data-testid="estimate-btn"
              >
                VOIR LE PRIX
              </button>
            </div>
          )}

          {/* Confirmation */}
          {bookingStep === "confirm" && estimate && (
            <div className="p-4" data-testid="booking-confirm-step">
              <h2 className="font-['Outfit'] font-bold text-lg mb-4">CONFIRMER VOTRE COURSE</h2>
              
              <div className="brutalist-card p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">Distance</span>
                  <span className="font-bold">{estimate.distance_km} km</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">Durée estimée</span>
                  <span className="font-bold">{estimate.duration_minutes} min</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-black">
                  <span className="font-bold">Prix estimé</span>
                  <span className="font-['Outfit'] font-black text-2xl text-[#FFBE00]">
                    {estimate.estimated_price.toLocaleString()} FCFA
                  </span>
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-600 block mb-2">Mode de paiement</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-3 border border-black flex items-center justify-center gap-2 ${
                      paymentMethod === "cash" ? "bg-[#FFBE00]" : "bg-white"
                    }`}
                    data-testid="payment-cash-btn"
                  >
                    <CreditCard className="w-4 h-4" />
                    Espèces
                  </button>
                  <button
                    onClick={() => setPaymentMethod("mobile_money")}
                    className={`p-3 border border-black flex items-center justify-center gap-2 ${
                      paymentMethod === "mobile_money" ? "bg-[#FFBE00]" : "bg-white"
                    }`}
                    data-testid="payment-mobile-btn"
                  >
                    <Phone className="w-4 h-4" />
                    Mobile Money
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setBookingStep("location")}
                  className="flex-1 border border-black py-3 font-bold"
                  data-testid="back-btn"
                >
                  RETOUR
                </button>
                <button
                  onClick={handleBookRide}
                  className="flex-1 brutalist-btn py-3"
                  data-testid="confirm-booking-btn"
                >
                  RÉSERVER
                </button>
              </div>
            </div>
          )}

          {/* Searching for driver */}
          {bookingStep === "searching" && (
            <div className="p-6 text-center" data-testid="booking-searching-step">
              <div className="w-16 h-16 border-4 border-black border-t-[#FFBE00] rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="font-['Outfit'] font-bold text-lg mb-2">RECHERCHE D'UN CHAUFFEUR</h2>
              <p className="text-gray-600 mb-4">Veuillez patienter...</p>
              <button
                onClick={handleCancelRide}
                className="brutalist-btn brutalist-btn-secondary px-6 py-2"
                data-testid="cancel-search-btn"
              >
                ANNULER
              </button>
            </div>
          )}

          {/* Active Ride */}
          {bookingStep === "active" && activeRide && (
            <div className="p-4" data-testid="active-ride-panel">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-['Outfit'] font-bold text-lg">
                  {activeRide.status === "accepted" && "CHAUFFEUR EN ROUTE"}
                  {activeRide.status === "arrived" && "CHAUFFEUR ARRIVÉ"}
                  {activeRide.status === "in_progress" && "EN COURSE"}
                  {activeRide.status === "completed" && "COURSE TERMINÉE"}
                </h2>
                <span className={`status-badge ${
                  activeRide.status === "in_progress" ? "status-active" : "status-pending"
                }`}>
                  {activeRide.status}
                </span>
              </div>
              
              {activeRide.driver && (
                <div className="brutalist-card p-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-200 border border-black flex items-center justify-center">
                      {activeRide.driver.picture ? (
                        <img src={activeRide.driver.picture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{activeRide.driver.name}</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 text-[#FFBE00]" />
                        <span>{activeRide.driver.rating?.toFixed(1) || "5.0"}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowChat(true)}
                      className="p-3 border border-black hover:bg-gray-50"
                      data-testid="open-chat-btn"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {activeRide.driver.vehicle_info && (
                    <div className="mt-3 pt-3 border-t border-black text-sm">
                      <span className="text-gray-600">Véhicule: </span>
                      <span className="font-medium">
                        {activeRide.driver.vehicle_info.make} {activeRide.driver.vehicle_info.model} - {activeRide.driver.vehicle_info.plate}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Prix</span>
                <span className="font-['Outfit'] font-black text-xl">
                  {(activeRide.final_price || activeRide.estimated_price).toLocaleString()} FCFA
                </span>
              </div>
              
              {activeRide.status !== "completed" && activeRide.status !== "cancelled" && (
                <button
                  onClick={handleCancelRide}
                  className="w-full border border-black py-3 font-bold text-red-600 hover:bg-red-50"
                  data-testid="cancel-ride-btn"
                >
                  ANNULER LA COURSE
                </button>
              )}
              
              {activeRide.status === "completed" && (
                <div className="text-center">
                  <p className="mb-3 font-medium">Notez votre chauffeur</p>
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        onClick={() => handleRateRide(activeRide.ride_id, score)}
                        className="w-10 h-10 border border-black flex items-center justify-center hover:bg-[#FFBE00]"
                        data-testid={`rate-${score}-btn`}
                      >
                        <Star className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setActiveRide(null);
                      setBookingStep("location");
                      setPickup(null);
                      setDropoff(null);
                      setEstimate(null);
                      fetchHistory();
                    }}
                    className="brutalist-btn px-6 py-2"
                    data-testid="new-ride-btn"
                  >
                    NOUVELLE COURSE
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Side Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50" data-testid="side-menu">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white border-r border-black slide-up">
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
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="p-4">
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
                  setMenuOpen(false);
                  setBookingStep("location");
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-200"
                data-testid="menu-book-btn"
              >
                <Car className="w-5 h-5" />
                <span className="font-medium">Réserver une course</span>
              </button>
              
              <Drawer>
                <DrawerTrigger asChild>
                  <button
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-200"
                    data-testid="menu-history-btn"
                  >
                    <History className="w-5 h-5" />
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

      {/* Chat Modal */}
      {showChat && activeRide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" data-testid="chat-modal">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowChat(false)}></div>
          <div className="relative w-full max-w-lg bg-white border border-black slide-up">
            <div className="p-4 border-b border-black flex items-center justify-between">
              <h3 className="font-['Outfit'] font-bold">Chat avec le chauffeur</h3>
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

export default PassengerDashboard;
