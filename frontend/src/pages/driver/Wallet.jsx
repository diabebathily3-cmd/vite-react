import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth, API } from "../../App";
import { 
  Wallet, ArrowLeft, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  Clock, CheckCircle, XCircle, Phone, Building, CreditCard
} from "lucide-react";

const DriverWallet = ({ onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  
  // Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("orange_money");
  const [withdrawAccount, setWithdrawAccount] = useState("");

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);
      const [walletRes, statsRes, txRes] = await Promise.all([
        axios.get(`${API}/wallet`),
        axios.get(`${API}/wallet/stats`),
        axios.get(`${API}/wallet/transactions`)
      ]);
      
      setWallet(walletRes.data);
      setStats(statsRes.data);
      setTransactions(txRes.data);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      toast.error("Erreur lors du chargement du portefeuille");
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
    
    if (parseFloat(withdrawAmount) < 1000) {
      toast.error("Montant minimum: 1000 FCFA");
      return;
    }
    
    if (!withdrawAccount) {
      toast.error("Veuillez entrer votre numéro ou compte");
      return;
    }
    
    if (parseFloat(withdrawAmount) > (wallet?.balance || 0)) {
      toast.error("Solde insuffisant");
      return;
    }
    
    setWithdrawing(true);
    try {
      const response = await axios.post(`${API}/wallet/withdraw`, {
        amount: parseFloat(withdrawAmount),
        method: withdrawMethod,
        phone_or_account: withdrawAccount
      });
      
      toast.success("Demande de retrait soumise!");
      setShowWithdraw(false);
      setWithdrawAmount("");
      setWithdrawAccount("");
      fetchWalletData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors du retrait");
    } finally {
      setWithdrawing(false);
    }
  };

  const getTransactionIcon = (type, status) => {
    if (type === "earning") return <ArrowDownCircle className="w-5 h-5 text-green-600" />;
    if (type === "withdrawal") {
      if (status === "pending") return <Clock className="w-5 h-5 text-orange-500" />;
      if (status === "completed") return <ArrowUpCircle className="w-5 h-5 text-red-600" />;
      return <XCircle className="w-5 h-5 text-gray-500" />;
    }
    if (type === "bonus") return <TrendingUp className="w-5 h-5 text-blue-600" />;
    return <CreditCard className="w-5 h-5 text-gray-600" />;
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
    <div className="min-h-screen bg-[#F4F4F5]" data-testid="driver-wallet-page">
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
          <h1 className="font-['Outfit'] font-bold text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#FFBE00]" />
            MON PORTEFEUILLE
          </h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {/* Balance Card */}
        <div className="brutalist-card bg-black text-white p-6 mb-4" data-testid="balance-card">
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Solde disponible</p>
          <p className="font-['Outfit'] font-black text-4xl text-[#FFBE00] mb-4">
            {(wallet?.balance || 0).toLocaleString()} <span className="text-xl">FCFA</span>
          </p>
          
          <button
            onClick={() => setShowWithdraw(true)}
            disabled={(wallet?.balance || 0) < 1000}
            className="w-full brutalist-btn py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="withdraw-btn"
          >
            <ArrowUpCircle className="w-5 h-5 inline mr-2" />
            RETIRER DE L'ARGENT
          </button>
          
          {(wallet?.balance || 0) < 1000 && (
            <p className="text-xs text-gray-400 text-center mt-2">
              Minimum de retrait: 1000 FCFA
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="brutalist-card bg-white p-4">
            <p className="text-xs text-gray-600 uppercase">Aujourd'hui</p>
            <p className="font-['Outfit'] font-black text-xl text-green-600">
              +{(stats?.today_earnings || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">FCFA</p>
          </div>
          <div className="brutalist-card bg-white p-4">
            <p className="text-xs text-gray-600 uppercase">Cette semaine</p>
            <p className="font-['Outfit'] font-black text-xl text-green-600">
              +{(stats?.week_earnings || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">FCFA</p>
          </div>
          <div className="brutalist-card bg-white p-4">
            <p className="text-xs text-gray-600 uppercase">Ce mois</p>
            <p className="font-['Outfit'] font-black text-xl text-green-600">
              +{(stats?.month_earnings || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">FCFA</p>
          </div>
          <div className="brutalist-card bg-white p-4">
            <p className="text-xs text-gray-600 uppercase">Total retiré</p>
            <p className="font-['Outfit'] font-black text-xl">
              {(stats?.total_withdrawn || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">FCFA</p>
          </div>
        </div>

        {/* Pending Withdrawals */}
        {(wallet?.pending_withdrawal || 0) > 0 && (
          <div className="brutalist-card bg-orange-50 border-orange-500 p-4 mb-4">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-orange-500" />
              <div>
                <p className="font-bold">Retrait en attente</p>
                <p className="text-lg font-['Outfit'] font-black text-orange-600">
                  {wallet.pending_withdrawal.toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transactions */}
        <div className="brutalist-card bg-white p-4" data-testid="transactions-list">
          <h2 className="font-['Outfit'] font-bold text-lg mb-4">HISTORIQUE DES TRANSACTIONS</h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune transaction pour le moment</p>
              <p className="text-sm">Complétez des courses pour gagner de l'argent</p>
            </div>
          ) : (
            <div className="space-y-3">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="withdraw-modal">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowWithdraw(false)}></div>
          <div className="relative w-full max-w-md bg-white border border-black p-6">
            <h3 className="font-['Outfit'] font-bold text-xl mb-4">RETIRER DE L'ARGENT</h3>
            
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
                placeholder="5000"
                min="1000"
                max={wallet?.balance || 0}
                data-testid="withdraw-amount-input"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum: 1000 FCFA</p>
            </div>
            
            {/* Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Mode de retrait</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setWithdrawMethod("orange_money")}
                  className={`p-3 border border-black flex flex-col items-center gap-1 transition-colors ${
                    withdrawMethod === "orange_money" ? "bg-[#FFBE00]" : "bg-white hover:bg-gray-50"
                  }`}
                  data-testid="method-orange-btn"
                >
                  <Phone className="w-5 h-5" />
                  <span className="text-xs font-medium">Orange Money</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawMethod("moov_money")}
                  className={`p-3 border border-black flex flex-col items-center gap-1 transition-colors ${
                    withdrawMethod === "moov_money" ? "bg-[#FFBE00]" : "bg-white hover:bg-gray-50"
                  }`}
                  data-testid="method-moov-btn"
                >
                  <Phone className="w-5 h-5" />
                  <span className="text-xs font-medium">Moov Money</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawMethod("bank_transfer")}
                  className={`p-3 border border-black flex flex-col items-center gap-1 transition-colors ${
                    withdrawMethod === "bank_transfer" ? "bg-[#FFBE00]" : "bg-white hover:bg-gray-50"
                  }`}
                  data-testid="method-bank-btn"
                >
                  <Building className="w-5 h-5" />
                  <span className="text-xs font-medium">Banque</span>
                </button>
              </div>
            </div>
            
            {/* Account/Phone */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                {withdrawMethod === "bank_transfer" ? "Numéro de compte" : "Numéro de téléphone"}
              </label>
              <input
                type="text"
                value={withdrawAccount}
                onChange={(e) => setWithdrawAccount(e.target.value)}
                className="brutalist-input w-full p-3"
                placeholder={withdrawMethod === "bank_transfer" ? "ML001 XXXX XXXX" : "+223 XX XX XX XX"}
                data-testid="withdraw-account-input"
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
                data-testid="confirm-withdraw-btn"
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

export default DriverWallet;
