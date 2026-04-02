import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { API } from "../../App";
import { 
  Wallet, ArrowLeft, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  Clock, CheckCircle, Building, Percent, DollarSign, PieChart
} from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_uber-mali-drive/artifacts/apw7o3ih_image.png";

const PlatformWallet = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  
  // Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [withdrawDescription, setWithdrawDescription] = useState("");

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);
      const [walletRes, statsRes, txRes] = await Promise.all([
        axios.get(`${API}/admin/platform-wallet`),
        axios.get(`${API}/admin/platform-wallet/stats`),
        axios.get(`${API}/admin/platform-wallet/transactions`)
      ]);
      
      setWallet(walletRes.data);
      setStats(statsRes.data);
      setTransactions(txRes.data);
    } catch (error) {
      console.error("Error fetching platform wallet:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }
    
    if (parseFloat(withdrawAmount) > (wallet?.balance || 0)) {
      toast.error("Solde insuffisant");
      return;
    }
    
    setWithdrawing(true);
    try {
      await axios.post(`${API}/admin/platform-wallet/withdraw`, {
        amount: parseFloat(withdrawAmount),
        method: "bank_transfer",
        account: withdrawAccount,
        description: withdrawDescription || "Retrait plateforme"
      });
      
      toast.success("Demande de retrait soumise!");
      setShowWithdraw(false);
      setWithdrawAmount("");
      setWithdrawAccount("");
      setWithdrawDescription("");
      fetchWalletData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors du retrait");
    } finally {
      setWithdrawing(false);
    }
  };

  const getTransactionIcon = (type, status) => {
    if (type === "commission") return <ArrowDownCircle className="w-5 h-5 text-green-600" />;
    if (type === "withdrawal") {
      if (status === "pending") return <Clock className="w-5 h-5 text-orange-500" />;
      if (status === "completed") return <ArrowUpCircle className="w-5 h-5 text-red-600" />;
    }
    return <DollarSign className="w-5 h-5 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F4F5]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-[#FFBE00] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5]" data-testid="platform-wallet-page">
      {/* Header */}
      <header className="bg-black text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 hover:text-[#FFBE00] transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <h1 className="font-['Outfit'] font-bold text-lg flex items-center gap-2">
            <img src={LOGO_URL} alt="SIRA TAXI" className="h-8 w-auto" />
            <span className="text-[#FFBE00]">PORTEFEUILLE</span>
          </h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {/* Balance Card */}
        <div className="brutalist-card bg-gradient-to-br from-black to-gray-800 text-white p-6 mb-4" data-testid="platform-balance-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Solde de la plateforme</p>
              <p className="font-['Outfit'] font-black text-4xl text-[#FFBE00]">
                {(wallet?.balance || 0).toLocaleString()} <span className="text-xl">FCFA</span>
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Percent className="w-4 h-4" />
                <span>Commission: {((stats?.commission_rate || 0.15) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowWithdraw(true)}
            disabled={(wallet?.balance || 0) <= 0}
            className="w-full brutalist-btn py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="platform-withdraw-btn"
          >
            <ArrowUpCircle className="w-5 h-5 inline mr-2" />
            EFFECTUER UN RETRAIT
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="brutalist-card bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-600 uppercase">Aujourd'hui</p>
            </div>
            <p className="font-['Outfit'] font-black text-xl text-green-600">
              +{(stats?.today_commissions || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">FCFA</p>
          </div>
          
          <div className="brutalist-card bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 flex items-center justify-center">
                <PieChart className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600 uppercase">Cette semaine</p>
            </div>
            <p className="font-['Outfit'] font-black text-xl text-blue-600">
              +{(stats?.week_commissions || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">FCFA</p>
          </div>
          
          <div className="brutalist-card bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-xs text-gray-600 uppercase">Ce mois</p>
            </div>
            <p className="font-['Outfit'] font-black text-xl text-purple-600">
              +{(stats?.month_commissions || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">FCFA</p>
          </div>
          
          <div className="brutalist-card bg-[#FFBE00] p-4 border border-black">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-black flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-[#FFBE00]" />
              </div>
              <p className="text-xs uppercase font-bold">Total Commissions</p>
            </div>
            <p className="font-['Outfit'] font-black text-xl">
              {(stats?.total_commissions || 0).toLocaleString()}
            </p>
            <p className="text-xs">FCFA</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="brutalist-card bg-blue-50 border-blue-500 p-4 mb-4">
          <div className="flex items-start gap-3">
            <Percent className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-blue-900">Commission de 15% sur chaque course</p>
              <p className="text-sm text-blue-700">
                Sur chaque course terminée, SIRA TAXI prélève automatiquement 15% du montant total. 
                Le reste (85%) est crédité au portefeuille du chauffeur.
              </p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="brutalist-card bg-white p-4" data-testid="platform-transactions-list">
          <h2 className="font-['Outfit'] font-bold text-lg mb-4">HISTORIQUE DES COMMISSIONS</h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune transaction pour le moment</p>
              <p className="text-sm">Les commissions apparaîtront ici après les courses</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.map((tx) => (
                <div 
                  key={tx.transaction_id} 
                  className="flex items-center justify-between p-3 border border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(tx.type, tx.status)}
                    <div>
                      <p className="font-medium text-sm">{tx.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.created_at).toLocaleString('fr-FR')}
                      </p>
                      {tx.type === "commission" && (
                        <p className="text-xs text-gray-400">
                          Course: {tx.total_ride_price?.toLocaleString()} FCFA
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} FCFA
                    </p>
                    {tx.status === "pending" && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">
                        En attente
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="platform-withdraw-modal">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowWithdraw(false)}></div>
          <div className="relative w-full max-w-md bg-white border border-black p-6">
            <h3 className="font-['Outfit'] font-bold text-xl mb-4">RETRAIT PLATEFORME</h3>
            
            {/* Current Balance */}
            <div className="bg-gray-100 border border-black p-3 mb-4">
              <p className="text-sm text-gray-600">Solde disponible</p>
              <p className="font-['Outfit'] font-black text-2xl text-[#FFBE00]">
                {(wallet?.balance || 0).toLocaleString()} FCFA
              </p>
            </div>
            
            {/* Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Montant à retirer (FCFA)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="brutalist-input w-full p-3 text-lg"
                placeholder="100000"
                max={wallet?.balance || 0}
                data-testid="platform-withdraw-amount"
              />
            </div>
            
            {/* Account */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Compte bancaire</label>
              <input
                type="text"
                value={withdrawAccount}
                onChange={(e) => setWithdrawAccount(e.target.value)}
                className="brutalist-input w-full p-3"
                placeholder="IBAN ou numéro de compte"
                data-testid="platform-withdraw-account"
              />
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Description (optionnel)</label>
              <input
                type="text"
                value={withdrawDescription}
                onChange={(e) => setWithdrawDescription(e.target.value)}
                className="brutalist-input w-full p-3"
                placeholder="Ex: Retrait mensuel"
                data-testid="platform-withdraw-description"
              />
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowWithdraw(false)}
                className="flex-1 border border-black py-3 font-bold"
              >
                ANNULER
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="flex-1 brutalist-btn py-3 disabled:opacity-50"
                data-testid="platform-confirm-withdraw"
              >
                {withdrawing ? "TRAITEMENT..." : "CONFIRMER"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformWallet;
