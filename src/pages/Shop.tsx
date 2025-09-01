import React from "react";
import "./App.css";

function App() {
  const realmePhones = [
    // Série C
    { name: "Realme C11", price: "100€", image: "https://fdn2.gsmarena.com/vv/pics/realme/realme-c11-2021-1.jpg" },
    { name: "Realme C21", price: "120€", image: "https://fdn2.gsmarena.com/vv/pics/realme/realme-c21-1.jpg" },
    { name: "Realme C25", price: "150€", image: "https://fdn2.gsmarena.com/vv/pics/realme/realme-c25-1.jpg" },

    // Série Narzo
    { name: "Realme Narzo 30", price: "160€", image: "https://fdn2.gsmarena.com/vv/pics/realme/realme-narzo-30-1.jpg" },
    { name: "Realme Narzo 50", price: "180€", image: "https://fdn2.gsmarena.com/vv/pics/realme/realme-narzo-50-1.jpg" },

    // Série Number
    { name: "Realme 7", price: "200€", image: "https://fdn2.gsmarena.com/vv/pics/realme/realme-7-1.jpg" },
    { name: "Realme 8", price: "220€", image: "https://fdn2.gsmarena.com/vv/pics/realme/realme-8-1.jpg" },
    { name: "Realme 9", price: "250€", image: "https://fdn2.gsmarena.com/vv/pics/realme/realme-9-1.jpg" },
    { name: "Realme 10", price: "280€", image: "https://fdn2.gsmarena.com/vv/pics/realme/realme-10-1.jpg" },
    { name: "Realme 11", price: "300€", image: "https://fdn2.gsmarena.com/vv/pics/realme/realme-11-1.jpg" },
    { name: "Realme 12", price: "350€", image: "https://fdn2.gsmarena.com/vv/pics/realme/realme-12-1.jpg" },

    // Série GT
    { name: "Realme GT Neo 2", price: "400€", image: "https://fdn2.gsmarena.com/vv/pics/realme/realme-gt-neo2-1.jpg" },
    { name: "Realme GT 2", price: "450€", image: "https://fdn2.gsmarena.com/vv/pics/realme/realme-gt2-1.jpg" },
    { name: "Realme GT Neo 3", price: "500€", image: "https://fdn2.gsmarena.com/vv/pics/realme/realme-gt-neo3-1.jpg" },
    { name: "Realme GT 5", price: "600€", image: "https://fdn2.gsmarena.com/vv/pics/realme/realme-gt5-1.jpg" },
  ];

  return (
    <div style={{ fontFamily: "Arial", padding: "20px", textAlign: "center" }}>
      <h1>📱 Boutique Realme</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        {realmePhones.map((phone, index) => (
          <div key={index} style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "10px" }}>
            <img src={phone.image} alt={phone.name} style={{ width: "100%", borderRadius: "10px" }} />
            <h3>{phone.name}</h3>
            <p>{phone.price}</p>
            <button style={{ padding: "10px 15px", background: "#ffcc00", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              Acheter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
