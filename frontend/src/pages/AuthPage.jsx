import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, User, Phone, ArrowLeft, Car, Bike } from "lucide-react";
import { useAuth } from "../App";
import { toast } from "sonner";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_uber-mali-drive/artifacts/apw7o3ih_image.png";

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuth();
  
  const [step, setStep] = useState(searchParams.get("role") ? "form" : "choose");
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
        const user = await register({ ...formData, role });
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
    const redirectUrl = window.location.origin + "/passenger";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const isDriver = role === "driver";

  // Step 1: Choose role
  if (step === "choose") {
    return (
      <div className="min-h-screen bg-black flex flex-col" data-testid="auth-page">
        {/* Back */}
        <div className="p-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 font-medium text-white hover:text-[#FFBE00]"
            data-testid="back-to-home-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {/* Logo */}
          <div className="mb-8 text-center" data-testid="auth-logo">
            <img src={LOGO_URL} alt="SIRA TAXI" className="h-28 w-auto mx-auto mb-3" />
            <span className="font-['Outfit'] font-black text-2xl text-white tracking-tight">SIRA <span className="text-[#FFBE00]">TAXI</span></span>
          </div>

          <h1 className="text-white font-['Outfit'] font-black text-xl mb-2 text-center">BIENVENUE</h1>
          <p className="text-gray-400 text-center mb-10">Comment souhaitez-vous utiliser SIRA TAXI ?</p>

          <div className="w-full max-w-sm space-y-4">
            {/* Passenger Button */}
            <button
              onClick={() => { setRole("passenger"); setStep("form"); }}
              className="w-full group relative overflow-hidden bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(255,190,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(255,190,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
              data-testid="choose-passenger-btn"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#FFBE00] flex items-center justify-center flex-shrink-0">
                  <User className="w-7 h-7 text-black" />
                </div>
                <div className="text-left">
                  <p className="font-['Outfit'] font-black text-lg">JE SUIS PASSAGER</p>
                  <p className="text-sm text-gray-500">Commander un taxi ou moto-taxi</p>
                </div>
              </div>
            </button>

            {/* Driver Button */}
            <button
              onClick={() => { setRole("driver"); setStep("form"); }}
              className="w-full group relative overflow-hidden bg-black border-2 border-[#FFBE00] p-6 shadow-[4px_4px_0px_0px_rgba(255,190,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(255,190,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
              data-testid="choose-driver-btn"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#FFBE00] flex items-center justify-center flex-shrink-0">
                  <Car className="w-7 h-7 text-black" />
                </div>
                <div className="text-left">
                  <p className="font-['Outfit'] font-black text-lg text-white">JE SUIS CHAUFFEUR</p>
                  <p className="text-sm text-gray-400">Gagner de l'argent en conduisant</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Login/Register Form
  return (
    <div 
      className={`min-h-screen flex items-center justify-center p-4 ${isDriver ? "bg-black" : "bg-gradient-to-b from-black via-gray-900 to-black"}`}
      data-testid="auth-page"
    >
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => setStep("choose")}
          className="flex items-center gap-2 mb-6 font-medium text-white hover:text-[#FFBE00]"
          data-testid="back-to-choose-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          Changer de mode
        </button>

        {/* Auth Card */}
        <div className={`border-2 p-8 ${
          isDriver 
            ? "bg-gray-950 border-[#FFBE00] shadow-[4px_4px_0px_0px_rgba(255,190,0,1)]" 
            : "bg-white border-black shadow-[4px_4px_0px_0px_rgba(255,190,0,1)]"
        }`}>
          {/* Logo + Role Badge */}
          <div className="flex flex-col items-center justify-center mb-6" data-testid="auth-logo">
            <img src={LOGO_URL} alt="SIRA TAXI" className="h-20 w-auto mb-2" />
            <div className={`px-4 py-1 font-bold text-sm tracking-wider ${
              isDriver 
                ? "bg-[#FFBE00] text-black" 
                : "bg-black text-[#FFBE00]"
            }`}>
              {isDriver ? "ESPACE CHAUFFEUR" : "ESPACE PASSAGER"}
            </div>
          </div>

          {/* Title */}
          <h1 className={`text-2xl font-black text-center mb-1 ${isDriver ? "text-white" : "text-black"}`}>
            {isLogin ? "CONNEXION" : "INSCRIPTION"}
          </h1>
          <p className={`text-center mb-6 ${isDriver ? "text-gray-400" : "text-gray-600"}`}>
            {isLogin 
              ? (isDriver ? "Accédez à votre espace chauffeur" : "Connectez-vous pour réserver") 
              : (isDriver ? "Inscrivez-vous comme chauffeur" : "Créez votre compte passager")
            }
          </p>

          {/* Google Login - only for passengers */}
          {!isDriver && (
            <>
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
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                {/* Name */}
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isDriver ? "text-gray-300" : "text-gray-700"}`}>Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none ${
                        isDriver 
                          ? "bg-gray-900 border-gray-700 text-white focus:border-[#FFBE00] placeholder-gray-500" 
                          : "bg-white border-black text-black focus:border-[#FFBE00]"
                      }`}
                      placeholder="Votre nom"
                      required={!isLogin}
                      data-testid="name-input"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isDriver ? "text-gray-300" : "text-gray-700"}`}>Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none ${
                        isDriver 
                          ? "bg-gray-900 border-gray-700 text-white focus:border-[#FFBE00] placeholder-gray-500" 
                          : "bg-white border-black text-black focus:border-[#FFBE00]"
                      }`}
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
              <label className={`block text-sm font-medium mb-2 ${isDriver ? "text-gray-300" : "text-gray-700"}`}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none ${
                    isDriver 
                      ? "bg-gray-900 border-gray-700 text-white focus:border-[#FFBE00] placeholder-gray-500" 
                      : "bg-white border-black text-black focus:border-[#FFBE00]"
                  }`}
                  placeholder="votre@email.com"
                  required
                  data-testid="email-input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDriver ? "text-gray-300" : "text-gray-700"}`}>Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border-2 focus:outline-none ${
                    isDriver 
                      ? "bg-gray-900 border-gray-700 text-white focus:border-[#FFBE00] placeholder-gray-500" 
                      : "bg-white border-black text-black focus:border-[#FFBE00]"
                  }`}
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
              className={`w-full py-4 text-lg font-bold border-2 border-black transition-all disabled:opacity-50 ${
                isDriver 
                  ? "bg-[#FFBE00] text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]" 
                  : "bg-[#FFBE00] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              } hover:translate-x-[-2px] hover:translate-y-[-2px]`}
              data-testid="submit-auth-btn"
            >
              {loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <p className={`text-center mt-6 ${isDriver ? "text-gray-400" : "text-gray-600"}`}>
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
