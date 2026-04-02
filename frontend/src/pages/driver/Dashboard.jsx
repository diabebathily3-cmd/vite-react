import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth, API } from "../../App";
import { 
  Car, MapPin, Clock, DollarSign, Star, MessageCircle, 
  Power, Menu, X, LogOut, User, Navigation, Check, Phone, UserCircle, Wallet, Bike, Bell
} from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "../../components/ui/drawer";
import DriverProfile from "./Profile";
import DriverWallet from "./Wallet";

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
  html: `<div style="width:22px;height:22px;background:#FFBE00;border:3px solid #000;border-radius:50%;box-shadow:0 0 0 6px rgba(255,190,0,.25);"></div>`,
  iconSize: [22, 22], iconAnchor: [11, 11]
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
    color: "",
    vehicle_category: "car"
  });
  
  // Chat
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(false);

  // Notifications
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNewRides, setHasNewRides] = useState(false);
  const [ringing, setRinging] = useState(false);
  const prevPendingCountRef = useRef(0);
  const ringIntervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  // GPS state
  const [myLocation, setMyLocation] = useState(null);

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    return () => {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    };
  }, []);

  // Initialize AudioContext on user interaction (required by browsers)
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  // Play loud alert using Web Audio API (works on mobile)
  const playAlertSound = () => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.9, now);

      // 3 ascending tones - LOUD
      const freqs = [880, 1100, 1320];
      const durations = [0.18, 0.18, 0.3];
      let t = now;

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.connect(oscGain);
        oscGain.connect(gain);
        osc.type = "square"; // Square wave = louder + more piercing
        osc.frequency.setValueAtTime(freq, t);
        oscGain.gain.setValueAtTime(0.8, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + durations[i]);
        osc.start(t);
        osc.stop(t + durations[i]);
        t += durations[i] + 0.06;
      });

      // Second repeat higher
      const freqs2 = [1100, 1320, 1568];
      freqs2.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.connect(oscGain);
        oscGain.connect(gain);
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, t);
        oscGain.gain.setValueAtTime(0.9, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + durations[i]);
        osc.start(t);
        osc.stop(t + durations[i]);
        t += durations[i] + 0.06;
      });

      // Vibrate phone
      if (navigator.vibrate) {
        navigator.vibrate([300, 100, 300, 100, 500]);
      }
    } catch (e) {
      console.log("Audio error:", e);
    }
  };

  const startRinging = () => {
    setRinging(true);
    playAlertSound();
    // Repeat every 3 seconds until stopped
    ringIntervalRef.current = setInterval(() => {
      playAlertSound();
    }, 3000);

    // Browser push notification
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("SIRA TAXI", {
          body: "Nouvelle course disponible !",
          icon: "/logo192.png",
          tag: "new-ride",
          requireInteraction: true,
          vibrate: [300, 100, 300, 100, 500]
        });
      } catch (e) {}
    }
  };

  const stopRinging = () => {
    setRinging(false);
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    if (navigator.vibrate) navigator.vibrate(0);
  };

  // Get driver's GPS position and send to backend
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMyLocation(loc);
        // Send location to backend for live tracking
        axios.put(`${API}/users/location`, loc).catch(() => {});
      },
      (err) => console.log("GPS error:", err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const activeRideRef = useRef(activeRide);
  useEffect(() => {
    activeRideRef.current = activeRide;
  }, [activeRide]);

  const fetchActiveRide = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/rides/active`);
      if (response.data) {
        setActiveRide(response.data);
        if (response.data.passenger_id) {
          fetchMessages(response.data.ride_id);
        }
      } else {
        if (activeRideRef.current) {
          setActiveRide(null);
          fetchHistory();
          fetchWalletBalance();
        }
      }
    } catch (error) {
      console.error("Error fetching active ride:", error);
    }
  }, []);

  const fetchPendingRides = useCallback(async () => {
    if (!isOnline) return;
    try {
      const response = await axios.get(`${API}/rides/pending`);
      const newRides = response.data;
      // Detect new rides and ring
      if (newRides.length > prevPendingCountRef.current && prevPendingCountRef.current >= 0) {
        setHasNewRides(true);
        startRinging();
        if (newRides.length > 0) {
          toast.success(`${newRides.length - prevPendingCountRef.current} nouvelle(s) course(s) disponible(s) !`);
        }
      }
      // Stop ringing if no more pending rides
      if (newRides.length === 0 && prevPendingCountRef.current > 0) {
        stopRinging();
      }
      prevPendingCountRef.current = newRides.length;
      setPendingRides(newRides);
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
      if (isOnline) {
        await fetchPendingRides();
      }
      setLoading(false);
    };
    init();
    
    // Poll for updates
    const interval = setInterval(() => {
      fetchActiveRide();
      if (isOnline && !activeRideRef.current) {
        fetchPendingRides();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [fetchActiveRide, fetchPendingRides, fetchHistory, fetchWalletBalance, isOnline]);

  const toggleOnlineStatus = async () => {
    try {
      // Initialize audio on user gesture (required by browsers)
      initAudio();
      
      const response = await axios.put(`${API}/users/status`);
      setIsOnline(response.data.is_online);
      toast.success(response.data.is_online ? "Vous êtes maintenant en ligne — les notifications sont activées" : "Vous êtes maintenant hors ligne");
      if (response.data.is_online) {
        // Play a quick test beep so user knows sound works
        playAlertSound();
        fetchPendingRides();
      } else {
        stopRinging();
      }
    } catch (error) {
      toast.error("Erreur lors du changement de statut");
    }
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
          
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setHasNewRides(false); if (ringing) stopRinging(); }}
              className={`p-2 border border-[#FFBE00] relative ${hasNewRides ? "animate-bounce" : ""}`}
              data-testid="notification-bell-btn"
            >
              <Bell className={`w-5 h-5 ${hasNewRides ? "text-[#FFBE00]" : "text-white"}`} />
              {pendingRides.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full" data-testid="notification-badge">
                  {pendingRides.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 max-h-96 overflow-y-auto" data-testid="notification-dropdown">
                <div className="p-3 border-b-2 border-black bg-[#FFBE00]">
                  <p className="font-bold text-sm">COURSES DISPONIBLES ({pendingRides.length})</p>
                </div>
                {pendingRides.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">Aucune course disponible</div>
                ) : (
                  pendingRides.map(ride => (
                    <div key={ride.ride_id} className="p-3 border-b border-gray-200 hover:bg-gray-50" data-testid="notification-ride-item">
                      <div className="flex items-center gap-2 mb-1">
                        {ride.vehicle_type === "moto" ? <Bike className="w-4 h-4 text-orange-600" /> : <Car className="w-4 h-4 text-blue-600" />}
                        <span className="font-bold text-sm">{ride.vehicle_type === "moto" ? "MOTO" : "TAXI"}</span>
                        <span className="ml-auto font-bold text-[#FFBE00]">{ride.estimated_price?.toLocaleString()} FCFA</span>
                      </div>
                      <p className="text-xs text-gray-600 flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> {ride.pickup_location?.address}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span> {ride.dropoff_location?.address}</p>
                      <button
                        onClick={() => { handleAcceptRide(ride.ride_id); setShowNotifications(false); }}
                        className="mt-2 w-full bg-[#FFBE00] border border-black py-1.5 font-bold text-sm hover:bg-yellow-400"
                        data-testid="notif-accept-btn"
                      >
                        ACCEPTER
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 border border-black hover:bg-gray-50"
            data-testid="menu-btn"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Ringing Alert Banner */}
      {ringing && (
        <div className="bg-[#FFBE00] border-b-2 border-black px-4 py-3 flex items-center justify-between animate-pulse" data-testid="ringing-banner">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-black animate-bounce" />
            <span className="font-bold text-sm">NOUVELLE COURSE DISPONIBLE !</span>
          </div>
          <button
            onClick={stopRinging}
            className="bg-black text-[#FFBE00] px-4 py-1.5 font-bold text-sm border border-black"
            data-testid="stop-ringing-btn"
          >
            ARRÊTER
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 relative">
        <MapView 
          rideLocation={activeRide?.pickup_location} 
          dropoffLocation={activeRide?.dropoff_location}
          myLocation={myLocation}
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
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-black pb-14 z-[500]">
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
              {/* Vehicle Category Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Catégorie de véhicule</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVehicleInfo({ ...vehicleInfo, vehicle_category: "car" })}
                    className={`p-4 border-2 border-black flex flex-col items-center gap-2 transition-all ${
                      vehicleInfo.vehicle_category === "car"
                        ? "bg-[#FFBE00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white hover:bg-gray-50"
                    }`}
                    data-testid="modal-vehicle-car-btn"
                  >
                    <Car className="w-8 h-8" />
                    <span className="font-bold">VOITURE</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleInfo({ ...vehicleInfo, vehicle_category: "moto" })}
                    className={`p-4 border-2 border-black flex flex-col items-center gap-2 transition-all ${
                      vehicleInfo.vehicle_category === "moto"
                        ? "bg-[#FFBE00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white hover:bg-gray-50"
                    }`}
                    data-testid="modal-vehicle-moto-btn"
                  >
                    <Bike className="w-8 h-8" />
                    <span className="font-bold">MOTO</span>
                  </button>
                </div>
              </div>
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
