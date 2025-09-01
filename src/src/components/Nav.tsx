import React from "react";
import { NavLink } from "react-router-dom";

export default function Nav() {
  const linkStyle: React.CSSProperties = {
    margin: "10px",
    textDecoration: "none",
    fontWeight: "bold",
    color: "#333"
  };

  const activeStyle: React.CSSProperties = {
    color: "tomato",
    borderBottom: "2px solid tomato"
  };

  return (
    <nav style={{ textAlign: "center", margin: "20px" }}>
      <NavLink to="/" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
        Accueil
      </NavLink>
      <NavLink to="/shop" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
        Boutique
      </NavLink>
    </nav>
  );
}
