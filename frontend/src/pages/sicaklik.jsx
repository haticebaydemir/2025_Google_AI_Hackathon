import React, { useState, useEffect, useRef, useCallback } from "react";
import "./sicaklik.css";

const MATERIALS = {
  water: { name: "Su", c: 4186 },
  aluminum: { name: "Alüminyum", c: 900 },
  copper: { name: "Bakır", c: 385 },
  iron: { name: "Demir", c: 450 },
  gold: { name: "Altın", c: 129 },
};

const PARTICLE_COUNT = 150; // Parçacık sayısı azaltıldı, performans için

function SicaklikSimulasyonu() {
  const canvasRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const particlesRef = useRef([]);

  const [temp1, setTemp1] = useState(100); // Sıcak cisim °C
  const [temp2, setTemp2] = useState(0); // Soğuk cisim °C
  const [mass, setMass] = useState(1); // Kütle kg
  const [materialKey, setMaterialKey] = useState("water"); // Seçili madde

  const [results, setResults] = useState({
    heatTransfer: 0,
    equilibriumTemp: 0,
    specificHeat: MATERIALS.water.c,
  });

  const currentMaterial = MATERIALS[materialKey];

  const calculateSimulationResults = useCallback(() => {
    const t1 = parseFloat(temp1);
    const t2 = parseFloat(temp2);
    const m = parseFloat(mass);
    const c = currentMaterial.c;

    const eqTemp = (t1 + t2) / 2;
    const heatTransferred = m * c * Math.abs(t1 - eqTemp); // Birinden diğerine aktarılan ısı

    setResults({
      heatTransfer: heatTransferred,
      equilibriumTemp: eqTemp,
      specificHeat: c,
    });
  }, [temp1, temp2, mass, currentMaterial]);

  useEffect(() => {
    calculateSimulationResults();
  }, [temp1, temp2, mass, currentMaterial, calculateSimulationResults]);

  const initParticles = useCallback((canvas) => {
    particlesRef.current = [];
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const isHot = i < PARTICLE_COUNT / 2;
      particlesRef.current.push({
        x: isHot
          ? Math.random() * centerX
          : centerX + Math.random() * (width - centerX),
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2, // Hız aralığı ayarlandı
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 2 + 2, // Boyut aralığı
        isHot: isHot,
        alpha: 0.7, // Başlangıç opaklığı
      });
    }
  }, []);

  const updateAndDrawParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;

    ctx.clearRect(0, 0, width, height);

    // Arka plan ve orta çizgi
    // ctx.fillStyle = '#f0f0f0'; // Açık gri bir grid için
    // for (let x = 0; x < width; x+=20) { ctx.fillRect(x,0,1,height);}
    // for (let y = 0; y < height; y+=20) { ctx.fillRect(0,y,width,1);}

    ctx.strokeStyle = "var(--secondary-color)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Sıcaklık etiketleri (opsiyonel, üstteki kutularda var)
    // ctx.fillStyle = 'var(--text-primary)';
    // ctx.font = 'bold 14px var(--font-family)';
    // ctx.textAlign = 'center';
    // ctx.fillText(`${temp1}°C`, centerX / 2, 20);
    // ctx.fillText(`${temp2}°C`, centerX + (width - centerX) / 2, 20);

    particlesRef.current.forEach((p) => {
      // Hızı sıcaklığa göre ayarla (basit model)
      // Max sıcaklık 500, min -50. Bu aralığı 0-1 arası bir hıza map edelim.
      const tempRange = 550; // 500 - (-50)
      let speedMultiplier = p.isHot
        ? (parseFloat(temp1) + 50) / tempRange
        : (parseFloat(temp2) + 50) / tempRange;
      speedMultiplier = Math.max(0.1, Math.min(speedMultiplier * 2 + 0.2, 2.5)); // Hızı biraz artır ve sınırla

      p.x += p.vx * speedMultiplier;
      p.y += p.vy * speedMultiplier;

      // Duvarlardan sekme
      if (p.x - p.radius < 0 || p.x + p.radius > width) {
        p.vx *= -1;
        p.x = Math.max(p.radius, Math.min(width - p.radius, p.x));
      }
      if (p.y - p.radius < 0 || p.y + p.radius > height) {
        p.vy *= -1;
        p.y = Math.max(p.radius, Math.min(height - p.radius, p.y));
      }

      // Bölgeler arası geçiş (basit model)
      if (p.isHot && p.x + p.radius > centerX) {
        // Sıcak parçacık soğuk bölgeye geçti
        if (Math.random() < 0.02) p.isHot = false; // Bir olasılıkla soğur
        else p.vx *= -1; // Geri sek
      } else if (!p.isHot && p.x - p.radius < centerX) {
        // Soğuk parçacık sıcak bölgeye geçti
        if (Math.random() < 0.02) p.isHot = true; // Bir olasılıkla ısınır
        else p.vx *= -1; // Geri sek
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      const baseAlpha = p.isHot
        ? Math.min(1, 0.3 + parseFloat(temp1) / 500)
        : Math.min(1, 0.3 + (parseFloat(temp2) + 50) / 550);
      ctx.fillStyle = p.isHot
        ? `rgba(244, 67, 54, ${baseAlpha * 0.8})`
        : `rgba(33, 150, 243, ${baseAlpha * 0.8})`;
      ctx.fill();
    });

    // Isı transfer yönü oku
    if (parseFloat(temp1) !== parseFloat(temp2)) {
      const arrowY = height - 30;
      const arrowColor =
        parseFloat(temp1) > parseFloat(temp2)
          ? "var(--hot-color)"
          : "var(--cold-color)";
      const fromX =
        parseFloat(temp1) > parseFloat(temp2) ? centerX - 40 : centerX + 40;
      const toX =
        parseFloat(temp1) > parseFloat(temp2) ? centerX + 40 : centerX - 40;

      ctx.save();
      ctx.strokeStyle = arrowColor;
      ctx.fillStyle = arrowColor;
      ctx.lineWidth = 2.5;
      const headLength = 12;
      const angle = Math.atan2(arrowY - arrowY, toX - fromX); // Y ekseni aynı olduğu için fromY, toY

      ctx.beginPath();
      ctx.moveTo(fromX, arrowY);
      ctx.lineTo(toX, arrowY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(toX, arrowY);
      ctx.lineTo(
        toX - headLength * Math.cos(angle - Math.PI / 6),
        arrowY - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        toX - headLength * Math.cos(angle + Math.PI / 6),
        arrowY - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }, [temp1, temp2]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    initParticles(canvas); // Parçacıkları canvas boyutuyla başlat

    const animate = () => {
      updateAndDrawParticles();
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [initParticles, updateAndDrawParticles]); // temp1, temp2 bağımlılıktan çıkarıldı, updateAndDrawParticles içinde kullanılıyor

  useEffect(() => {
    const canvas = canvasRef.current;
    const handleResize = () => {
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext("2d");
        ctx.scale(dpr, dpr);
        initParticles(canvas); // Yeniden boyutlandırmada parçacıkları tekrar başlat
        updateAndDrawParticles(); // Hemen çiz
      }
    };
    handleResize(); // İlk yüklemede
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initParticles, updateAndDrawParticles]);

  const handleRangeChange = (setter, value) => {
    setter(parseFloat(value));
  };
  const handleNumberChange = (setter, value) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setter(num);
    } else if (value === "" || value === "-") {
      // Boş veya sadece eksi işareti girilmesine izin ver (kullanıcı yazarken)
      // Ancak state'i NaN veya hatalı bir değere set etmemek için kontrol et
    }
  };

  return (
    <div className="sicaklik-app-container">
      <header className="sicaklik-header">
        <h1>Isı ve Sıcaklık Etkileşim Simülasyonu</h1>
        <p>
          Maddelerin ısı transferi ve sıcaklık değişimlerini interaktif olarak
          keşfedin.
        </p>
      </header>

      <div className="panel control-panel">
        <h2 className="panel-title">Kontrol Parametreleri</h2>
        <div className="temperature-indicator-panel">
          <div className="temp-box hot-temp">Sıcak: {temp1}°C</div>
          <div className="temp-box cold-temp">Soğuk: {temp2}°C</div>
        </div>
        <div className="material-indicator-display">
          Seçili Madde: {currentMaterial.name} (c: {currentMaterial.c} J/kg°C)
        </div>

        <div className="input-group">
          <label htmlFor="temp1">
            Sıcak Cisim (°C) <span className="value-tag">{temp1}°C</span>
          </label>
          <input
            type="range"
            id="temp1"
            min="0"
            max="500"
            value={temp1}
            step="1"
            onChange={(e) => handleRangeChange(setTemp1, e.target.value)}
          />
          <input
            type="number"
            id="temp1Value"
            value={temp1}
            step="1"
            onChange={(e) => handleNumberChange(setTemp1, e.target.value)}
            placeholder="0-500"
          />
        </div>
        <div className="input-group">
          <label htmlFor="temp2">
            Soğuk Cisim (°C) <span className="value-tag">{temp2}°C</span>
          </label>
          <input
            type="range"
            id="temp2"
            min="-50"
            max="200"
            value={temp2}
            step="1"
            onChange={(e) => handleRangeChange(setTemp2, e.target.value)}
          />
          <input
            type="number"
            id="temp2Value"
            value={temp2}
            step="1"
            onChange={(e) => handleNumberChange(setTemp2, e.target.value)}
            placeholder="-50-200"
          />
        </div>
        <div className="input-group">
          <label htmlFor="mass">
            Kütle (kg) <span className="value-tag">{mass.toFixed(1)} kg</span>
          </label>
          <input
            type="range"
            id="mass"
            min="0.1"
            max="10"
            value={mass}
            step="0.1"
            onChange={(e) => handleRangeChange(setMass, e.target.value)}
          />
          <input
            type="number"
            id="massValue"
            value={mass}
            step="0.1"
            onChange={(e) => handleNumberChange(setMass, e.target.value)}
            placeholder="0.1-10"
          />
        </div>
        <div className="input-group">
          <label htmlFor="materialKey">Madde</label>
          <select
            id="materialKey"
            value={materialKey}
            onChange={(e) => setMaterialKey(e.target.value)}
          >
            {Object.entries(MATERIALS).map(([key, mat]) => (
              <option key={key} value={key}>
                {mat.name} (c = {mat.c} J/kg°C)
              </option>
            ))}
          </select>
        </div>

        <div className="result-display-panel">
          <h3>Hesaplanan Değerler</h3>
          <div>
            <strong>Isı Transferi (Q):</strong>{" "}
            <span>{results.heatTransfer.toFixed(0)} J</span>
          </div>
          <div>
            <strong>
              Denge Sıcaklığı (T<sub>denge</sub>):
            </strong>{" "}
            <span>{results.equilibriumTemp.toFixed(1)}°C</span>
          </div>
          <div>
            <strong>Özgül Isı (c):</strong>{" "}
            <span>{results.specificHeat} J/kg°C</span>
          </div>
        </div>
      </div>

      <div className="panel simulation-area">
        <h2 className="panel-title">Simülasyon Alanı</h2>
        <div className="canvas-wrapper">
          <canvas ref={canvasRef} id="simulationCanvas"></canvas>
        </div>
        <div className="simulation-material-indicator">
          Simülasyon: {currentMaterial.name} için Tanecik Hareketi ve Isı Akışı
        </div>
      </div>

      <div className="panel theory-panel">
        <h2 className="panel-title">Temel Kavramlar ve Formüller</h2>
        <div className="theory-section">
          <h3>Isı (Q)</h3>
          <p>
            Sıcaklıkları farklı iki madde arasında alınıp verilen enerjidir.
            Birimi Joule (J)'dür.
          </p>
          <div className="formula-display">Q = m ⋅ c ⋅ ΔT</div>
          <p>
            <strong>m:</strong> Kütle (kg)
          </p>
          <p>
            <strong>c:</strong> Özgül ısı kapasitesi (J/kg°C)
          </p>
          <p>
            <strong>ΔT:</strong> Sıcaklık değişimi (T<sub>son</sub> - T
            <sub>ilk</sub>) (°C veya K)
          </p>
        </div>
        <div className="theory-section">
          <h3>Sıcaklık (T)</h3>
          <p>
            Bir maddenin taneciklerinin ortalama kinetik enerjisinin bir
            ölçüsüdür. Termometre ile ölçülür. Birimleri Celsius (°C), Kelvin
            (K), Fahrenheit (°F) olabilir.
          </p>
        </div>
        <div className="theory-section">
          <h3>Özgül Isı Kapasitesi (c)</h3>
          <p>
            Bir maddenin birim kütlesinin (1 kg veya 1 g) sıcaklığını birim
            derece (1°C veya 1K) artırmak için gereken ısı miktarıdır. Maddeler
            için ayırt edici bir özelliktir.
          </p>
          <ul>
            {Object.values(MATERIALS).map((mat) => (
              <li key={mat.name}>
                {mat.name}: {mat.c} J/kg°C
              </li>
            ))}
          </ul>
        </div>
        <div className="theory-section">
          <h3>Isıl Denge</h3>
          <p>
            Farklı sıcaklıklardaki iki veya daha fazla madde bir araya
            getirildiğinde, aralarında ısı alışverişi olur. Isı akışı sıcak
            maddeden soğuk maddeye doğrudur. Yeterli süre beklendiğinde sistem
            ısıl dengeye ulaşır ve tüm maddelerin sıcaklıkları eşitlenir. Bu son
            sıcaklığa denge sıcaklığı denir.
          </p>
          <p>
            Alınan Isı = Verilen Isı (Q<sub>alınan</sub> = -Q<sub>verilen</sub>)
          </p>
        </div>
      </div>
    </div>
  );
}

export default SicaklikSimulasyonu;
