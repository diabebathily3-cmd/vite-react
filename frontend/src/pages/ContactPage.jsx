import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { API } from "../App";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_uber-mali-drive/artifacts/apw7o3ih_image.png";

const ContactPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/contact`, formData);
      setSent(true);
      toast.success("Message envoyé avec succès !");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de l'envoi du message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black" data-testid="contact-page">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3"
              data-testid="header-logo-link"
            >
              <img src={LOGO_URL} alt="SIRA TAXI" className="h-14 w-auto" />
              <span className="font-['Outfit'] font-black text-xl text-white tracking-tight hidden sm:block">SIRA <span className="text-[#FFBE00]">TAXI</span></span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 font-medium text-white hover:text-[#FFBE00] transition-colors"
              data-testid="back-home-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              Accueil
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-[#FFBE00] text-sm font-bold tracking-widest mb-4">CONTACTEZ-NOUS</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 text-white">
            ON EST LÀ
            <br />
            <span className="text-[#FFBE00]">POUR VOUS</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl">
            Une question, une suggestion, ou besoin d'aide ? L'équipe SIRA TAXI est à votre écoute.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="font-['Outfit'] font-black text-2xl text-white mb-8">NOS COORDONNÉES</h2>
              
              <div className="space-y-6">
                <a
                  href="mailto:contact@sirataxi.ml"
                  className="flex items-start gap-4 p-5 border border-gray-800 hover:border-[#FFBE00] transition-colors group"
                  data-testid="contact-email-card"
                >
                  <div className="w-12 h-12 bg-[#FFBE00] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className="font-bold text-white group-hover:text-[#FFBE00] transition-colors">Email</p>
                    <p className="text-[#FFBE00] font-medium">contact@sirataxi.ml</p>
                    <p className="text-sm text-gray-500 mt-1">Réponse sous 24h</p>
                  </div>
                </a>

                <div
                  className="flex items-start gap-4 p-5 border border-gray-800"
                  data-testid="contact-phone-card"
                >
                  <div className="w-12 h-12 bg-[#FFBE00] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Téléphone</p>
                    <p className="text-[#FFBE00] font-medium">+223 XX XX XX XX</p>
                    <p className="text-sm text-gray-500 mt-1">Lundi - Samedi</p>
                  </div>
                </div>

                <div
                  className="flex items-start gap-4 p-5 border border-gray-800"
                  data-testid="contact-address-card"
                >
                  <div className="w-12 h-12 bg-[#FFBE00] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Adresse</p>
                    <p className="text-gray-400">Bamako, Mali</p>
                  </div>
                </div>

                <div
                  className="flex items-start gap-4 p-5 border border-gray-800"
                  data-testid="contact-hours-card"
                >
                  <div className="w-12 h-12 bg-[#FFBE00] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Heures d'ouverture</p>
                    <p className="text-gray-400">Service disponible 24h/24, 7j/7</p>
                    <p className="text-sm text-gray-500 mt-1">Support client : 8h - 20h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="font-['Outfit'] font-black text-2xl text-white mb-8">ENVOYEZ-NOUS UN MESSAGE</h2>
              
              {sent ? (
                <div className="border-2 border-[#FFBE00] p-8 text-center" data-testid="contact-success">
                  <CheckCircle className="w-16 h-16 text-[#FFBE00] mx-auto mb-4" />
                  <h3 className="font-['Outfit'] font-bold text-xl text-white mb-2">MESSAGE ENVOYÉ !</h3>
                  <p className="text-gray-400 mb-6">
                    Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais à votre adresse email.
                  </p>
                  <button
                    onClick={() => { setSent(false); setFormData({ name: "", email: "", subject: "", message: "" }); }}
                    className="brutalist-btn px-6 py-3"
                    data-testid="send-another-btn"
                  >
                    ENVOYER UN AUTRE MESSAGE
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" data-testid="contact-form">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nom complet</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Votre nom"
                      className="w-full p-4 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-[#FFBE00] focus:outline-none transition-colors"
                      data-testid="contact-name-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="votre@email.com"
                      className="w-full p-4 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-[#FFBE00] focus:outline-none transition-colors"
                      data-testid="contact-email-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sujet</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full p-4 bg-gray-900 border border-gray-700 text-white focus:border-[#FFBE00] focus:outline-none transition-colors"
                      data-testid="contact-subject-select"
                    >
                      <option value="">Choisir un sujet</option>
                      <option value="general">Question générale</option>
                      <option value="passenger">Problème passager</option>
                      <option value="driver">Devenir chauffeur</option>
                      <option value="partnership">Partenariat</option>
                      <option value="complaint">Réclamation</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Votre message..."
                      className="w-full p-4 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-[#FFBE00] focus:outline-none transition-colors resize-none"
                      data-testid="contact-message-input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FFBE00] text-black border-2 border-black p-4 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    data-testid="contact-submit-btn"
                  >
                    {loading ? (
                      "ENVOI EN COURS..."
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        ENVOYER LE MESSAGE
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-[#FFBE00]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-black text-sm font-bold tracking-widest mb-4">À PROPOS</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-6 text-black">
                SIRA TAXI, C'EST QUOI ?
              </h2>
              <p className="text-black/70 mb-4">
                SIRA TAXI est la première application de transport urbain au Mali. 
                Notre mission est de rendre les déplacements à Bamako plus simples, 
                plus sûrs et plus accessibles pour tous.
              </p>
              <p className="text-black/70 mb-6">
                Que vous soyez passager ou chauffeur, SIRA TAXI vous connecte 
                en un clic. Taxi ou Moto-Taxi, le choix est le vôtre.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-black text-[#FFBE00] px-6 py-3 font-bold">24/7 DISPONIBLE</div>
                <div className="bg-black text-[#FFBE00] px-6 py-3 font-bold">TAXI & MOTO</div>
                <div className="bg-black text-[#FFBE00] px-6 py-3 font-bold">BAMAKO</div>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={LOGO_URL}
                alt="SIRA TAXI"
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
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="SIRA TAXI" className="h-12 w-auto" />
              <span className="font-['Outfit'] font-black text-lg text-white">SIRA <span className="text-[#FFBE00]">TAXI</span></span>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 SIRA TAXI. Tous droits réservés. Bamako, Mali
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;
