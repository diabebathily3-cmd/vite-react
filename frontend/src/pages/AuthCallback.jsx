import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = window.location.hash;
        const sessionId = hash.split("session_id=")[1]?.split("&")[0];

        if (!sessionId) {
          toast.error("Session invalide");
          navigate("/auth");
          return;
        }

        // Exchange session_id for session via backend
        const response = await axios.post(`${API}/auth/session`, {
          session_id: sessionId
        });

        const { user, token } = response.data;
        
        // Store token
        localStorage.setItem("token", token);
        
        // Update auth context
        updateUser(user);

        toast.success(`Bienvenue, ${user.name}!`);

        // Redirect based on role
        if (user.role === "driver") {
          navigate("/driver", { replace: true, state: { user } });
        } else if (user.role === "admin") {
          navigate("/admin", { replace: true, state: { user } });
        } else {
          navigate("/passenger", { replace: true, state: { user } });
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("Erreur d'authentification");
        navigate("/auth");
      }
    };

    processAuth();
  }, [navigate, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-black border-t-[#FFBE00] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium">Connexion en cours...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
