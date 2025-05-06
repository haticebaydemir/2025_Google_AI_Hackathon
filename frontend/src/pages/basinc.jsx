import React, { useState, useEffect, useRef, useCallback } from "react";
import "./basinc.css";

const GRAVITY = 9.81;
const MAX_CONTAINERS = 5;
const CANVAS_BASE_Y_OFFSET = 50;
const PIXEL_TO_METER_SCALE = 0.002;

const LIQUID_PROPERTIES = {
  water: { density: 1000, color: "#3498db", name: "Su" },
  mercury: { density: 13600, color: "#95a5a6", name: "Cıva" },
  oil: { density: 920, color: "#f1c40f", name: "Yağ" },
  gasoline: { density: 800, color: "#e67e22", name: "Benzin" },
};

const CONTAINER_TYPES = {
  rectangular: "Dikdörtgen",
  widening: "Genişleyen",
  narrowing: "Daralan",
};

function Basinc() {
  const canvasRef = useRef(null);
  const tooltipRef = useRef(null);
  const [containers, setContainers] = useState([]);
  const [selectedContainerId, setSelectedContainerId] = useState(null);
  const [nextContainerX, setNextContainerX] = useState(50); // İlk kap için X pozisyonu

  // Kontrol Paneli State'leri
  const [containerType, setContainerType] = useState("rectangular");
  const [liquidType, setLiquidType] = useState("water");
  const [liquidHeightMM, setLiquidHeightMM] = useState(250); // mm
  const [baseAreaCM2, setBaseAreaCM2] = useState(60); // cm²

  const [hoveredContainerInfo, setHoveredContainerInfo] = useState("");
  const [tooltipContent, setTooltipContent] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: "",
  });

  const mmToM = (mm) => mm * 0.001;
  const cm2ToM2 = (cm2) => cm2 * 0.0001;
  const mToPx = (m) => m / PIXEL_TO_METER_SCALE;
  const pxToM = (px) => px * PIXEL_TO_METER_SCALE;

  // Konteyner Sınıfı (Fonksiyonel Yaklaşım)
  const createContainer = (
    id,
    x,
    type,
    liquidKey,
    heightMM,
    areaCM2,
    canvasHeight
  ) => {
    const liquidProps = LIQUID_PROPERTIES[liquidKey];
    const baseWidthPx = Math.sqrt(areaCM2) * 5; // Taban genişliği için kaba bir piksel hesabı
    const totalHeightPx = mToPx(0.55); // Max 500mm + biraz boşluk

    let topWidthPx = baseWidthPx;
    let bottomWidthPx = baseWidthPx;

    if (type === "widening") {
      topWidthPx = baseWidthPx * 0.7; // Üst dar, alt geniş
      bottomWidthPx = baseWidthPx * 1.3;
    } else if (type === "narrowing") {
      topWidthPx = baseWidthPx * 1.3; // Üst geniş, alt dar
      bottomWidthPx = baseWidthPx * 0.7;
    }

    const baseY = canvasHeight - CANVAS_BASE_Y_OFFSET; // Kabın tabanının Y koordinatı

    return {
      id,
      x,
      type,
      liquidKey,
      liquidProps,
      heightMM,
      baseAreaCM2,
      baseY,
      totalHeightPx, // Piksel cinsinden toplam kap yüksekliği
      currentLiquidHeightPx: mToPx(mmToM(heightMM)),
      topWidthPx,
      bottomWidthPx, // Piksel cinsinden üst ve alt genişlikler
      isSelected: false,
    };
  };

  const calculatePressure = (density, heightM) => density * GRAVITY * heightM;
  const calculateForce = (pressurePa, areaM2) => pressurePa * areaM2;

  const drawContainerInstance = useCallback((ctx, container) => {
    if (!ctx || !container) return;
    const {
      x,
      baseY,
      totalHeightPx,
      currentLiquidHeightPx,
      topWidthPx,
      bottomWidthPx,
      type,
      liquidProps,
      isSelected,
    } = container;

    ctx.save();
    // Kap Çizimi
    ctx.strokeStyle = isSelected
      ? "var(--accent-color)"
      : "var(--primary-color)";
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.beginPath();
    // Kap kenarları (Y ekseni yukarı doğru pozitif olacak şekilde çizim)
    ctx.moveTo(x - topWidthPx / 2, baseY - totalHeightPx); // Sol üst
    ctx.lineTo(x - bottomWidthPx / 2, baseY); // Sol alt
    ctx.lineTo(x + bottomWidthPx / 2, baseY); // Sağ alt
    ctx.lineTo(x + topWidthPx / 2, baseY - totalHeightPx); // Sağ üst
    if (type === "rectangular") {
      ctx.closePath(); // Dikdörtgen için kapat
    }
    ctx.stroke();

    // Sıvı Çizimi
    if (currentLiquidHeightPx > 0) {
      const liquidTopY = baseY - currentLiquidHeightPx;
      let liquidTopWidth = topWidthPx;
      let liquidBottomWidth = bottomWidthPx;

      // Sıvının anlık genişliğini hesapla (doğrusal interpolasyon)
      if (type !== "rectangular") {
        const heightRatio = currentLiquidHeightPx / totalHeightPx; // Sıvının kap içindeki oransal yüksekliği
        liquidTopWidth =
          bottomWidthPx + (topWidthPx - bottomWidthPx) * (1 - heightRatio); // Sıvının üst genişliği
        // Sıvının taban genişliği her zaman kabın taban genişliği
      } else {
        liquidTopWidth = topWidthPx; // Dikdörtgende üst genişlik sabit
      }

      const liquidGradient = ctx.createLinearGradient(
        x,
        liquidTopY,
        x + liquidTopWidth,
        liquidTopY
      );

      liquidGradient.addColorStop(0, liquidProps.color);
      liquidGradient.addColorStop(1, liquidProps.color);

      ctx.fillStyle = liquidGradient;

      ctx.beginPath();
      ctx.moveTo(x - liquidTopWidth / 2, liquidTopY); // Sıvı sol üst
      ctx.lineTo(x - bottomWidthPx / 2, baseY); // Sıvı sol alt
      ctx.lineTo(x + bottomWidthPx / 2, baseY); // Sıvı sağ alt
      ctx.lineTo(x + liquidTopWidth / 2, liquidTopY); // Sıvı sağ üst
      ctx.closePath();
      ctx.fill();

      // Sıvı yüzeyi çizgisi
      ctx.beginPath();
      ctx.moveTo(x - liquidTopWidth / 2, liquidTopY);
      ctx.lineTo(x + liquidTopWidth / 2, liquidTopY);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
  }, []);

  const drawAllContainers = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid Çizimi (İsteğe Bağlı)
    // drawGrid(ctx, canvas.width, canvas.height);

    containers.forEach((container) => {
      drawContainerInstance(ctx, container);
    });
  }, [containers, drawContainerInstance]);

  useEffect(() => {
    drawAllContainers();
  }, [containers, drawAllContainers]);

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
        drawAllContainers();
      }
    };
    handleResize(); // İlk yüklemede boyut ayarla
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawAllContainers]);

  const addContainer = () => {
    if (containers.length >= MAX_CONTAINERS) {
      alert(`En fazla ${MAX_CONTAINERS} kap ekleyebilirsiniz!`);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newId = `container-${Date.now()}`;
    const newContainer = createContainer(
      newId,
      nextContainerX,
      containerType,
      liquidType,
      liquidHeightMM,
      baseAreaCM2,
      canvas.height / (window.devicePixelRatio || 1) // Ölçeklenmemiş yükseklik
    );
    const updatedContainers = [...containers, newContainer];
    setContainers(updatedContainers);
    setSelectedContainerId(newId);
    setNextContainerX(
      (prevX) => prevX + (newContainer.bottomWidthPx || 100) + 40
    ); // Sonraki X pozisyonu
  };

  const clearAllContainers = () => {
    if (
      containers.length === 0 ||
      window.confirm("Tüm kapları silmek istediğinize emin misiniz?")
    ) {
      setContainers([]);
      setSelectedContainerId(null);
      setNextContainerX(50);
      setHoveredContainerInfo("");
    }
  };

  const updateSelectedContainerProperties = useCallback(() => {
    if (!selectedContainerId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setContainers((prevContainers) =>
      prevContainers.map((c) => {
        if (c.id === selectedContainerId) {
          // createContainer'ı yeni değerlerle çağırarak güncelle
          return createContainer(
            c.id,
            c.x,
            containerType,
            liquidType,
            liquidHeightMM,
            baseAreaCM2,
            canvas.height / (window.devicePixelRatio || 1)
          );
        }
        return c;
      })
    );
  }, [
    selectedContainerId,
    containerType,
    liquidType,
    liquidHeightMM,
    baseAreaCM2,
  ]);

  useEffect(() => {
    updateSelectedContainerProperties();
  }, [
    containerType,
    liquidType,
    liquidHeightMM,
    baseAreaCM2,
    updateSelectedContainerProperties,
  ]);

  const handleCanvasHover = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // DPI ölçeklemesi için
    const scaleY = canvas.height / rect.height;
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    let foundContainer = null;
    for (const container of containers) {
      const { x, baseY, totalHeightPx, topWidthPx, bottomWidthPx } = container;
      // Basit bir sınırlayıcı kutu kontrolü
      const minX = x - Math.max(topWidthPx, bottomWidthPx) / 2;
      const maxX = x + Math.max(topWidthPx, bottomWidthPx) / 2;
      const minY = baseY - totalHeightPx;
      const maxY = baseY;

      if (
        mouseX >= minX &&
        mouseX <= maxX &&
        mouseY >= minY &&
        mouseY <= maxY
      ) {
        foundContainer = container;
        break;
      }
    }

    if (foundContainer) {
      const depthPx = foundContainer.baseY - mouseY; // Sıvı yüzeyinden derinlik (px)
      const liquidDepthPx = Math.min(
        depthPx,
        foundContainer.currentLiquidHeightPx
      );

      if (liquidDepthPx > 0) {
        const pressurePa = calculatePressure(
          foundContainer.liquidProps.density,
          pxToM(liquidDepthPx)
        );
        setTooltipContent({
          visible: true,
          x: event.clientX, // Tooltip pozisyonu için orijinal clientX/Y
          y: event.clientY,
          text: `Derinlik: ${pxToM(liquidDepthPx).toFixed(
            2
          )}m | Basınç: ${pressurePa.toFixed(0)} Pa`,
        });
      } else {
        setTooltipContent({ visible: false });
      }
      setHoveredContainerInfo(
        `Kap: ${CONTAINER_TYPES[foundContainer.type]} | Sıvı: ${
          foundContainer.liquidProps.name
        } | Yükseklik: ${foundContainer.heightMM}mm`
      );
    } else {
      setTooltipContent({ visible: false });
      setHoveredContainerInfo(
        containers.length > 0
          ? "Bir kabın üzerine gelin."
          : "Kontrolleri kullanarak kap ekleyin."
      );
    }
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    for (const container of containers) {
      const { x, baseY, totalHeightPx, topWidthPx, bottomWidthPx } = container;
      const minX = x - Math.max(topWidthPx, bottomWidthPx) / 2;
      const maxX = x + Math.max(topWidthPx, bottomWidthPx) / 2;
      const minY = baseY - totalHeightPx;
      const maxY = baseY;

      if (
        mouseX >= minX &&
        mouseX <= maxX &&
        mouseY >= minY &&
        mouseY <= maxY
      ) {
        setSelectedContainerId(container.id);
        // Kontrolleri seçilen kapla güncelle
        setContainerType(container.type);
        setLiquidType(container.liquidKey);
        setLiquidHeightMM(container.heightMM);
        setBaseAreaCM2(container.baseAreaCM2);
        return;
      }
    }
  };

  return (
    <div className="basinc-app-container">
      <header className="basinc-header">
        <h1>Sıvı Basınç Simülasyon Laboratuvarı</h1>
        <p className="subtitle">
          Fizik prensiplerini interaktif olarak keşfedin!
        </p>
      </header>

      <div className="control-panel">
        <h2 className="section-title">Kontrol Paneli</h2>
        <div className="control-group">
          <label htmlFor="containerType">Kap Şekli</label>
          <select
            id="containerType"
            value={containerType}
            onChange={(e) => setContainerType(e.target.value)}
          >
            {Object.entries(CONTAINER_TYPES).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label htmlFor="liquidType">Sıvı Türü</label>
          <select
            id="liquidType"
            value={liquidType}
            onChange={(e) => setLiquidType(e.target.value)}
          >
            {Object.entries(LIQUID_PROPERTIES).map(([key, props]) => (
              <option key={key} value={key}>
                {props.name} (ρ={props.density} kg/m³)
              </option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label htmlFor="heightRange">
            Sıvı Yüksekliği{" "}
            <span className="value-hint">{liquidHeightMM} mm</span>
          </label>
          <input
            type="range"
            id="heightRange"
            min="0"
            max="500"
            value={liquidHeightMM}
            step="10"
            onChange={(e) => setLiquidHeightMM(parseInt(e.target.value))}
          />
          <div className="value-display-text">
            <span>0 mm</span>
            <span>500 mm</span>
          </div>
        </div>
        <div className="control-group">
          <label htmlFor="areaRange">
            Taban Alanı <span className="value-hint">{baseAreaCM2} cm²</span>
          </label>
          <input
            type="range"
            id="areaRange"
            min="20"
            max="150"
            value={baseAreaCM2}
            step="5"
            onChange={(e) => setBaseAreaCM2(parseInt(e.target.value))}
          />
          <div className="value-display-text">
            <span>20 cm²</span>
            <span>150 cm²</span>
          </div>
        </div>
        <button className="button" onClick={addContainer}>
          Yeni Kap Ekle
        </button>
        <button className="button clear" onClick={clearAllContainers}>
          Tümünü Temizle
        </button>
      </div>

      <div className="simulation-panel">
        <h2 className="section-title">Simülasyon Alanı</h2>
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            id="pressureCanvas"
            onMouseMove={handleCanvasHover}
            onClick={handleCanvasClick}
            onMouseLeave={() => setTooltipContent({ visible: false })}
          ></canvas>
        </div>
        <div
          className={`container-info-box ${!hoveredContainerInfo && "hidden"}`}
        >
          {hoveredContainerInfo ||
            "Bir kabın üzerine gelin veya yeni kap ekleyin."}
        </div>
        {tooltipContent.visible && (
          <div
            ref={tooltipRef}
            className="pressure-tooltip"
            style={{ left: tooltipContent.x, top: tooltipContent.y }}
          >
            {tooltipContent.text}
          </div>
        )}
      </div>

      <div className="results-panel">
        <h2 className="section-title">Hesaplamalar ve Sonuçlar</h2>
        <div className="formula-container">
          <h3>Temel Formüller</h3>
          <p className="formula">P = ρ × g × h</p>
          <p>
            <strong>P:</strong> Basınç (Pascal, Pa), <strong>ρ:</strong>{" "}
            Yoğunluk (kg/m³), <strong>g:</strong> Yerçekimi (9.81 m/s²),{" "}
            <strong>h:</strong> Yükseklik (m)
          </p>
          <p className="formula">F = P × A</p>
          <p>
            <strong>F:</strong> Kuvvet (Newton, N), <strong>A:</strong> Yüzey
            Alanı (m²)
          </p>
        </div>
        <div className="results-table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>Kap Bilgisi</th>
                <th>Taban Basıncı (Pa)</th>
                <th>Tabana Etki Eden Kuvvet (N)</th>
              </tr>
            </thead>
            <tbody>
              {containers.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Henüz kap eklenmedi.
                  </td>
                </tr>
              ) : (
                containers.map((c) => {
                  const pressure = calculatePressure(
                    c.liquidProps.density,
                    mmToM(c.heightMM)
                  );
                  const force = calculateForce(
                    pressure,
                    cm2ToM2(c.baseAreaCM2)
                  );
                  return (
                    <tr
                      key={c.id}
                      className={selectedContainerId === c.id ? "selected" : ""}
                      onClick={() => {
                        setSelectedContainerId(c.id);
                        setContainerType(c.type);
                        setLiquidType(c.liquidKey);
                        setLiquidHeightMM(c.heightMM);
                        setBaseAreaCM2(c.baseAreaCM2);
                      }}
                    >
                      <td>
                        <span
                          className="liquid-indicator"
                          style={{ backgroundColor: c.liquidProps.color }}
                        ></span>
                        {CONTAINER_TYPES[c.type]} - {c.liquidProps.name}
                      </td>
                      <td>{pressure.toFixed(0)}</td>
                      <td>{force.toFixed(2)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Basinc;
