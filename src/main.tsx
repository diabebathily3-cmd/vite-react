import Nav from './composants/Nav'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Pages/Accueil'
import Shop from './Pages/Boutique'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/boutique" element={<Shop />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
