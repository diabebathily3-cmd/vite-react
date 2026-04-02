import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth, API } from "../../App";
import { 
  Car, Users, MapPin, DollarSign, TrendingUp, 
  Menu, X, LogOut, User, Check, Ban, Activity, Wallet, Building, CreditCard
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import PlatformWallet from "./PlatformWallet";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_uber-mali-drive/artifacts/apw7o3ih_image.png";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPlatformWallet, setShowPlatformWallet] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data
  const [stats, setStats] = useState(null);
  const [platformWallet, setPlatformWallet] = useState(null);
  const [users, setUsers] = useState([]);
  const [rides, setRides] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Driver Payments
  const [driverWallets, setDriverWallets] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [payingDriver, setPayingDriver] = useState(null);
  const [payAmount, setPayAmount] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  const fetchPlatformWallet = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/platform-wallet`);
      setPlatformWallet(response.data);
    } catch (error) {
      console.error("Error fetching platform wallet:", error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  const fetchRides = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/rides`);
      setRides(response.data);
    } catch (error) {
      console.error("Error fetching rides:", error);
    }
  }, []);

  const fetchDriverWallets = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/drivers/wallets`);
      setDriverWallets(response.data);
    } catch (error) {
      console.error("Error fetching driver wallets:", error);
    }
  }, []);

  const fetchPaymentHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/payments/history`);
      setPaymentHistory(response.data);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }
  }, []);

  const handlePayDriver = async () => {
    if (!payingDriver || !payAmount) return;
    try {
      await axios.post(`${API}/admin/drivers/${payingDriver.user_id}/pay`, {
        amount: parseFloat(payAmount)
      });
      toast.success(`Paiement de ${parseInt(payAmount).toLocaleString()} FCFA effectué !`);
      setPayingDriver(null);
      setPayAmount("");
      fetchDriverWallets();
      fetchPaymentHistory();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors du paiement");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(), fetchRides(), fetchPlatformWallet(), fetchDriverWallets(), fetchPaymentHistory()]);
      setLoading(false);
    };
    init();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
      fetchRides();
      fetchPlatformWallet();
      fetchDriverWallets();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchStats, fetchUsers, fetchRides, fetchPlatformWallet, fetchDriverWallets, fetchPaymentHistory]);

  const handleToggleUserStatus = async (userId) => {
    try {
      const response = await axios.put(`${API}/admin/users/${userId}/status`);
      toast.success(response.data.is_active ? "Utilisateur activé" : "Utilisateur désactivé");
      fetchUsers();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Show platform wallet page
  if (showPlatformWallet) {
    return <PlatformWallet onClose={() => { setShowPlatformWallet(false); fetchPlatformWallet(); }} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <img src="https://customer-assets.emergentagent.com/job_uber-mali-drive/artifacts/apw7o3ih_image.png" alt="SIRA TAXI" className="h-20 w-auto mx-auto mb-4" />
          <div className="w-16 h-16 border-4 border-black border-t-[#FFBE00] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5]" data-testid="admin-dashboard">
      {/* Header */}
      <header className="bg-black text-white px-4 py-3 flex items-center justify-between border-b-2 border-[#FFBE00]">
        <div className="flex items-center gap-3" data-testid="admin-header-logo">
          <img src={LOGO_URL} alt="SIRA TAXI" className="h-12 w-auto" />
          <div className="flex flex-col leading-tight">
            <span className="font-['Outfit'] font-black text-base text-white tracking-tight">SIRA <span className="text-[#FFBE00]">TAXI</span></span>
            <span className="text-[#FFBE00] text-[10px] font-bold tracking-widest">ADMINISTRATION</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm hidden sm:block">{user?.name}</span>
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 hover:bg-white/10 rounded"
            data-testid="menu-btn"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 border border-black rounded-none h-auto p-0">
            <TabsTrigger 
              value="overview" 
              className="rounded-none py-3 font-bold data-[state=active]:bg-[#FFBE00] data-[state=active]:text-black text-sm"
              data-testid="tab-overview"
            >
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="rounded-none py-3 font-bold data-[state=active]:bg-[#FFBE00] data-[state=active]:text-black text-sm"
              data-testid="tab-users"
            >
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger 
              value="rides" 
              className="rounded-none py-3 font-bold data-[state=active]:bg-[#FFBE00] data-[state=active]:text-black text-sm"
              data-testid="tab-rides"
            >
              Courses
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="rounded-none py-3 font-bold data-[state=active]:bg-[#FFBE00] data-[state=active]:text-black text-sm"
              data-testid="tab-payments"
            >
              <CreditCard className="w-4 h-4 mr-1 inline" />
              Paiements
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" data-testid="overview-content">
            {/* Platform Wallet Card - Prominent */}
            <button
              onClick={() => setShowPlatformWallet(true)}
              className="w-full brutalist-card bg-gradient-to-r from-black to-gray-800 text-white p-6 mb-6 text-left hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
              data-testid="platform-wallet-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-6 h-6 text-[#FFBE00]" />
                    <span className="text-sm text-gray-400 uppercase tracking-wider">Portefeuille SIRA TAXI</span>
                  </div>
                  <p className="font-['Outfit'] font-black text-4xl text-[#FFBE00]">
                    {(platformWallet?.balance || 0).toLocaleString()} <span className="text-xl">FCFA</span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Commission 15% sur chaque course
                  </p>
                </div>
                <div className="text-right">
                  <Wallet className="w-12 h-12 text-[#FFBE00] mb-2" />
                  <span className="text-sm bg-[#FFBE00] text-black px-3 py-1 font-bold">
                    VOIR DÉTAILS →
                  </span>
                </div>
              </div>
            </button>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="brutalist-card bg-white p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#FFBE00] border border-black flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-gray-600">Utilisateurs</span>
                </div>
                <p className="font-['Outfit'] font-black text-3xl">{stats?.total_users || 0}</p>
              </div>
              
              <div className="brutalist-card bg-white p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-500 border border-black flex items-center justify-center">
                    <Car className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-gray-600">Chauffeurs en ligne</span>
                </div>
                <p className="font-['Outfit'] font-black text-3xl">{stats?.online_drivers || 0}</p>
              </div>
              
              <div className="brutalist-card bg-white p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500 border border-black flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-gray-600">Courses actives</span>
                </div>
                <p className="font-['Outfit'] font-black text-3xl">{stats?.active_rides || 0}</p>
              </div>
              
              <div className="brutalist-card bg-white p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-black border border-black flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-[#FFBE00]" />
                  </div>
                  <span className="text-sm text-gray-600">Revenus totaux</span>
                </div>
                <p className="font-['Outfit'] font-black text-2xl text-[#FFBE00]">
                  {(stats?.total_revenue || 0).toLocaleString()} FCFA
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* User Breakdown */}
              <div className="brutalist-card bg-white p-6">
                <h3 className="font-['Outfit'] font-bold text-lg mb-4">RÉPARTITION DES UTILISATEURS</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Passagers</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-3 bg-gray-200 border border-black">
                        <div 
                          className="h-full bg-[#FFBE00]" 
                          style={{ width: `${stats?.total_users ? (stats.total_passengers / stats.total_users * 100) : 0}%` }}
                        ></div>
                      </div>
                      <span className="font-bold">{stats?.total_passengers || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Chauffeurs</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-3 bg-gray-200 border border-black">
                        <div 
                          className="h-full bg-black" 
                          style={{ width: `${stats?.total_users ? (stats.total_drivers / stats.total_users * 100) : 0}%` }}
                        ></div>
                      </div>
                      <span className="font-bold">{stats?.total_drivers || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ride Stats */}
              <div className="brutalist-card bg-white p-6">
                <h3 className="font-['Outfit'] font-bold text-lg mb-4">STATISTIQUES DES COURSES</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total des courses</span>
                    <span className="font-bold">{stats?.total_rides || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Courses terminées</span>
                    <span className="font-bold text-green-600">{stats?.completed_rides || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Courses actives</span>
                    <span className="font-bold text-blue-600">{stats?.active_rides || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" data-testid="users-content">
            <div className="brutalist-card bg-white">
              <div className="p-4 border-b border-black">
                <h3 className="font-['Outfit'] font-bold text-lg">TOUS LES UTILISATEURS</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-black">
                    <tr>
                      <th className="text-left p-4 font-bold">Utilisateur</th>
                      <th className="text-left p-4 font-bold">Email</th>
                      <th className="text-left p-4 font-bold">Rôle</th>
                      <th className="text-left p-4 font-bold">Statut</th>
                      <th className="text-left p-4 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.user_id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 border border-black flex items-center justify-center">
                              {u.picture ? (
                                <img src={u.picture} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-5 h-5" />
                              )}
                            </div>
                            <span className="font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">{u.email}</td>
                        <td className="p-4">
                          <span className={`status-badge ${
                            u.role === "driver" ? "bg-black text-white" : 
                            u.role === "admin" ? "bg-[#FFBE00]" : "bg-gray-200"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`status-badge ${u.is_active ? "status-online" : "status-offline"}`}>
                            {u.is_active ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleUserStatus(u.user_id)}
                            className={`p-2 border border-black hover:bg-gray-100 ${
                              u.is_active ? "hover:bg-red-50" : "hover:bg-green-50"
                            }`}
                            title={u.is_active ? "Désactiver" : "Activer"}
                            data-testid={`toggle-user-${u.user_id}`}
                          >
                            {u.is_active ? <Ban className="w-4 h-4 text-red-600" /> : <Check className="w-4 h-4 text-green-600" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {users.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    Aucun utilisateur trouvé
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Rides Tab */}
          <TabsContent value="rides" data-testid="rides-content">
            <div className="brutalist-card bg-white">
              <div className="p-4 border-b border-black">
                <h3 className="font-['Outfit'] font-bold text-lg">TOUTES LES COURSES</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-black">
                    <tr>
                      <th className="text-left p-4 font-bold">Date</th>
                      <th className="text-left p-4 font-bold">Passager</th>
                      <th className="text-left p-4 font-bold">Chauffeur</th>
                      <th className="text-left p-4 font-bold">Trajet</th>
                      <th className="text-left p-4 font-bold">Prix</th>
                      <th className="text-left p-4 font-bold">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rides.map((ride) => (
                      <tr key={ride.ride_id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-4 text-sm">
                          {new Date(ride.created_at).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className="font-medium">{ride.passenger?.name || "N/A"}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">{ride.driver?.name || "Non assigné"}</span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <p className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              {ride.pickup_location.address}
                            </p>
                            <p className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              {ride.dropoff_location.address}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 font-bold">
                          {(ride.final_price || ride.estimated_price).toLocaleString()} FCFA
                        </td>
                        <td className="p-4">
                          <span className={`status-badge ${
                            ride.status === "completed" ? "status-online" :
                            ride.status === "cancelled" ? "status-offline" :
                            ride.status === "in_progress" ? "status-active" :
                            "status-pending"
                          }`}>
                            {ride.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {rides.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    Aucune course trouvée
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" data-testid="payments-content">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="brutalist-card bg-white p-4">
                <p className="text-xs text-gray-600 uppercase mb-1">Total à payer</p>
                <p className="font-['Outfit'] font-black text-2xl text-red-600">
                  {driverWallets.reduce((sum, d) => sum + d.wallet_balance, 0).toLocaleString()} <span className="text-sm">FCFA</span>
                </p>
              </div>
              <div className="brutalist-card bg-white p-4">
                <p className="text-xs text-gray-600 uppercase mb-1">Chauffeurs en attente</p>
                <p className="font-['Outfit'] font-black text-2xl">
                  {driverWallets.filter(d => d.wallet_balance > 0).length}
                </p>
              </div>
              <div className="brutalist-card bg-white p-4">
                <p className="text-xs text-gray-600 uppercase mb-1">Total versé</p>
                <p className="font-['Outfit'] font-black text-2xl text-green-600">
                  {driverWallets.reduce((sum, d) => sum + d.total_withdrawn, 0).toLocaleString()} <span className="text-sm">FCFA</span>
                </p>
              </div>
            </div>

            {/* Driver Wallets Table */}
            <div className="brutalist-card bg-white mb-6">
              <div className="p-4 border-b border-black">
                <h3 className="font-['Outfit'] font-bold text-lg">PORTEFEUILLES DES CHAUFFEURS</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-black">
                    <tr>
                      <th className="text-left p-4 font-bold">Chauffeur</th>
                      <th className="text-left p-4 font-bold">Courses</th>
                      <th className="text-left p-4 font-bold">Solde</th>
                      <th className="text-left p-4 font-bold">Total gagné</th>
                      <th className="text-left p-4 font-bold">Déjà versé</th>
                      <th className="text-left p-4 font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverWallets.map((driver) => (
                      <tr key={driver.user_id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 border border-black flex items-center justify-center">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium">{driver.name}</p>
                              <p className="text-xs text-gray-500">{driver.phone || driver.email}</p>
                            </div>
                            {driver.is_online && (
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-medium">{driver.total_rides}</td>
                        <td className="p-4">
                          <span className={`font-bold ${driver.wallet_balance > 0 ? "text-red-600" : "text-gray-400"}`}>
                            {driver.wallet_balance.toLocaleString()} FCFA
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">{driver.total_earnings.toLocaleString()} FCFA</td>
                        <td className="p-4 text-green-600 font-medium">{driver.total_withdrawn.toLocaleString()} FCFA</td>
                        <td className="p-4">
                          {driver.wallet_balance > 0 ? (
                            <button
                              onClick={() => { setPayingDriver(driver); setPayAmount(String(driver.wallet_balance)); }}
                              className="bg-[#FFBE00] border border-black px-4 py-2 font-bold text-sm hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                              data-testid={`pay-driver-${driver.user_id}`}
                            >
                              PAYER
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">Rien à payer</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {driverWallets.length === 0 && (
                  <div className="p-8 text-center text-gray-500">Aucun chauffeur inscrit</div>
                )}
              </div>
            </div>

            {/* Payment History */}
            <div className="brutalist-card bg-white">
              <div className="p-4 border-b border-black">
                <h3 className="font-['Outfit'] font-bold text-lg">HISTORIQUE DES PAIEMENTS</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-black">
                    <tr>
                      <th className="text-left p-4 font-bold">Date</th>
                      <th className="text-left p-4 font-bold">Chauffeur</th>
                      <th className="text-left p-4 font-bold">Montant</th>
                      <th className="text-left p-4 font-bold">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => (
                      <tr key={payment.payment_id} className="border-b border-gray-200">
                        <td className="p-4 text-sm">{new Date(payment.created_at).toLocaleString()}</td>
                        <td className="p-4 font-medium">{payment.driver_name}</td>
                        <td className="p-4 font-bold text-green-600">{payment.amount.toLocaleString()} FCFA</td>
                        <td className="p-4">
                          <span className="status-badge status-online">Payé</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {paymentHistory.length === 0 && (
                  <div className="p-8 text-center text-gray-500">Aucun paiement effectué</div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

      {/* Payment Modal */}
      {payingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="payment-modal">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPayingDriver(null)}></div>
          <div className="relative bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 w-full max-w-md mx-4">
            <button onClick={() => setPayingDriver(null)} className="absolute top-3 right-3">
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-['Outfit'] font-bold text-xl mb-4">PAYER LE CHAUFFEUR</h3>
            
            <div className="brutalist-card p-4 mb-4 bg-gray-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-black flex items-center justify-center">
                  <User className="w-6 h-6 text-[#FFBE00]" />
                </div>
                <div>
                  <p className="font-bold">{payingDriver.name}</p>
                  <p className="text-sm text-gray-500">{payingDriver.phone || payingDriver.email}</p>
                </div>
              </div>
              <div className="flex justify-between text-sm mt-3 pt-3 border-t border-gray-200">
                <span className="text-gray-600">Solde disponible</span>
                <span className="font-bold">{payingDriver.wallet_balance.toLocaleString()} FCFA</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Montant à payer (FCFA)</label>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                max={payingDriver.wallet_balance}
                className="w-full p-3 border-2 border-black font-bold text-lg focus:border-[#FFBE00] focus:outline-none"
                data-testid="pay-amount-input"
              />
              <button
                onClick={() => setPayAmount(String(payingDriver.wallet_balance))}
                className="mt-1 text-sm text-[#FFBE00] font-medium underline"
              >
                Tout payer ({payingDriver.wallet_balance.toLocaleString()} FCFA)
              </button>
            </div>
            
            <button
              onClick={handlePayDriver}
              disabled={!payAmount || parseFloat(payAmount) <= 0 || parseFloat(payAmount) > payingDriver.wallet_balance}
              className="w-full bg-[#FFBE00] border-2 border-black py-3 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
              data-testid="confirm-pay-btn"
            >
              CONFIRMER LE PAIEMENT
            </button>
          </div>
        </div>
      )}
      </main>

      {/* Side Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50" data-testid="side-menu">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)}></div>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-black">
            <div className="p-4 border-b border-black flex items-center justify-between bg-black text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FFBE00] flex items-center justify-center">
                  {user?.picture ? (
                    <img src={user.picture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-black" />
                  )}
                </div>
                <div>
                  <p className="font-bold">{user?.name}</p>
                  <p className="text-sm text-gray-400">Administrateur</p>
                </div>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="p-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 hover:bg-red-50 text-red-600"
                data-testid="logout-btn"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Déconnexion</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
