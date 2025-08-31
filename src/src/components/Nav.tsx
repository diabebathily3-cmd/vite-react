import { NavLink } from "react-router-dom";

export default function Nav() {
  const linkStyle: React.CSSProperties = { textDecoration: "none", color: "#111" };
  const active: React.CSSProperties = { fontWeight: 700, borderBottom: "2px solid #111" };

  return (
    <header style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"14px 20px", borderBottom:"1px solid #eee", position:"sticky", top:0, background:"#fff", zIndex:10
    }}>
      <div style={{display:"flex", alignItems:"center", gap:10}}>
        <span style={{fontWeight:800}}>Bathily Phones</span>
      </div>
      <nav style={{display:"flex", gap:18}}>
        <NavLink to="/" style={({isActive}) => ({...linkStyle, ...(isActive?active:{})})}>Accueil</NavLink>
        <NavLink to="/shop" style={({isActive}) => ({...linkStyle, ...(isActive?active:{})})}>Boutique</NavLink>
      </nav>
    </header>
  );
}
