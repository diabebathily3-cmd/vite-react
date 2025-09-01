export default function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <h1>Welcome to my store 🛒</h1>
      <p>Click “Shop” to browse Realme phones.</p>
      <a href="/shop" style={{
        display:'inline-block', padding:'12px 24px', background:'#0b74f2',
        color:'#fff', borderRadius:8, textDecoration:'none', marginTop:20
      }}>
        Go to shop
      </a>
    </div>
  )
}
