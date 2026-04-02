import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Car, Mail, Lock, User, Phone, ArrowLeft } from "lucide-react";
import { useAuth } from "../App";
import { toast } from "sonner";

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(searchParams.get("role") || "passenger");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const user = await login(formData.email, formData.password);
        toast.success("Connexion réussie!");
        redirectUser(user);
      } else {
        const user = await register({
          ...formData,
          role
        });
        toast.success("Inscription réussie!");
        redirectUser(user);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (user) => {
    if (user.role === "passenger") navigate("/passenger");
    else if (user.role === "driver") navigate("/driver");
    else if (user.role === "admin") navigate("/admin");
  };

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/passenger";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url('https://static.prod-images.emergentagent.com/jobs/70074c40-f177-4ede-9853-4ea5d897762e/images/8637e0ebdb64067a6d7e3cf7ad306389b15eb171499406c21b254a285c89925d.png')`
      }}
      data-testid="auth-page"
    >
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-6 font-medium hover:underline"
          data-testid="back-to-home-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        {/* Auth Card */}
        <div className="brutalist-card bg-white p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-[#FFBE00] border border-black flex items-center justify-center">
              <Car className="w-7 h-7" />
            </div>
            <span className="font-['Outfit'] text-2xl font-black tracking-tight">MALIRIDE</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black text-center mb-2">
            {isLogin ? "CONNEXION" : "INSCRIPTION"}
          </h1>
          <p className="text-center text-gray-600 mb-6">
            {isLogin ? "Connectez-vous à votre compte" : "Créez votre compte MaliRide"}
          </p>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full border border-black p-3 flex items-center justify-center gap-3 mb-6 hover:bg-gray-50 transition-colors"
            data-testid="google-login-btn"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium">Continuer avec Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                {/* Role Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Type de compte</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("passenger")}
                      className={`p-3 border border-black font-medium transition-colors ${
                        role === "passenger" ? "bg-[#FFBE00]" : "bg-white hover:bg-gray-50"
                      }`}
                      data-testid="role-passenger-btn"
                    >
                      Passager
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("driver")}
                      className={`p-3 border border-black font-medium transition-colors ${
                        role === "driver" ? "bg-[#FFBE00]" : "bg-white hover:bg-gray-50"
                      }`}
                      data-testid="role-driver-btn"
                    >
                      Chauffeur
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="brutalist-input w-full pl-10 pr-4 py-3"
                      placeholder="Votre nom"
                      required={!isLogin}
                      data-testid="name-input"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="brutalist-input w-full pl-10 pr-4 py-3"
                      placeholder="+223 XX XX XX XX"
                      required={!isLogin}
                      data-testid="phone-input"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="brutalist-input w-full pl-10 pr-4 py-3"
                  placeholder="votre@email.com"
                  required
                  data-testid="email-input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="brutalist-input w-full pl-10 pr-4 py-3"
                  placeholder="••••••••"
                  required
                  data-testid="password-input"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="brutalist-btn w-full py-4 text-lg disabled:opacity-50"
              data-testid="submit-auth-btn"
            >
              {loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center mt-6">
            {isLogin ? "Pas encore de compte?" : "Déjà un compte?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 font-bold text-[#FFBE00] hover:underline"
              data-testid="toggle-auth-btn"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
