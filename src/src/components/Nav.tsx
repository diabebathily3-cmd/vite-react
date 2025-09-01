import { NavLink } from 'react-router-dom'

export default function Nav() {
  const linkStyle: React.CSSProperties = {
    textDecoration: 'none', color: '#111', margin: '0 15px', fontWeight: 600
  }
  const activeStyle: React.CSSProperties = { ...linkStyle, borderBottom: '2px solid tomato' }

  return (
    <nav style={{ padding: 15, textAlign: 'center' }}>
      <NavLink to="/"    style={({ isActive }) => isActive ? activeStyle : linkStyle}>Home</NavLink>
      <NavLink to="/shop" style={({ isActive }) => isActive ? activeStyle : linkStyle}>Shop</NavLink>
    </nav>
  )
}
