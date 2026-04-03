import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth, API } from "../../App";
import { 
  Car, MapPin, Clock, DollarSign, Star, MessageCircle, 
  Power, X, LogOut, User, Navigation, Check, Phone, UserCircle, 
  Wallet, Bike, Bell, Home, Menu, ChevronRight, FileText, Shield,
  Settings, HelpCircle, Info, CreditCard, TrendingUp, ArrowUpCircle,
  ArrowDownCircle, Building, XCircle
} from "lucide-react";
import DriverProfile from "./Profile";

// Map component
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_uber-mali-drive/artifacts/apw7o3ih_image.png";

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const pickupIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:24px;height:24px;background:#22c55e;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.4);"></div>`,
  iconSize: [24, 24], iconAnchor: [12, 12]
});
const dropoffIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:24px;height:24px;background:#ef4444;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.4);"></div>`,
  iconSize: [24, 24], iconAnchor: [12, 12]
});
const myLocIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:28px;height:28px;background:#000;border:4px solid #fff;border-radius:50%;box-shadow:0 0 0 8px rgba(0,0,0,.12);display:flex;align-items:center;justify-content:center;"><div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:8px solid #fff;transform:rotate(0deg);margin-top:-2px;"></div></div>`,
  iconSize: [28, 28], iconAnchor: [14, 14]
});

// Auto-fit map to markers
const FitBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [positions, map]);
  return null;
};

const MapView = ({ rideLocation, dropoffLocation, myLocation }) => {
  const center = myLocation ? [myLocation.lat, myLocation.lng]
    : rideLocation ? [rideLocation.lat, rideLocation.lng]
    : [12.6392, -8.0029];

  const positions = [
    ...(rideLocation ? [rideLocation] : []),
    ...(dropoffLocation ? [dropoffLocation] : []),
    ...(myLocation ? [myLocation] : [])
  ];

  return (
    <div className="w-full h-full relative" data-testid="driver-map-container">
      <MapContainer
        center={center}
        zoom={14}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {positions.length > 1 && <FitBounds positions={positions} />}
        {myLocation && (
          <Marker position={[myLocation.lat, myLocation.lng]} icon={myLocIcon}>
            <Popup>Ma position</Popup>
          </Marker>
        )}
        {rideLocation && (
          <Marker position={[rideLocation.lat, rideLocation.lng]} icon={pickupIcon}>
            <Popup>{rideLocation.address || "Point de prise en charge"}</Popup>
          </Marker>
        )}
        {dropoffLocation && (
          <Marker position={[dropoffLocation.lat, dropoffLocation.lng]} icon={dropoffIcon}>
            <Popup>{dropoffLocation.address || "Destination"}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

/* ========== MAIN DRIVER DASHBOARD ========== */
const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
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
    make: "", model: "", year: "", plate: "", color: "", vehicle_category: "car"
  });
  
  // Chat
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  
  // Profile
  const [showProfile, setShowProfile] = useState(false);

  // Notifications
  const [hasNewRides, setHasNewRides] = useState(false);
  const [ringing, setRinging] = useState(false);
  const prevPendingCountRef = useRef(0);
  const ringIntervalRef = useRef(null);
  const audioRef = useRef(null);
  const audioUnlockedRef = useRef(false);

  // GPS state
  const [myLocation, setMyLocation] = useState(null);

  // Wallet data for Revenus tab
  const [walletData, setWalletData] = useState(null);
  const [walletStats, setWalletStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("orange_money");
  const [withdrawAccount, setWithdrawAccount] = useState("");

  // ====== AUDIO NOTIFICATIONS ======
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    const audio = new Audio("/ride_alert.wav");
    audio.preload = "auto";
    audio.loop = false;
    audioRef.current = audio;
    return () => {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  const initAudio = () => {
    if (audioRef.current && !audioUnlockedRef.current) {
      audioRef.current.volume = 1.0;
      const p = audioRef.current.play();
      if (p) p.then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioUnlockedRef.current = true;
        console.log("Audio unlocked successfully");
      }).catch((e) => console.log("Audio unlock failed:", e));
    }
  };

  const playAlertSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 1.0;
        const p = audioRef.current.play();
        if (p) p.catch(() => {
          try { const fb = new Audio("/ride_alert.wav"); fb.volume = 1.0; fb.play().catch(() => {}); } catch (e) {}
        });
      }
      if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 500]);
    } catch (e) {}
  };

  const startRinging = () => {
    setRinging(true);
    playAlertSound();
    ringIntervalRef.current = setInterval(() => playAlertSound(), 3000);
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("SIRA TAXI", {
          body: "Nouvelle course disponible !",
          icon: "/logo192.png", tag: "new-ride", requireInteraction: true, vibrate: [300, 100, 300, 100, 500]
        });
      } catch (e) {}
    }
  };

  const stopRinging = () => {
    setRinging(false);
    if (ringIntervalRef.current) { clearInterval(ringIntervalRef.current); ringIntervalRef.current = null; }
    if (navigator.vibrate) navigator.vibrate(0);
  };

  // ====== GPS TRACKING ======
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMyLocation(loc);
        axios.put(`${API}/users/location`, loc).catch(() => {});
      },
      (err) => console.log("GPS error:", err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // ====== DATA FETCHING ======
  const activeRideRef = useRef(activeRide);
  useEffect(() => { activeRideRef.current = activeRide; }, [activeRide]);

  const fetchActiveRide = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/rides/active`);
      if (response.data) {
        setActiveRide(response.data);
        if (response.data.passenger_id) fetchMessages(response.data.ride_id);
      } else {
        if (activeRideRef.current) { setActiveRide(null); fetchHistory(); fetchWalletBalance(); }
      }
    } catch (error) { console.error("Error fetching active ride:", error); }
  }, []);

  const fetchPendingRides = useCallback(async () => {
    if (!isOnline) return;
    try {
      const response = await axios.get(`${API}/rides/pending`);
      const newRides = response.data;
      if (newRides.length > prevPendingCountRef.current && prevPendingCountRef.current >= 0) {
        setHasNewRides(true);
        startRinging();
        if (newRides.length > 0) toast.success(`${newRides.length - prevPendingCountRef.current} nouvelle(s) course(s) !`);
      }
      if (newRides.length === 0 && prevPendingCountRef.current > 0) stopRinging();
      prevPendingCountRef.current = newRides.length;
      setPendingRides(newRides);
    } catch (error) { console.error("Error fetching pending rides:", error); }
  }, [isOnline]);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/rides/history`);
      setRideHistory(response.data);
      const totalEarnings = response.data.filter(r => r.status === "completed").reduce((sum, r) => sum + (r.final_price || 0), 0);
      setEarnings(totalEarnings);
    } catch (error) { console.error("Error fetching history:", error); }
  }, []);

  const fetchWalletBalance = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/wallet`);
      setWalletBalance(response.data.balance || 0);
      setWalletData(response.data);
    } catch (error) { console.error("Error fetching wallet:", error); }
  }, []);

  const fetchWalletFull = useCallback(async () => {
    try {
      const [walletRes, statsRes, txRes] = await Promise.all([
        axios.get(`${API}/wallet`), axios.get(`${API}/wallet/stats`), axios.get(`${API}/wallet/transactions`)
      ]);
      setWalletData(walletRes.data);
      setWalletBalance(walletRes.data.balance || 0);
      setWalletStats(statsRes.data);
      setTransactions(txRes.data);
    } catch (error) { console.error("Error fetching wallet:", error); }
  }, []);

  const fetchMessages = async (rideId) => {
    try { const r = await axios.get(`${API}/chat/${rideId}`); setMessages(r.data); } catch (e) {}
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchActiveRide();
      await fetchHistory();
      await fetchWalletBalance();
      if (isOnline) await fetchPendingRides();
      setLoading(false);
    };
    init();
    const interval = setInterval(() => {
      fetchActiveRide();
      if (isOnline && !activeRideRef.current) fetchPendingRides();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchActiveRide, fetchPendingRides, fetchHistory, fetchWalletBalance, isOnline]);

  // Fetch full wallet data when switching to revenus tab
  useEffect(() => {
    if (activeTab === "revenus") fetchWalletFull();
  }, [activeTab, fetchWalletFull]);

  // ====== ACTIONS ======
  const toggleOnlineStatus = async () => {
    try {
      initAudio();
      const response = await axios.put(`${API}/users/status`);
      setIsOnline(response.data.is_online);
      toast.success(response.data.is_online ? "Vous êtes en ligne" : "Vous êtes hors ligne");
      if (response.data.is_online) { playAlertSound(); fetchPendingRides(); } else { stopRinging(); }
    } catch (error) { toast.error("Erreur lors du changement de statut"); }
  };

  const handleAcceptRide = async (rideId) => {
    try {
      stopRinging();
      const response = await axios.put(`${API}/rides/${rideId}/accept`);
      setActiveRide(response.data);
      setPendingRides([]);
      setHasNewRides(false);
      prevPendingCountRef.current = 0;
      toast.success("Course acceptée!");
      setActiveTab("home");
    } catch (error) { toast.error(error.response?.data?.detail || "Erreur"); }
  };

  const handleUpdateStatus = async (status) => {
    if (!activeRide) return;
    try {
      const response = await axios.put(`${API}/rides/${activeRide.ride_id}/status`, { status });
      setActiveRide(response.data);
      if (status === "completed") { toast.success("Course terminée!"); setActiveRide(null); fetchHistory(); if (isOnline) fetchPendingRides(); }
      else if (status === "arrived") toast.success("Vous êtes arrivé");
      else if (status === "in_progress") toast.success("Course en cours");
    } catch (error) { toast.error("Erreur"); }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeRide) return;
    try { await axios.post(`${API}/chat/${activeRide.ride_id}`, { content: newMessage }); setNewMessage(""); fetchMessages(activeRide.ride_id); } catch (e) { toast.error("Erreur"); }
  };

  const handleUpdateVehicle = async () => {
    try {
      await axios.put(`${API}/users/vehicle`, vehicleInfo);
      toast.success("Véhicule mis à jour");
      setShowVehicleModal(false);
    } catch (error) { toast.error("Erreur"); }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) { toast.error("Montant invalide"); return; }
    if (parseFloat(withdrawAmount) < 1000) { toast.error("Minimum: 1000 FCFA"); return; }
    if (!withdrawAccount) { toast.error("Numéro requis"); return; }
    if (parseFloat(withdrawAmount) > (walletData?.balance || 0)) { toast.error("Solde insuffisant"); return; }
    setWithdrawing(true);
    try {
      await axios.post(`${API}/wallet/withdraw`, { amount: parseFloat(withdrawAmount), method: withdrawMethod, phone_or_account: withdrawAccount });
      toast.success("Demande de retrait soumise!");
      setShowWithdraw(false); setWithdrawAmount(""); setWithdrawAccount("");
      fetchWalletFull();
    } catch (error) { toast.error(error.response?.data?.detail || "Erreur"); } finally { setWithdrawing(false); }
  };

  const handleLogout = async () => { await logout(); navigate("/"); };

  // Show profile page
  if (showProfile) return <DriverProfile onClose={() => setShowProfile(false)} />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <img src={LOGO_URL} alt="SIRA TAXI" className="h-20 w-auto mx-auto mb-4" />
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  const completedRides = rideHistory.filter(r => r.status === "completed");

  return (
    <div className="h-screen flex flex-col bg-white" data-testid="driver-dashboard">
      {/* Ringing Alert Banner - Always on top */}
      {ringing && (
        <div className="bg-[#FFBE00] px-4 py-3 flex items-center justify-between z-[600]" data-testid="ringing-banner">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-black animate-bounce" />
            <span className="font-bold text-sm">NOUVELLE COURSE DISPONIBLE !</span>
          </div>
          <button onClick={stopRinging} className="bg-black text-white px-4 py-1.5 font-bold text-sm rounded-full" data-testid="stop-ringing-btn">
            ARRÊTER
          </button>
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {/* ===== TAB: ACCUEIL ===== */}
        {activeTab === "home" && (
          <div className="h-full flex flex-col">
            {/* Status Header */}
            <div className="px-5 pt-5 pb-3 bg-white z-10">
              <h1 className="font-['Outfit'] font-black text-2xl text-black" data-testid="driver-status-title">
                {isOnline ? (activeRide ? "Course en cours" : "Vous êtes en ligne") : "Vous êtes hors ligne"}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {isOnline ? (activeRide ? "Bonne route !" : "En attente de courses...") : "Tout est prêt ?"}
              </p>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative">
              <MapView 
                rideLocation={activeRide?.pickup_location} 
                dropoffLocation={activeRide?.dropoff_location}
                myLocation={myLocation}
              />
            </div>

            {/* Bottom Section */}
            <div className="bg-white z-[500]">
              {/* Active Ride Panel */}
              {activeRide && (
                <div className="p-4 border-t border-gray-200" data-testid="active-ride-panel">
                  {activeRide.passenger && (
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {activeRide.passenger.picture ? <img src={activeRide.passenger.picture} alt="" className="w-full h-full rounded-full object-cover" /> : <User className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{activeRide.passenger.name}</p>
                        <p className="text-xs text-gray-500">{activeRide.status === "accepted" ? "En route" : activeRide.status === "arrived" ? "Arrivé" : "En cours"}</p>
                      </div>
                      <span className="font-['Outfit'] font-black text-lg">{activeRide.estimated_price?.toLocaleString()} FCFA</span>
                      <button onClick={() => setShowChat(true)} className="p-2 bg-gray-100 rounded-full" data-testid="open-chat-btn"><MessageCircle className="w-5 h-5" /></button>
                    </div>
                  )}
                  <div className="flex gap-2 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span>{activeRide.pickup_location?.address}</span>
                    <span className="text-gray-300">→</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span>{activeRide.dropoff_location?.address}</span>
                  </div>
                  {activeRide.status === "accepted" && (
                    <button onClick={() => handleUpdateStatus("arrived")} className="w-full bg-black text-white py-4 font-bold text-base rounded-lg" data-testid="arrived-btn">
                      <Check className="w-5 h-5 inline mr-2" />JE SUIS ARRIVÉ
                    </button>
                  )}
                  {activeRide.status === "arrived" && (
                    <button onClick={() => handleUpdateStatus("in_progress")} className="w-full bg-black text-white py-4 font-bold text-base rounded-lg" data-testid="start-ride-btn">
                      <Navigation className="w-5 h-5 inline mr-2" />DÉMARRER LA COURSE
                    </button>
                  )}
                  {activeRide.status === "in_progress" && (
                    <button onClick={() => handleUpdateStatus("completed")} className="w-full bg-green-600 text-white py-4 font-bold text-base rounded-lg" data-testid="complete-ride-btn">
                      <Check className="w-5 h-5 inline mr-2" />TERMINER LA COURSE
                    </button>
                  )}
                </div>
              )}

              {/* Pending Rides (when online, no active ride) */}
              {!activeRide && isOnline && pendingRides.length > 0 && (
                <div className="p-4 border-t border-gray-200 max-h-52 overflow-y-auto" data-testid="pending-rides-panel">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Courses disponibles ({pendingRides.length})</p>
                  {pendingRides.map((ride) => (
                    <div key={ride.ride_id} className="bg-gray-50 rounded-xl p-3 mb-2 flex items-center gap-3" data-testid="pending-ride-card">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ride.vehicle_type === "moto" ? "bg-orange-100" : "bg-blue-100"}`}>
                        {ride.vehicle_type === "moto" ? <Bike className="w-5 h-5 text-orange-600" /> : <Car className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{ride.pickup_location?.address}</p>
                        <p className="text-xs text-gray-500 truncate">→ {ride.dropoff_location?.address}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm">{ride.estimated_price?.toLocaleString()} F</p>
                        <button onClick={() => handleAcceptRide(ride.ride_id)} className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full mt-1" data-testid="accept-ride-btn">ACCEPTER</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* "Passez en ligne" button OR "En ligne" indicator */}
              {!activeRide && (
                <div className="px-4 pb-4 pt-2">
                  <button
                    onClick={toggleOnlineStatus}
                    className={`w-full py-4 rounded-full font-bold text-base flex items-center justify-center gap-3 transition-all ${
                      isOnline ? "bg-green-600 text-white" : "bg-black text-white"
                    }`}
                    data-testid="toggle-online-btn"
                  >
                    {isOnline ? (
                      <><div className="w-3 h-3 bg-white rounded-full animate-pulse"></div> Vous êtes en ligne</>
                    ) : (
                      <><Power className="w-5 h-5" /> Passez en ligne</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== TAB: REVENUS ===== */}
        {activeTab === "revenus" && (
          <div className="h-full overflow-y-auto pb-20" data-testid="revenus-tab">
            <div className="px-5 pt-5 pb-3">
              <h1 className="font-['Outfit'] font-black text-2xl">Revenus</h1>
            </div>

            <div className="px-4">
              {/* Balance Card */}
              <div className="bg-black rounded-2xl p-5 mb-4" data-testid="balance-card">
                <p className="text-gray-400 text-sm">Solde disponible</p>
                <p className="font-['Outfit'] font-black text-4xl text-white mt-1">
                  {(walletData?.balance || walletBalance || 0).toLocaleString()} <span className="text-lg text-gray-400">FCFA</span>
                </p>
                <button
                  onClick={() => setShowWithdraw(true)}
                  disabled={(walletData?.balance || 0) < 1000}
                  className="mt-4 w-full bg-[#FFBE00] text-black py-3.5 rounded-xl font-bold disabled:opacity-40"
                  data-testid="withdraw-btn"
                >
                  <ArrowUpCircle className="w-5 h-5 inline mr-2" />Retirer de l'argent
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Aujourd'hui", value: walletStats?.today_earnings || 0, color: "text-green-600" },
                  { label: "Cette semaine", value: walletStats?.week_earnings || 0, color: "text-green-600" },
                  { label: "Ce mois", value: walletStats?.month_earnings || 0, color: "text-green-600" },
                  { label: "Courses", value: completedRides.length, color: "text-black", suffix: "" },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className={`font-['Outfit'] font-black text-xl ${s.color}`}>
                      {typeof s.value === "number" ? s.value.toLocaleString() : s.value}{s.suffix !== "" ? " FCFA" : ""}
                    </p>
                  </div>
                ))}
              </div>

              {/* Transactions */}
              <div className="mb-4">
                <h2 className="font-bold text-lg mb-3">Historique</h2>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Wallet className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Aucune transaction</p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.transaction_id} className="flex items-center gap-3 py-3 border-b border-gray-100">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.amount > 0 ? "bg-green-50" : "bg-red-50"}`}>
                        {tx.type === "earning" ? <ArrowDownCircle className="w-5 h-5 text-green-600" /> :
                         tx.type === "withdrawal" ? <ArrowUpCircle className="w-5 h-5 text-red-600" /> :
                         <TrendingUp className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{tx.description}</p>
                        <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleString('fr-FR')}</p>
                      </div>
                      <p className={`font-bold text-sm ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} F
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: BOÎTE DE RÉCEPTION ===== */}
        {activeTab === "inbox" && (
          <div className="h-full overflow-y-auto pb-20" data-testid="inbox-tab">
            <div className="px-5 pt-5 pb-3">
              <h1 className="font-['Outfit'] font-black text-2xl">Boîte de réception</h1>
            </div>

            <div className="px-4">
              {/* Active ride chat */}
              {activeRide && (
                <button onClick={() => setShowChat(true)} className="w-full bg-[#FFBE00] rounded-xl p-4 flex items-center gap-3 mb-4" data-testid="inbox-active-chat">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-[#FFBE00]" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-sm">Chat avec {activeRide.passenger?.name || "passager"}</p>
                    <p className="text-xs text-gray-700">Course en cours - Touchez pour ouvrir</p>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Pending ride notifications */}
              {pendingRides.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Nouvelles courses</p>
                  {pendingRides.map((ride) => (
                    <div key={ride.ride_id} className="bg-gray-50 rounded-xl p-4 mb-2">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ride.vehicle_type === "moto" ? "bg-orange-100" : "bg-blue-100"}`}>
                          {ride.vehicle_type === "moto" ? <Bike className="w-4 h-4 text-orange-600" /> : <Car className="w-4 h-4 text-blue-600" />}
                        </div>
                        <p className="font-bold text-sm flex-1">Nouvelle demande {ride.vehicle_type === "moto" ? "MOTO" : "TAXI"}</p>
                        <span className="font-bold text-[#FFBE00]">{ride.estimated_price?.toLocaleString()} F</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1"><span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>{ride.pickup_location?.address}</p>
                      <p className="text-xs text-gray-500 mb-2"><span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>{ride.dropoff_location?.address}</p>
                      <button onClick={() => handleAcceptRide(ride.ride_id)} className="w-full bg-black text-white py-2.5 rounded-lg font-bold text-sm" data-testid="inbox-accept-btn">ACCEPTER</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent ride history as notifications */}
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Activité récente</p>
              {rideHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Aucune notification</p>
                </div>
              ) : (
                rideHistory.slice(0, 10).map((ride) => (
                  <div key={ride.ride_id} className="flex items-center gap-3 py-3 border-b border-gray-100">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ride.status === "completed" ? "bg-green-50" : "bg-red-50"}`}>
                      {ride.status === "completed" ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{ride.pickup_location?.address} → {ride.dropoff_location?.address}</p>
                      <p className="text-xs text-gray-400">{new Date(ride.created_at).toLocaleString('fr-FR')}</p>
                    </div>
                    <p className="font-bold text-sm">{(ride.final_price || ride.estimated_price)?.toLocaleString()} F</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ===== TAB: MENU ===== */}
        {activeTab === "menu" && (
          <div className="h-full overflow-y-auto pb-20" data-testid="menu-tab">
            {/* Profile Card */}
            <div className="px-5 pt-5 pb-4">
              <div className="bg-gray-50 rounded-2xl p-5 flex items-center gap-4" data-testid="menu-profile-card">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  {user?.picture ? <img src={user.picture} alt="" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-gray-400" />}
                </div>
                <div>
                  <p className="font-['Outfit'] font-black text-xl">{user?.name || "Chauffeur"}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Star className="w-4 h-4 text-[#FFBE00] fill-[#FFBE00]" />
                    <span className="font-bold text-sm">{(user?.rating || 5).toFixed(1)}</span>
                    <span className="text-gray-400 text-sm">• {completedRides.length} courses</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-5 pb-4 grid grid-cols-3 gap-3">
              <button className="bg-gray-50 rounded-xl py-4 flex flex-col items-center gap-2" data-testid="menu-help-btn">
                <HelpCircle className="w-6 h-6 text-gray-600" />
                <span className="text-xs font-medium">Aide</span>
              </button>
              <button className="bg-gray-50 rounded-xl py-4 flex flex-col items-center gap-2" data-testid="menu-security-btn">
                <Shield className="w-6 h-6 text-gray-600" />
                <span className="text-xs font-medium">Sécurité</span>
              </button>
              <button onClick={() => setShowProfile(true)} className="bg-gray-50 rounded-xl py-4 flex flex-col items-center gap-2" data-testid="menu-settings-btn">
                <Settings className="w-6 h-6 text-gray-600" />
                <span className="text-xs font-medium">Paramètres</span>
              </button>
            </div>

            {/* Menu Sections */}
            <div className="px-5">
              {/* Gérer */}
              <p className="font-bold text-lg mb-2 mt-2">Gérer</p>
              <MenuRow icon={<Car className="w-5 h-5 text-gray-500" />} label="Véhicules" subtitle={vehicleInfo.make ? `${vehicleInfo.make} ${vehicleInfo.model}` : "Non configuré"} onClick={() => setShowVehicleModal(true)} testId="menu-vehicle-btn" />
              <MenuRow icon={<FileText className="w-5 h-5 text-gray-500" />} label="Documents" onClick={() => setShowProfile(true)} testId="menu-documents-btn" />

              {/* Argent */}
              <p className="font-bold text-lg mb-2 mt-5">Argent</p>
              <MenuRow icon={<Wallet className="w-5 h-5 text-gray-500" />} label="Portefeuille" subtitle={`${walletBalance.toLocaleString()} FCFA`} onClick={() => setActiveTab("revenus")} testId="menu-wallet-btn" />
              <MenuRow icon={<CreditCard className="w-5 h-5 text-gray-500" />} label="Modes de versement" onClick={() => setShowWithdraw(true)} testId="menu-payment-btn" />

              {/* Ressources */}
              <p className="font-bold text-lg mb-2 mt-5">Ressources</p>
              <MenuRow icon={<Info className="w-5 h-5 text-gray-500" />} label="À propos" onClick={() => navigate("/contact")} testId="menu-about-btn" />

              {/* Logout */}
              <div className="mt-6 mb-4 pt-4 border-t border-gray-200">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 py-3 text-red-600" data-testid="logout-btn">
                  <LogOut className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-bold text-sm">Déconnexion</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== BOTTOM TAB BAR ===== */}
      <div className="shrink-0 bg-white border-t border-gray-200 z-[600]" data-testid="bottom-tab-bar">
        <div className="flex">
          <TabButton icon={<Home className="w-6 h-6" />} label="Accueil" active={activeTab === "home"} onClick={() => setActiveTab("home")} badge={null} testId="tab-home" />
          <TabButton icon={<DollarSign className="w-6 h-6" />} label="Revenus" active={activeTab === "revenus"} onClick={() => setActiveTab("revenus")} badge={null} testId="tab-revenus" />
          <TabButton icon={<Bell className="w-6 h-6" />} label="Messages" active={activeTab === "inbox"} onClick={() => { setActiveTab("inbox"); setHasNewRides(false); if (ringing) stopRinging(); }} badge={hasNewRides ? pendingRides.length : null} testId="tab-inbox" />
          <TabButton icon={<Menu className="w-6 h-6" />} label="Menu" active={activeTab === "menu"} onClick={() => setActiveTab("menu")} badge={null} testId="tab-menu" />
        </div>
        <div className="h-8"></div>
      </div>

      {/* ===== MODALS ===== */}

      {/* Vehicle Info Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-[700] flex items-end sm:items-center justify-center" data-testid="vehicle-modal">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowVehicleModal(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Outfit'] font-bold text-xl">Véhicule</h3>
              <button onClick={() => setShowVehicleModal(false)} className="p-2 bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Catégorie</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setVehicleInfo({ ...vehicleInfo, vehicle_category: "car" })} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${vehicleInfo.vehicle_category === "car" ? "border-black bg-gray-50" : "border-gray-200"}`} data-testid="modal-vehicle-car-btn"><Car className="w-8 h-8" /><span className="font-bold text-sm">VOITURE</span></button>
                  <button type="button" onClick={() => setVehicleInfo({ ...vehicleInfo, vehicle_category: "moto" })} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${vehicleInfo.vehicle_category === "moto" ? "border-black bg-gray-50" : "border-gray-200"}`} data-testid="modal-vehicle-moto-btn"><Bike className="w-8 h-8" /><span className="font-bold text-sm">MOTO</span></button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Marque</label>
                <input type="text" value={vehicleInfo.make} onChange={(e) => setVehicleInfo({ ...vehicleInfo, make: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-black focus:ring-0 outline-none" placeholder="Toyota, Mercedes..." data-testid="vehicle-make-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Modèle</label>
                <input type="text" value={vehicleInfo.model} onChange={(e) => setVehicleInfo({ ...vehicleInfo, model: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-black focus:ring-0 outline-none" placeholder="Corolla..." data-testid="vehicle-model-input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium mb-1">Année</label><input type="text" value={vehicleInfo.year} onChange={(e) => setVehicleInfo({ ...vehicleInfo, year: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-black focus:ring-0 outline-none" placeholder="2020" data-testid="vehicle-year-input" /></div>
                <div><label className="block text-sm font-medium mb-1">Couleur</label><input type="text" value={vehicleInfo.color} onChange={(e) => setVehicleInfo({ ...vehicleInfo, color: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-black focus:ring-0 outline-none" placeholder="Blanc" data-testid="vehicle-color-input" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Plaque</label>
                <input type="text" value={vehicleInfo.plate} onChange={(e) => setVehicleInfo({ ...vehicleInfo, plate: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-black focus:ring-0 outline-none" placeholder="AB-1234-ML" data-testid="vehicle-plate-input" />
              </div>
            </div>
            <button onClick={handleUpdateVehicle} className="w-full bg-black text-white py-4 rounded-xl font-bold mt-5" data-testid="save-vehicle-btn">ENREGISTRER</button>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-[700] flex items-end sm:items-center justify-center" data-testid="withdraw-modal">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowWithdraw(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl">Retirer de l'argent</h3>
              <button onClick={() => setShowWithdraw(false)} className="p-2 bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-500">Solde</p>
              <p className="font-['Outfit'] font-black text-2xl">{(walletData?.balance || walletBalance || 0).toLocaleString()} FCFA</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Montant (FCFA)</label>
              <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:border-black outline-none" placeholder="5000" min="1000" data-testid="withdraw-amount-input" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Mode de retrait</label>
              <div className="grid grid-cols-3 gap-2">
                {[{k:"orange_money",l:"Orange Money",i:<Phone className="w-5 h-5"/>},{k:"moov_money",l:"Moov Money",i:<Phone className="w-5 h-5"/>},{k:"bank_transfer",l:"Banque",i:<Building className="w-5 h-5"/>}].map(m=>(
                  <button key={m.k} type="button" onClick={() => setWithdrawMethod(m.k)} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 text-xs font-medium ${withdrawMethod === m.k ? "border-black bg-gray-50" : "border-gray-200"}`} data-testid={`method-${m.k}-btn`}>{m.i}{m.l}</button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">{withdrawMethod === "bank_transfer" ? "Numéro de compte" : "Numéro de téléphone"}</label>
              <input type="text" value={withdrawAccount} onChange={(e) => setWithdrawAccount(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-black outline-none" placeholder={withdrawMethod === "bank_transfer" ? "ML001 XXXX" : "+223 XX XX XX XX"} data-testid="withdraw-account-input" />
            </div>
            <button onClick={handleWithdraw} disabled={withdrawing} className="w-full bg-black text-white py-4 rounded-xl font-bold disabled:opacity-40" data-testid="confirm-withdraw-btn">{withdrawing ? "TRAITEMENT..." : "CONFIRMER"}</button>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && activeRide && (
        <div className="fixed inset-0 z-[700] flex flex-col" data-testid="chat-modal">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowChat(false)}></div>
          <div className="relative mt-auto w-full max-w-lg mx-auto bg-white rounded-t-2xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold">Chat avec {activeRide.passenger?.name || "passager"}</h3>
              <button onClick={() => setShowChat(false)} className="p-2 bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="h-64 overflow-y-auto p-4">
              {messages.length === 0 ? <p className="text-center text-gray-400 text-sm">Aucun message</p> : messages.map((msg) => (
                <div key={msg.message_id} className={`mb-3 ${msg.sender_id === user?.user_id ? "text-right" : ""}`}>
                  <div className={`inline-block p-3 max-w-[80%] rounded-2xl ${msg.sender_id === user?.user_id ? "bg-black text-white" : "bg-gray-100"}`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-50">{new Date(msg.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Votre message..." className="flex-1 border border-gray-300 rounded-full px-4 py-3 outline-none focus:border-black" onKeyPress={(e) => e.key === "Enter" && handleSendMessage()} data-testid="chat-input" />
              <button onClick={handleSendMessage} className="bg-black text-white px-5 rounded-full font-bold" data-testid="send-message-btn">Envoyer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===== HELPER COMPONENTS ===== */
const TabButton = ({ icon, label, active, onClick, badge, testId }) => (
  <button onClick={onClick} className={`flex-1 py-3 flex flex-col items-center gap-0.5 relative transition-colors ${active ? "text-black" : "text-gray-400"}`} data-testid={testId}>
    <div className="relative">
      {icon}
      {badge > 0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{badge}</span>}
    </div>
    <span className="text-[10px] font-medium">{label}</span>
    {active && <div className="absolute bottom-0 left-1/3 right-1/3 h-0.5 bg-black rounded-full"></div>}
  </button>
);

const MenuRow = ({ icon, label, subtitle, onClick, testId }) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 py-3.5 border-b border-gray-100 text-left" data-testid={testId}>
    {icon}
    <div className="flex-1">
      <p className="font-medium text-sm">{label}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
    <ChevronRight className="w-5 h-5 text-gray-300" />
  </button>
);

export default DriverDashboard;
