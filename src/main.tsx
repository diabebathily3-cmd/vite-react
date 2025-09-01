import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Accueil from './Pages/Accueil'
import Boutique from './Pages/Boutique'
import Nav from './composants/Nav'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/boutique" element={<Boutique />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
