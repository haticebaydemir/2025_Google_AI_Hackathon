//frontend\src\pages\HomePage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import {
  FaAtom,
  FaFlask,
  FaDna,
  FaSquareRootAlt,
  FaChartLine,
  FaRegClock,
  FaGraduationCap,
} from "react-icons/fa";

const HomePage = () => {
  const [username, setUsername] = useState("Öğrenci");
  const [greeting, setGreeting] = useState("");
  const [date, setDate] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting("Günaydın");
      } else if (hour >= 12 && hour < 18) {
        setGreeting("İyi Günler");
      } else {
        setGreeting("İyi Akşamlar");
      }
    };

    updateGreeting();

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setDate(new Date().toLocaleDateString("tr-TR", options));

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const courses = [
    {
      id: 1,
      title: "Fizik",
      description:
        "Mekanik, termodinamik, elektrik ve manyetizma gibi temel fizik konularını keşfedin.",
      icon: <FaAtom />,
      color: "#3498db",
      progress: 65,
      path: "/fizik",
    },
    {
      id: 2,
      title: "Kimya",
      description:
        "Atomlar, moleküller, reaksiyonlar ve periyodik tablonun sırlarını öğrenin.",
      icon: <FaFlask />,
      color: "#e74c3c",
      progress: 42,
      path: "/kimya",
    },
    {
      id: 3,
      title: "Biyoloji",
      description:
        "Canlıların yapısını, işlevlerini ve ekosistemdeki rollerini inceleyin.",
      icon: <FaDna />,
      color: "#2ecc71",
      progress: 78,
      path: "/biyoloji",
    },
    {
      id: 4,
      title: "Geometri",
      description:
        "Şekiller, açılar, uzaysal ilişkiler ve matematiksel teoremler dünyasına dalın.",
      icon: <FaSquareRootAlt />,
      color: "#9b59b6",
      progress: 53,
      path: "/geometri",
    },
  ];

  return (
    <div className="home-page">
      <div className="top-banner">
        <div className="live-time">
          <FaRegClock />
          <span>{currentTime.toLocaleTimeString("tr-TR")}</span>
        </div>
        <div className="date-display">{date}</div>
      </div>

      <section className="hero-section">
        <div className="welcome-container">
          <div className="greeting-text">
            <h1>{greeting},</h1>
            <h2>{username}</h2>
          </div>
          <p className="welcome-message">
            Bilimsel dünyaya hoş geldiniz! Bugün ne öğrenmek istiyorsunuz?
          </p>
        </div>
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">
              <FaChartLine />
            </div>
            <div className="stat-info">
              <h3>Toplam İlerleme</h3>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: "60%" }}></div>
              </div>
              <span>%60</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaGraduationCap />
            </div>
            <div className="stat-info">
              <h3>Tamamlanan Dersler</h3>
              <p>12/20</p>
            </div>
          </div>
        </div>
      </section>

      <section className="courses-section">
        <h2 className="section-title">
          <span className="highlight">Dersler</span>
        </h2>
        <div className="courses-grid">
          {courses.map((course) => (
            <Link to={course.path} key={course.id} className="course-card">
              <div
                className="course-icon"
                style={{ backgroundColor: course.color }}
              >
                {course.icon}
              </div>
              <div className="course-content">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-progress">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${course.progress}%`,
                        backgroundColor: course.color,
                      }}
                    ></div>
                  </div>
                  <span className="progress-text">{course.progress}%</span>
                </div>
              </div>
              <div className="card-footer">
                <span className="explore-btn">Keşfet</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured-section">
        <h2 className="section-title">
          <span className="highlight">Önerilen İçerik</span>
        </h2>
        <div className="featured-card">
          <div className="featured-content">
            <h3>Atışlar Konusunu Keşfedin</h3>
            <p>
              Yatay ve düşey atış problemlerini interaktif simülasyonlarla
              öğrenin.
            </p>
            <Link to="/atislar" className="featured-button">
              Simülasyona Git
            </Link>
          </div>
          <div className="featured-image">
            <div className="image-placeholder">
              <FaAtom className="placeholder-icon" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
