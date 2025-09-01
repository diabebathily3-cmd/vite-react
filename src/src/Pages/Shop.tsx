export default function Shop() {
  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h1>Nos téléphones Realme</h1>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", marginTop: "30px" }}>
        
        <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px", width: "200px" }}>
          <img src="https://fdn2.gsmarena.com/vv/bigpic/realme-c11-2021.jpg" alt="Realme C11" width="180" />
          <h3>Realme C11</h3>
          <p>Prix : 100€</p>
        </div>

        <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px", width: "200px" }}>
          <img src="https://fdn2.gsmarena.com/vv/bigpic/realme-gt5.jpg" alt="Realme GT5" width="180" />
          <h3>Realme GT5</h3>
          <p>Prix : 380€</p>
        </div>

      </div>
    </div>
  );
}
