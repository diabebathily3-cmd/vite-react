const produits = [
  {
    nom: "Realme C11",
    prix: "120€",
    image: "https://fdn2.gsmarena.com/vv/bigpic/realme-c11-2021.jpg"
  },
  {
    nom: "Realme Narzo 30",
    prix: "180€",
    image: "https://fdn2.gsmarena.com/vv/bigpic/realme-narzo-30.jpg"
  },
  {
    nom: "Realme C25",
    prix: "150€",
    image: "https://fdn2.gsmarena.com/vv/bigpic/realme-c25.jpg"
  },
  {
    nom: "Realme GT Master",
    prix: "250€",
    image: "https://fdn2.gsmarena.com/vv/bigpic/realme-gt-master.jpg"
  }
];

export default function Shop() {
  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>🛒 Boutique Realme</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginTop: "30px"
        }}
      >
        {produits.map((p, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "15px",
              background: "#fff"
            }}
          >
            <img
              src={p.image}
              alt={p.nom}
              style={{ width: "100%", borderRadius: "8px" }}
            />
            <h2>{p.nom}</h2>
            <p style={{ fontWeight: "bold", color: "#f59e0b" }}>{p.prix}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
