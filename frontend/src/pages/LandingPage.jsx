import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Shield, Star, Clock, CreditCard, ArrowRight } from "lucide-react";
import { useAuth } from "../App";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_uber-mali-drive/artifacts/apw7o3ih_image.png";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      if (user.role === "passenger") navigate("/passenger");
      else if (user.role === "driver") navigate("/driver");
      else if (user.role === "admin") navigate("/admin");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-black" data-testid="landing-page">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3" data-testid="header-logo">
              <img src={LOGO_URL} alt="SIRA TAXI" className="h-14 w-auto" />
              <span className="font-['Outfit'] font-black text-xl text-white tracking-tight hidden sm:block">SIRA <span className="text-[#FFBE00]">TAXI</span></span>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <button
                  onClick={handleGetStarted}
                  className="brutalist-btn px-6 py-2"
                  data-testid="go-to-dashboard-btn"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/contact")}
                    className="font-medium text-white hover:text-[#FFBE00] transition-colors"
                    data-testid="contact-link"
                  >
                    Contact
                  </button>
                  <button
                    onClick={() => navigate("/auth")}
                    className="font-medium text-white hover:text-[#FFBE00] transition-colors"
                    data-testid="login-link"
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => navigate("/auth")}
                    className="brutalist-btn px-6 py-2"
                    data-testid="signup-btn"
                  >
                    S'inscrire
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#FFBE00] text-sm font-bold tracking-widest mb-4">TRANSPORT URBAIN AU MALI</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter mb-6 text-white">
                VOTRE TAXI
                <br />
                <span className="text-[#FFBE00]">EN UN CLIC</span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 max-w-lg">
                Réservez un taxi en quelques secondes. Suivez votre chauffeur en temps réel. 
                Payez en espèces ou via Mobile Money.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleGetStarted}
                  className="brutalist-btn px-8 py-4 text-lg flex items-center gap-2"
                  data-testid="hero-get-started-btn"
                >
                  Réserver maintenant
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate("/auth?role=driver")}
                  className="px-8 py-4 text-lg border border-[#FFBE00] text-[#FFBE00] font-bold hover:bg-[#FFBE00] hover:text-black transition-colors"
                  data-testid="become-driver-btn"
                >
                  Devenir chauffeur
                </button>
              </div>
            </div>
            
            <div className="relative flex justify-center" data-testid="hero-logo">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FFBE00]/10 rounded-full blur-3xl scale-110"></div>
                <img
                  src={LOGO_URL}
                  alt="SIRA TAXI"
                  className="w-72 h-72 sm:w-96 sm:h-96 object-contain relative z-10 drop-shadow-[0_0_30px_rgba(255,190,0,0.3)]"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-[#FFBE00] border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20">
                <p className="font-['Outfit'] font-bold text-2xl">24/7</p>
                <p className="text-sm">Disponible</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-[#FFBE00] text-sm font-bold tracking-widest text-center mb-4">FONCTIONNALITÉS</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center mb-12 text-white">
            POURQUOI CHOISIR SIRA TAXI?
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <MapPin className="w-8 h-8" />,
                title: "SUIVI GPS",
                desc: "Suivez votre chauffeur en temps réel sur la carte"
              },
              {
                icon: <CreditCard className="w-8 h-8" />,
                title: "PAIEMENT FLEXIBLE",
                desc: "Payez en espèces ou via Orange Money / Mobile Money"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "SÉCURITÉ",
                desc: "Chauffeurs vérifiés et courses trackées"
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "ÉVALUATIONS",
                desc: "Notez vos courses pour améliorer le service"
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "RAPIDITÉ",
                desc: "Chauffeurs à proximité, arrivée rapide"
              },
              {
                icon: <CreditCard className="w-8 h-8" />,
                title: "PRIX ESTIMÉ",
                desc: "Connaissez le prix avant de réserver"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 p-6 hover:border-[#FFBE00] transition-colors">
                <div className="w-14 h-14 bg-[#FFBE00] flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-['Outfit'] font-bold text-lg mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-[#FFBE00] text-sm font-bold tracking-widest text-center mb-4">PROCESSUS</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center mb-12 text-white">
            COMMENT ÇA MARCHE?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "INDIQUEZ VOTRE DESTINATION", desc: "Entrez votre point de départ et d'arrivée" },
              { step: "02", title: "CHOISISSEZ VOTRE TAXI", desc: "Voyez le prix estimé et confirmez" },
              { step: "03", title: "PROFITEZ DU TRAJET", desc: "Suivez en temps réel et payez à l'arrivée" }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFBE00] text-black font-['Outfit'] font-black text-2xl mb-4">
                  {item.step}
                </div>
                <h3 className="font-['Outfit'] font-bold text-lg mb-2 text-white">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Driver CTA */}
      <section className="bg-[#FFBE00]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-black text-sm font-bold tracking-widest mb-4">POUR LES CHAUFFEURS</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-6 text-black">
                GAGNEZ DE L'ARGENT AVEC VOTRE VÉHICULE
              </h2>
              <p className="text-black/70 mb-8">
                Rejoignez la communauté SIRA TAXI et commencez à gagner dès aujourd'hui. 
                Flexibilité totale, vous êtes votre propre patron.
              </p>
              <button
                onClick={() => navigate("/auth?role=driver")}
                className="px-8 py-4 text-lg bg-black text-[#FFBE00] font-bold border border-black hover:bg-gray-900 transition-colors"
                data-testid="driver-cta-btn"
              >
                Devenir chauffeur
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={LOGO_URL}
                alt="SIRA TAXI Driver"
                className="w-72 h-72 object-contain drop-shadow-[0_0_20px_rgba(0,0,0,0.3)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3" data-testid="footer-logo">
              <img src={LOGO_URL} alt="SIRA TAXI" className="h-12 w-auto" />
              <span className="font-['Outfit'] font-black text-lg text-white">SIRA <span className="text-[#FFBE00]">TAXI</span></span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate("/contact")}
                className="text-sm text-gray-400 hover:text-[#FFBE00] transition-colors font-medium"
                data-testid="footer-contact-link"
              >
                Contact
              </button>
              <span className="text-sm text-gray-500">
                © 2025 SIRA TAXI. Bamako, Mali
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
