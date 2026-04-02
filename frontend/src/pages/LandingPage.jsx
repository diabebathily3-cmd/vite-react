import React from "react";
import { useNavigate } from "react-router-dom";
import { Car, MapPin, Shield, Star, Clock, CreditCard, ArrowRight } from "lucide-react";
import { useAuth } from "../App";

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
    <div className="min-h-screen bg-white" data-testid="landing-page">
      {/* Header */}
      <header className="border-b border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#FFBE00] border border-black flex items-center justify-center">
                <Car className="w-6 h-6" />
              </div>
              <span className="font-['Outfit'] text-xl font-black tracking-tight">MALIRIDE</span>
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
                    onClick={() => navigate("/auth")}
                    className="font-medium hover:underline"
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
      <section className="border-b border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="overline mb-4">TRANSPORT URBAIN AU MALI</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter mb-6">
                VOTRE TAXI
                <br />
                <span className="text-[#FFBE00]">EN UN CLIC</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
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
                  className="brutalist-btn brutalist-btn-secondary px-8 py-4 text-lg"
                  data-testid="become-driver-btn"
                >
                  Devenir chauffeur
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="brutalist-card p-2">
                <img
                  src="https://static.prod-images.emergentagent.com/jobs/70074c40-f177-4ede-9853-4ea5d897762e/images/3d243c33f10e5b2824644666434469a711961cddca7e19aa186fd22e6e1031f2.png"
                  alt="MaliRide App"
                  className="w-full"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-[#FFBE00] border border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="font-['Outfit'] font-bold text-2xl">24/7</p>
                <p className="text-sm">Disponible</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-black bg-[#F4F4F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="overline text-center mb-4">FONCTIONNALITÉS</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center mb-12">
            POURQUOI CHOISIR MALIRIDE?
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
                icon: <Car className="w-8 h-8" />,
                title: "PRIX ESTIMÉ",
                desc: "Connaissez le prix avant de réserver"
              }
            ].map((feature, i) => (
              <div key={i} className="brutalist-card p-6 bg-white">
                <div className="w-14 h-14 bg-[#FFBE00] border border-black flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-['Outfit'] font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="overline text-center mb-4">PROCESSUS</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center mb-12">
            COMMENT ÇA MARCHE?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "INDIQUEZ VOTRE DESTINATION", desc: "Entrez votre point de départ et d'arrivée" },
              { step: "02", title: "CHOISISSEZ VOTRE TAXI", desc: "Voyez le prix estimé et confirmez" },
              { step: "03", title: "PROFITEZ DU TRAJET", desc: "Suivez en temps réel et payez à l'arrivée" }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-[#FFBE00] font-['Outfit'] font-black text-2xl mb-4">
                  {item.step}
                </div>
                <h3 className="font-['Outfit'] font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Driver CTA */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="overline text-[#FFBE00] mb-4">POUR LES CHAUFFEURS</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-6">
                GAGNEZ DE L'ARGENT AVEC VOTRE VÉHICULE
              </h2>
              <p className="text-gray-300 mb-8">
                Rejoignez la communauté MaliRide et commencez à gagner dès aujourd'hui. 
                Flexibilité totale, vous êtes votre propre patron.
              </p>
              <button
                onClick={() => navigate("/auth?role=driver")}
                className="brutalist-btn px-8 py-4 text-lg"
                data-testid="driver-cta-btn"
              >
                Devenir chauffeur
              </button>
            </div>
            <div className="brutalist-card bg-white text-black p-2">
              <img
                src="https://static.prod-images.emergentagent.com/jobs/70074c40-f177-4ede-9853-4ea5d897762e/images/94d77cd570da0701055b6bbb1395aeb4d7cba7270c755d34dbdec96be277ee52.png"
                alt="Driver App"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FFBE00] border border-black flex items-center justify-center">
                <Car className="w-4 h-4" />
              </div>
              <span className="font-['Outfit'] font-bold">MALIRIDE</span>
            </div>
            <p className="text-sm text-gray-600">
              © 2024 MaliRide. Tous droits réservés. Bamako, Mali
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
