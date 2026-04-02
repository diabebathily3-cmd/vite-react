import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth, API } from "../../App";
import { 
  Car, Users, MapPin, DollarSign, TrendingUp, 
  Menu, X, LogOut, User, Check, Ban, Activity
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [rides, setRides] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
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

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(), fetchRides()]);
      setLoading(false);
    };
    init();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
      fetchRides();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchStats, fetchUsers, fetchRides]);

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
    <div className="min-h-screen bg-[#F4F4F5]" data-testid="admin-dashboard">
      {/* Header */}
      <header className="bg-black text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFBE00] flex items-center justify-center">
            <Car className="w-6 h-6 text-black" />
          </div>
          <div>
            <span className="font-['Outfit'] font-bold text-lg">MALIRIDE</span>
            <span className="text-[#FFBE00] ml-2 text-sm">ADMIN</span>
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
          <TabsList className="grid w-full grid-cols-3 mb-6 border border-black rounded-none h-auto p-0">
            <TabsTrigger 
              value="overview" 
              className="rounded-none py-3 font-bold data-[state=active]:bg-[#FFBE00] data-[state=active]:text-black"
              data-testid="tab-overview"
            >
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="rounded-none py-3 font-bold data-[state=active]:bg-[#FFBE00] data-[state=active]:text-black"
              data-testid="tab-users"
            >
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger 
              value="rides" 
              className="rounded-none py-3 font-bold data-[state=active]:bg-[#FFBE00] data-[state=active]:text-black"
              data-testid="tab-rides"
            >
              Courses
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" data-testid="overview-content">
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
        </Tabs>
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
