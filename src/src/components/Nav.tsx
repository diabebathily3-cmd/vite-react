import { NavLink } from "react-router-dom";

export default function Nav() {
  const linkStyle: React.CSSProperties = {
    textDecoration: "none",
    color: "#333",
    margin: "0 15px",
    fontWeight: 600,
  };

  const activeStyle: React.CSSProperties = {
    color: "tomato",
    borderBottom: "2px solid tomato",
  };

  return (
    <nav style={{ padding: "15px", borderBottom: "1px solid #ccc", textAlign: "center" }}>
      <NavLink to="/" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
        Accueil
      </NavLink>
      <NavLink to="/boutique" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
        Boutique
      </NavLink>
    </nav>
  );
}
