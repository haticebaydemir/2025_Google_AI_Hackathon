import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";
import {
  FiHome,
  FiChevronDown,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";
import {
  FaAtom,
  FaFlask,
  FaDna,
  FaSquareRootAlt,
  FaProjectDiagram,
  FaBolt,
  FaWater,
  FaBolt as FaElectroStatic,
  FaThermometerHalf,
} from "react-icons/fa";
import { TbLogout2 } from "react-icons/tb";

const Sidebar = ({ isCollapsed, toggleCollapse }) => {
  const [expandedMenus, setExpandedMenus] = useState({
    fizik: true,
  });
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (
      path.includes("/fizik") ||
      path.includes("/atislar") ||
      path.includes("/devre") ||
      path.includes("/basinc") ||
      path.includes("/elektrostatik") ||
      path.includes("/sicaklik")
      // "/kaldirma" referansı kaldırıldı
    ) {
      setExpandedMenus((prev) => ({ ...prev, fizik: true }));
    }
    if (path.includes("/kimya")) {
      setExpandedMenus((prev) => ({ ...prev, kimya: true }));
    }
  }, [location]);

  const toggleMenu = (menu) => {
    if (!isCollapsed) {
      setExpandedMenus((prev) => ({
        ...prev,
        [menu]: !prev[menu],
      }));
    }
  };

  const handleLogout = () => {
    console.log("Çıkış yapıldı");
    alert("Demo amaçlı çıkış butonu - Gerçek çıkış işlemi şu anda yapılmıyor.");
  };

  return (
    <div className={`sidebar ${isCollapsed ? "closed" : "open"}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <h2>Yapay Ders</h2>
        </div>
      </div>

      <div className="sidebar-toggle" onClick={toggleCollapse}>
        <FiChevronLeft />
      </div>

      <nav className="menu-items">
        <span className="category-label">Ana Menü</span>
        <ul>
          <li className="menu-item">
            <NavLink to="/" exact="true">
              <span className="icon">
                <FiHome />
              </span>
              <span className="text">Ana Sayfa</span>
            </NavLink>
          </li>
        </ul>

        <span className="category-label">Dersler</span>
        <ul>
          <li className="menu-item has-submenu">
            <div
              className={`menu-title ${expandedMenus.fizik ? "expanded" : ""}`}
              onClick={() => toggleMenu("fizik")}
            >
              <span className="icon">
                <FaAtom />
              </span>
              <span className="text">FİZİK</span>
              <span className="arrow">
                {expandedMenus.fizik ? <FiChevronDown /> : <FiChevronRight />}
              </span>
            </div>

            {(expandedMenus.fizik || isCollapsed) && (
              <ul className="sub-menu">
                <li className="sub-menu-item">
                  <NavLink to="/atislar">
                    <span className="icon">
                      <FaProjectDiagram />
                    </span>
                    <span className="text">Atışlar</span>
                  </NavLink>
                </li>
                <li className="sub-menu-item">
                  <NavLink to="/devre">
                    <span className="icon">
                      <FaBolt />
                    </span>
                    <span className="text">Elektrik Devresi</span>
                  </NavLink>
                </li>
                <li className="sub-menu-item">
                  <NavLink to="/basinc">
                    <span className="icon">
                      <FaWater />
                    </span>
                    <span className="text">Sıvı Basıncı</span>
                  </NavLink>
                </li>
                {/* Kaldırma kuvveti öğesi kaldırıldı */}
                <li className="sub-menu-item">
                  <NavLink to="/elektrostatik">
                    <span className="icon">
                      <FaElectroStatic />
                    </span>
                    <span className="text">Elektrostatik</span>
                  </NavLink>
                </li>
                <li className="sub-menu-item">
                  <NavLink to="/sicaklik">
                    <span className="icon">
                      <FaThermometerHalf />
                    </span>
                    <span className="text">Isı ve Sıcaklık</span>
                  </NavLink>
                </li>
                <li className="sub-menu-item">
                  <NavLink to="/fizik/kinematics">
                    <span className="icon">
                      <FaProjectDiagram />
                    </span>
                    <span className="text">Kinematik</span>
                  </NavLink>
                </li>
                <li className="sub-menu-item">
                  <NavLink to="/fizik/dinamik">
                    <span className="icon">
                      <FaProjectDiagram />
                    </span>
                    <span className="text">Dinamik</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          <li className="menu-item has-submenu">
            <div
              className={`menu-title ${expandedMenus.kimya ? "expanded" : ""}`}
              onClick={() => toggleMenu("kimya")}
            >
              <span className="icon">
                <FaFlask />
              </span>
              <span className="text">KİMYA</span>
              <span className="arrow">
                {expandedMenus.kimya ? <FiChevronDown /> : <FiChevronRight />}
              </span>
            </div>

            {(expandedMenus.kimya || isCollapsed) && (
              <ul className="sub-menu">
                <li className="sub-menu-item">
                  <NavLink to="/kimya/elementler">
                    <span className="icon">
                      <FaFlask />
                    </span>
                    <span className="text">Elementler</span>
                  </NavLink>
                </li>
                <li className="sub-menu-item">
                  <NavLink to="/kimya/baglar">
                    <span className="icon">
                      <FaFlask />
                    </span>
                    <span className="text">Kimyasal Bağlar</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          <li className="menu-item">
            <NavLink to="/biyoloji">
              <span className="icon">
                <FaDna />
              </span>
              <span className="text">BİYOLOJİ</span>
            </NavLink>
          </li>

          <li className="menu-item">
            <NavLink to="/geometri">
              <span className="icon">
                <FaSquareRootAlt />
              </span>
              <span className="text">GEOMETRİ</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="logout-container">
        <button className="logout-button" onClick={handleLogout}>
          <span className="logout-icon">
            <TbLogout2 />
          </span>
          <span className="logout-text">Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
