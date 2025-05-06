//frontend\src\pages\ComingSoon.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./ComingSoon.css";
import { FaRegClock, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";

const ComingSoon = () => {
  const location = useLocation();
  const path = location.pathname;

  const getPageTitle = () => {
    if (path.includes("fizik/kinematics")) return "Fizik - Kinematik";
    if (path.includes("fizik/dinamik")) return "Fizik - Dinamik";
    if (path.includes("kimya/elementler")) return "Kimya - Elementler";
    if (path.includes("kimya/baglar")) return "Kimya - Kimyasal Bağlar";
    if (path.includes("biyoloji")) return "Biyoloji";
    if (path.includes("geometri")) return "Geometri";
    return "Bu Sayfa";
  };

  return (
    <div className="coming-soon-page">
      <div className="coming-soon-container">
        <div className="coming-soon-icon">
          <FaRegClock />
        </div>
        <h1 className="coming-soon-title">{getPageTitle()}</h1>
        <h2 className="coming-soon-subtitle">Çok Yakında Sizlerle</h2>

        <div className="coming-soon-message">
          <FaExclamationTriangle className="notification-icon" />
          <p>
            Bu konu üzerinde çalışmalarımız devam ediyor. Kısa süre içinde
            sizlerle buluşacak!
          </p>
        </div>

        <div className="coming-soon-info">
          <p>Bu konuyla ilgili:</p>
          <ul>
            <li>İnteraktif içerikler</li>
            <li>Detaylı açıklamalar</li>
            <li>Alıştırma ve örnekler</li>
            <li>Video dersler</li>
          </ul>
          <p className="highlight">HAZIRLANIYOR</p>
        </div>

        <Link to="/" className="back-btn">
          <FaArrowLeft />
          <span>Ana Sayfaya Dön</span>
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;
