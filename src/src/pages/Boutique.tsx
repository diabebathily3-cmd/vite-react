export default function Boutique() {
  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h1>📱 Boutique Realme</h1>
      <p>Découvrez nos modèles Realme au meilleur prix</p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "30px",
          flexWrap: "wrap",
        }}
      >
        {/* Realme 12x */}
        <div
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            borderRadius: "8px",
            width: "200px",
          }}
        >
          <img
            src="https://fdn2.gsmarena.com/vv/bigpic/realme-12x.jpg"
            alt="Realme 12x"
            width="180"
          />
          <h3>Realme 12x</h3>
          <p>Prix : 249 €</p>
        </div>

        {/* Realme GT5 */}
        <div
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            borderRadius: "8px",
            width: "200px",
          }}
        >
          <img
            src="https://fdn2.gsmarena.com/vv/bigpic/realme-gt5.jpg"
            alt="Realme GT5"
            width="180"
          />
          <h3>Realme GT5</h3>
          <p>Prix : 399 €</p>
        </div>

        {/* Realme C67 */}
        <div
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            borderRadius: "8px",
            width: "200px",
          }}
        >
          <img
            src="https://fdn2.gsmarena.com/vv/bigpic/realme-c67.jpg"
            alt="Realme C67"
            width="180"
          />
          <h3>Realme C67</h3>
          <p>Prix : 199 €</p>
        </div>
      </div>
    </div>
  );
}
