import { Link } from "react-router-dom"

export default function Nav() {
  return (
    <nav style={{ 
      display: "flex", 
      justifyContent: "center", 
      gap: "20px", 
      padding: "20px", 
      background: "#f4f4f4" 
    }}>
      <Link to="/" style={{ textDecoration: "none", fontWeight: "bold" }}>
        Accueil
      </Link>
      <Link to="/boutique" style={{ textDecoration: "none", fontWeight: "bold" }}>
        Boutique
      </Link>
    </nav>
  )
}
