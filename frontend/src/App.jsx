//frontend\src\App.jsx
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ChatbotModal from "./components/ChatbotModal"; // ChatbotModal'ı import et
import Atislar from "./pages/atislar";
import HomePage from "./pages/HomePage";
import ComingSoon from "./pages/ComingSoon";
import Devre from "./pages/devre";
import Basinc from "./pages/basinc";
import ElectrostaticsSimulation from "./pages/elektrostatik";
import SicaklikSimulasyonu from "./pages/sicaklik";
// Kaldırma kuvveti import'u kaldırıldı
import "./App.css";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    console.log(
      "Toggling sidebar collapse from:",
      sidebarCollapsed,
      "to:",
      !sidebarCollapsed
    );
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const getMainContentClass = () => {
    if (!sidebarOpen) return "full-width";
    if (sidebarCollapsed) return "sidebar-collapsed";
    return "";
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={sidebarCollapsed}
          toggleCollapse={toggleSidebarCollapse}
        />

        {/* Mobil için hamburger menu */}
        <div className="hamburger-menu" onClick={toggleSidebar}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Ana içerik */}
        <div className={`main-content ${getMainContentClass()}`}>
          <Routes>
            {/* Ana yol - anasayfaya yönlendir */}
            <Route path="/" element={<HomePage />} />

            {/* Atışlar sayfası */}
            <Route path="/atislar" element={<Atislar />} />

            {/* Devre sayfası */}
            <Route path="/devre" element={<Devre />} />

            {/* Basınç sayfası */}
            <Route path="/basinc" element={<Basinc />} />

            {/* Elektrostatik sayfası */}
            <Route
              path="/elektrostatik"
              element={<ElectrostaticsSimulation />}
            />

            {/* Sıcaklık sayfası */}
            <Route path="/sicaklik" element={<SicaklikSimulasyonu />} />

            {/* "Çok Yakında" mesajı gösterilecek sayfalar */}
            <Route path="/fizik" element={<ComingSoon />} />
            <Route path="/fizik/kinematics" element={<ComingSoon />} />
            <Route path="/fizik/dinamik" element={<ComingSoon />} />
            <Route path="/kimya" element={<ComingSoon />} />
            <Route path="/kimya/elementler" element={<ComingSoon />} />
            <Route path="/kimya/baglar" element={<ComingSoon />} />
            <Route path="/biyoloji" element={<ComingSoon />} />
            <Route path="/geometri" element={<ComingSoon />} />

            {/* 404 - Sayfa bulunamadı */}
            <Route path="*" element={<h1>Sayfa Bulunamadı!</h1>} />
          </Routes>
        </div>

        {/* Chatbot Modal - tüm sayfalarda görünecek */}
        <ChatbotModal />
      </div>
    </BrowserRouter>
  );
}

export default App;
