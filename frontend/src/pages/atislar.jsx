//frontend\src\pages\atislar.jsx
import { useState, useEffect, useRef } from "react";
import "./atislar.css";

function Atislar() {
  const [atisTipi, setAtisTipi] = useState("egik");
  const [v0, setV0] = useState(20);
  const [theta, setTheta] = useState(10);
  const [h0, setH0] = useState(0);
  const [g, setG] = useState(9.8);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [animasyonNot, setAnimasyonNot] = useState(
    "Simülasyonu başlatmak için 'Başlat' butonuna basın"
  );
  const [isPaused, setIsPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showTrajectory, setShowTrajectory] = useState(true);

  const canvasRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const currentTimeRef = useRef(0);
  const calculatedDataRef = useRef(null);
  const scaleXRef = useRef(10);
  const scaleYRef = useRef(10);
  const objectPositionsRef = useRef([]);

  const groundPadding = 40;
  const leftPadding = 60;

  useEffect(() => {
    resetSimulation();

    if (atisTipi === "serbestDusme") {
      setV0(0);
      setH0((prev) => (prev === 0 ? 20 : prev));
    } else if (atisTipi === "yatay") {
      setV0((prev) => (prev === 0 ? 31 : prev));
      setH0((prev) => (prev === 0 ? 20 : prev));
    }
  }, [atisTipi]);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      drawAxesAndGround();
    }

    return () => {
      stopAnimation();
    };
  }, []);

  const resetSimulation = () => {
    stopAnimation();
    setResults(null);
    setError(null);
    setAnimasyonNot("Simülasyonu başlatmak için 'Başlat' butonuna basın");
    setIsPaused(false);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      drawAxesAndGround();
    }

    calculatedDataRef.current = null;
    objectPositionsRef.current = [];
  };

  const handleV0Change = (e) => {
    if (e.target.value === "") {
      setV0("");
      return;
    }

    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      if (value < 1) setV0(1);
      else if (value > 100) setV0(100);
      else setV0(value);
    }
  };

  const handleThetaChange = (e) => {
    if (e.target.value === "") {
      setTheta("");
      return;
    }

    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      if (value < 0) setTheta(0);
      else if (value > 90) setTheta(90);
      else setTheta(value);
    }
  };

  const handleH0Change = (e) => {
    if (e.target.value === "") {
      setH0("");
      return;
    }

    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      if (value < 0) setH0(0);
      else if (value > 150) setH0(150);
      else setH0(value);
    }
  };

  const handleGChange = (e) => {
    if (e.target.value === "" || e.target.value === null) {
      setG("");
      return;
    }

    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      if (value < 1) setG(1);
      else if (value > 30) setG(30);
      else setG(value);
    }
  };

  const handleV0Blur = () => {
    if (v0 === "" || isNaN(v0)) setV0(1);
  };

  const handleThetaBlur = () => {
    if (theta === "" || isNaN(theta)) setTheta(45);
  };

  const handleH0Blur = () => {
    if (h0 === "" || isNaN(h0)) setH0(0);
  };

  const handleGBlur = () => {
    if (g === "" || isNaN(g) || g < 1) setG(1);
  };

  const firlatHandler = () => {
    try {
      setError(null);
      currentTimeRef.current = 0;
      objectPositionsRef.current = [];

      const validV0 = v0 === "" ? 1 : parseFloat(v0);
      const validTheta = theta === "" ? 45 : parseFloat(theta);
      const validH0 = h0 === "" ? 0 : parseFloat(h0);
      const validG = g === "" ? 0 : parseFloat(g);

      if (validG === 0) {
        console.warn(
          "Yerçekimi ivmesi 0 olarak ayarlandı - cisim yerçekimsiz ortamda hareket edecek"
        );
      }

      const data = calculatePhysics(
        validV0,
        validTheta,
        validH0,
        validG,
        atisTipi
      );

      if (typeof data.x !== "function" || typeof data.y !== "function") {
        throw new Error("x ve y pozisyon fonksiyonları gereklidir");
      }

      calculatedDataRef.current = data;
      setResults(data);

      adjustScaling(data.range, data.maxHeight);

      const canvas = canvasRef.current;
      if (!canvas) return;

      drawAxesAndGround();

      setIsPaused(false);
      setAnimasyonNot("Animasyon başlatıldı!");

      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }

      startAnimation();
    } catch (err) {
      console.error("Hesaplama hatası:", err);
      setError("Hesaplama sırasında bir hata oluştu: " + err.message);
    }
  };

  const calculatePhysics = (v0, thetaDeg, h0, g, type) => {
    const theta = (thetaDeg * Math.PI) / 180;

    let x, y, vx, vy, flightTime, range, maxHeight, impactVelocity;

    const safeG = Math.max(1, g);

    if (type === "egik") {
      const v0x = v0 * Math.cos(theta);
      const v0y = v0 * Math.sin(theta);
      const v0y2 = v0y * v0y;
      const twoG = 2 * safeG;

      flightTime = (v0y + Math.sqrt(v0y2 + twoG * h0)) / safeG;
      range = v0x * flightTime;
      maxHeight = h0 + v0y2 / twoG;
      impactVelocity = Math.sqrt(v0x * v0x + (v0y2 + twoG * h0));

      x = (t) => v0x * t;
      y = (t) => h0 + v0y * t - 0.5 * safeG * t * t;

      vx = () => v0x;
      vy = (t) => v0y - safeG * t;
    } else if (type === "yatay") {
      const twoG = 2 * safeG;

      flightTime = Math.sqrt((2 * h0) / safeG);
      range = v0 * flightTime;
      maxHeight = h0;
      impactVelocity = Math.sqrt(v0 * v0 + twoG * h0);

      x = (t) => v0 * t;
      y = (t) => h0 - 0.5 * safeG * t * t;

      vx = () => v0;
      vy = (t) => -safeG * t;
    } else if (type === "serbestDusme") {
      flightTime = Math.sqrt((2 * h0) / safeG);
      range = 0;
      maxHeight = h0;
      impactVelocity = Math.sqrt(2 * safeG * h0);

      x = () => 0;
      y = (t) => h0 - 0.5 * safeG * t * t;

      vx = () => 0;
      vy = (t) => -safeG * t;
    }

    flightTime = isNaN(flightTime) ? 0 : Number(flightTime.toFixed(2));
    range = isNaN(range) ? 0 : Number(range.toFixed(2));
    maxHeight = isNaN(maxHeight) ? 0 : Number(maxHeight.toFixed(2));
    impactVelocity = isNaN(impactVelocity)
      ? 0
      : Number(impactVelocity.toFixed(2));

    return {
      flightTime,
      range,
      maxHeight,
      impactVelocity,
      x,
      y,
      vx,
      vy,
    };
  };

  const startAnimation = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const data = calculatedDataRef.current;

      if (
        !data ||
        typeof data.x !== "function" ||
        typeof data.y !== "function"
      ) {
        throw new Error("Geçerli pozisyon fonksiyonları bulunamadı");
      }

      const width = canvas.width;
      const height = canvas.height;
      const scaleX = scaleXRef.current;
      const scaleY = scaleYRef.current;

      const maxTime = data.flightTime;
      const timeStep = Math.max(maxTime / 100, 0.01);

      if (!isPaused) {
        currentTimeRef.current += timeStep * (1 / animationSpeed);
      }
      const time = currentTimeRef.current;

      if (time > maxTime) {
        currentTimeRef.current = 0;
        objectPositionsRef.current = [];
      }

      ctx.clearRect(0, 0, width, height);
      drawAxesAndGround();

      if (showTrajectory) {
        const pathTimeStep = Math.max(maxTime / 50, 0.02);

        ctx.beginPath();
        for (let t = 0; t <= maxTime; t += pathTimeStep) {
          const pathX = data.x(t);
          const pathY = data.y(t);

          const canvasX = leftPadding + pathX * scaleX;
          const canvasY = height - groundPadding - pathY * scaleY;

          if (t === 0) {
            ctx.moveTo(canvasX, canvasY);
          } else {
            ctx.lineTo(canvasX, canvasY);
          }
        }
        ctx.strokeStyle = "rgba(75, 192, 192, 0.6)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      const x = data.x(time);
      const y = data.y(time);

      const adjustedY = Math.max(0, y);

      const ballX = leftPadding + x * scaleX;
      const ballY = height - groundPadding - adjustedY * scaleY;

      ctx.beginPath();
      ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();

      setAnimasyonNot(
        `Simülasyon Süresi: ${time.toFixed(2)} saniye / Kalan: ${(
          maxTime - time
        ).toFixed(2)} saniye`
      );

      if (time < maxTime && !isPaused) {
        animationFrameIdRef.current = requestAnimationFrame(startAnimation);
      } else if (time >= maxTime) {
        setAnimasyonNot(
          "Simülasyon tamamlandı. Tekrar başlatmak için 'Başlat' butonuna basın"
        );
      }
    } catch (err) {
      console.error("Animasyon hatası:", err);
      setError("Animasyon sırasında bir hata oluştu: " + err.message);
    }
  };

  const stopAnimation = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
  };

  const adjustScaling = (range, maxHeight) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width - leftPadding - 40;
    const height = canvas.height - groundPadding - 40;

    const minRange = 10;
    const minHeight = 5;

    let effectiveRange = Math.max(range * 1.1, minRange);
    let effectiveHeight = Math.max(maxHeight * 1.05, minHeight);

    if (range > 500) effectiveRange = range * 1.05;
    if (maxHeight > 300) effectiveHeight = maxHeight * 1.02;

    if (range > 1000 || maxHeight > 500) {
      effectiveRange = range;
      effectiveHeight = maxHeight;
    }

    const safetyFactorX = 0.9;
    const safetyFactorY = 0.98;

    let scaleX = (width * safetyFactorX) / effectiveRange;
    let scaleY = (height * safetyFactorY) / effectiveHeight;

    const minScaleFactor = 0.01;
    if (scaleX < minScaleFactor) scaleX = minScaleFactor;
    if (scaleY < minScaleFactor) scaleY = minScaleFactor;

    scaleXRef.current = scaleX;
    scaleYRef.current = scaleY;

    console.log("Ölçeklendirme ayarlandı:", {
      range,
      maxHeight,
      effectiveRange,
      effectiveHeight,
      scaleX,
      scaleY,
      canvasWidth: width,
      canvasHeight: height,
    });
  };

  const drawAxesAndGround = () => {
    const canvas = canvasRef.current;
    if (!canvas || !calculatedDataRef.current) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const scaleX = scaleXRef.current;
    const scaleY = scaleYRef.current;
    const data = calculatedDataRef.current;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.moveTo(leftPadding, height - groundPadding);
    ctx.lineTo(width - 20, height - groundPadding);
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(leftPadding, 20);
    ctx.lineTo(leftPadding, height - groundPadding);
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "12px Arial";
    ctx.fillStyle = "#444";

    const xRange = Math.max(data.range * 1.1, 10);

    let xTickValue = 1;
    while (xRange / xTickValue > 12) {
      if (xTickValue === 1) xTickValue = 2;
      else if (xTickValue === 2) xTickValue = 5;
      else if (xTickValue === 5) xTickValue = 10;
      else xTickValue *= 10;
    }

    const xTickCount = Math.floor(xRange / xTickValue);
    const xTickWidth = (width - leftPadding - 30) / (xRange / xTickValue);

    for (let i = 0; i <= xTickCount; i++) {
      const value = i * xTickValue;
      const x = leftPadding + value * scaleX;

      if (x <= width - 30) {
        ctx.beginPath();
        ctx.moveTo(x, height - groundPadding);
        ctx.lineTo(x, height - groundPadding + 5);
        ctx.strokeStyle = "#444";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillText(`${value}`, x, height - groundPadding + 8);
      }
    }

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    const visibleHeight = (height - groundPadding - 40) / scaleY;
    console.log("Görünür yükseklik (metre):", visibleHeight);

    let yTickValue = 1;
    while (visibleHeight / yTickValue > 12) {
      if (yTickValue === 1) yTickValue = 2;
      else if (yTickValue === 2) yTickValue = 5;
      else if (yTickValue === 5) yTickValue = 10;
      else yTickValue *= 10;
    }

    const yTickCount = Math.floor(visibleHeight / yTickValue);

    for (let i = 0; i <= yTickCount; i++) {
      const value = i * yTickValue;
      const y = height - groundPadding - value * scaleY;

      if (y >= 20) {
        ctx.beginPath();
        ctx.moveTo(leftPadding, y);
        ctx.lineTo(leftPadding - 5, y);
        ctx.strokeStyle = "#444";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillText(`${value}`, leftPadding - 8, y);
      }
    }

    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.5;

    for (let i = 1; i <= yTickCount; i++) {
      const value = i * yTickValue;
      const y = height - groundPadding - value * scaleY;

      if (y >= 20) {
        ctx.beginPath();
        ctx.moveTo(leftPadding, y);
        ctx.lineTo(width - 20, y);
        ctx.stroke();
      }
    }

    for (let i = 1; i <= xTickCount; i++) {
      const value = i * xTickValue;
      const x = leftPadding + value * scaleX;

      if (x <= width - 30) {
        ctx.beginPath();
        ctx.moveTo(x, 20);
        ctx.lineTo(x, height - groundPadding);
        ctx.stroke();
      }
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.font = "13px Arial";
    ctx.fillStyle = "#333";
    ctx.fillText("Yatay Mesafe (m)", width / 2, height - 5);

    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("Yükseklik (m)", 0, 0);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(leftPadding, height - groundPadding, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#333";
    ctx.fill();

    const maxRangeX = leftPadding + data.range * scaleX;

    if (maxRangeX <= width - 30 && data.range > 0) {
      ctx.beginPath();
      ctx.arc(maxRangeX, height - groundPadding, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,0,0,0.7)";
      ctx.fill();

      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "rgba(255,0,0,0.9)";
      ctx.fillText(
        `Menzil: ${data.range}m`,
        maxRangeX,
        height - groundPadding - 5
      );
    }

    const maxHeightY = height - groundPadding - data.maxHeight * scaleY;

    if (maxHeightY >= 20 && data.maxHeight > 0) {
      ctx.beginPath();
      ctx.arc(leftPadding + 50, maxHeightY, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,128,255,0.7)";
      ctx.fill();

      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(0,128,255,0.9)";
      ctx.fillText(
        `Maks. Yükseklik: ${data.maxHeight}m`,
        leftPadding + 60,
        maxHeightY
      );
    }
  };

  const changeSpeed = (speed) => {
    setAnimationSpeed(speed);
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      setAnimasyonNot("Animasyon devam ediyor...");
      startAnimation();
    } else {
      setIsPaused(true);
      setAnimasyonNot(
        "Animasyon duraklatıldı. Devam etmek için 'Devam Et' butonuna basın."
      );
      stopAnimation();
    }
  };

  const toggleTrajectory = () => {
    setShowTrajectory(!showTrajectory);
  };

  return (
    <div className="fizik-atis__container">
      <div className="fizik-atis__header">
        <h1>Fizik - Atışlar Simülasyonu</h1>
        <p className="fizik-atis__header-desc">
          Bu simülasyon serbest düşme, yatay atış ve eğik atış hareketlerini
          görselleştirmenize yardımcı olur. Parametreleri değiştirerek farklı
          senaryoları test edin.
        </p>
      </div>

      <div className="fizik-atis__content">
        <div className="fizik-atis__input-panel">
          <div className="fizik-atis__panel-header">
            <h2>Parametre Ayarları</h2>
          </div>

          <div className="fizik-atis__input-group">
            <label>Atış Tipi:</label>
            <div className="fizik-atis__radio-group">
              <label
                className={`fizik-atis__radio-button ${
                  atisTipi === "egik" ? "active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="atisTipi"
                  value="egik"
                  checked={atisTipi === "egik"}
                  onChange={() => setAtisTipi("egik")}
                />
                <span>Eğik Atış</span>
              </label>
              <label
                className={`fizik-atis__radio-button ${
                  atisTipi === "yatay" ? "active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="atisTipi"
                  value="yatay"
                  checked={atisTipi === "yatay"}
                  onChange={() => setAtisTipi("yatay")}
                />
                <span>Yatay Atış</span>
              </label>
              <label
                className={`fizik-atis__radio-button ${
                  atisTipi === "serbestDusme" ? "active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="atisTipi"
                  value="serbestDusme"
                  checked={atisTipi === "serbestDusme"}
                  onChange={() => setAtisTipi("serbestDusme")}
                />
                <span>Serbest Düşme</span>
              </label>
            </div>
          </div>

          {atisTipi !== "serbestDusme" && (
            <div className="fizik-atis__input-group">
              <label htmlFor="v0">
                Başlangıç Hızı (v₀):
                <div className="fizik-atis__value-input">
                  <input
                    type="number"
                    id="v0"
                    value={v0 === 0 ? "" : v0}
                    onChange={handleV0Change}
                    onBlur={handleV0Blur}
                    min="0"
                    max="100"
                  />
                  <span className="fizik-atis__unit">m/s</span>
                </div>
              </label>
            </div>
          )}

          {atisTipi === "egik" && (
            <div className="fizik-atis__input-group">
              <label htmlFor="theta">
                Atış Açısı (θ):
                <div className="fizik-atis__value-input">
                  <input
                    type="number"
                    id="theta"
                    value={theta === 0 ? "" : theta}
                    onChange={handleThetaChange}
                    onBlur={handleThetaBlur}
                    min="0"
                    max="90"
                  />
                  <span className="fizik-atis__unit">°</span>
                </div>
              </label>
            </div>
          )}

          <div className="fizik-atis__input-group">
            <label htmlFor="h0">
              Başlangıç Yüksekliği (h₀):
              <div className="fizik-atis__value-input">
                <input
                  type="number"
                  id="h0"
                  value={h0 === 0 ? "" : h0}
                  onChange={handleH0Change}
                  onBlur={handleH0Blur}
                  min="0"
                  max="100"
                />
                <span className="fizik-atis__unit">m</span>
              </div>
            </label>
          </div>

          <div className="fizik-atis__input-group">
            <label htmlFor="g">Yerçekimi İvmesi (g)</label>
            <div className="fizik-atis__value-input">
              <input
                id="g"
                type="number"
                value={g}
                onChange={handleGChange}
                onBlur={handleGBlur}
                min="1"
                max="30"
                step="0.01"
              />
              <span className="fizik-atis__unit">m/s²</span>
            </div>
          </div>

          {error && (
            <div className="fizik-atis__error-panel">
              <span className="fizik-atis__error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <div className="fizik-atis__controls">
            <button
              className="fizik-atis__button fizik-atis__primary-button"
              onClick={firlatHandler}
            >
              <span className="fizik-atis__button-icon">▶</span>
              Başlat
            </button>
            <button
              className="fizik-atis__button fizik-atis__secondary-button"
              onClick={resetSimulation}
            >
              <span className="fizik-atis__button-icon">↺</span>
              Sıfırla
            </button>
          </div>

          {results && (
            <div className="fizik-atis__result-panel">
              <h3>Atış Sonuçları</h3>
              <div className="fizik-atis__result-grid">
                <div className="fizik-atis__result-item">
                  <span className="fizik-atis__result-icon">⏱️</span>
                  <span className="fizik-atis__result-value">
                    {results.flightTime.toFixed(2)}
                  </span>
                  <span className="fizik-atis__result-label">
                    Uçuş Süresi (s)
                  </span>
                </div>
                <div className="fizik-atis__result-item">
                  <span className="fizik-atis__result-icon">↔️</span>
                  <span className="fizik-atis__result-value">
                    {results.range.toFixed(2)}
                  </span>
                  <span className="fizik-atis__result-label">Menzil (m)</span>
                </div>
                <div className="fizik-atis__result-item">
                  <span className="fizik-atis__result-icon">↕️</span>
                  <span className="fizik-atis__result-value">
                    {results.maxHeight.toFixed(2)}
                  </span>
                  <span className="fizik-atis__result-label">
                    Maks. Yükseklik (m)
                  </span>
                </div>
                <div className="fizik-atis__result-item">
                  <span className="fizik-atis__result-icon">🎯</span>
                  <span className="fizik-atis__result-value">
                    {results.impactVelocity.toFixed(2)}
                  </span>
                  <span className="fizik-atis__result-label">
                    Çarpma Hızı (m/s)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fizik-atis__simulation-panel">
          <div className="fizik-atis__panel-header">
            <h2>Simülasyon</h2>
            <div className="fizik-atis__animation-controls">
              <div className="fizik-atis__speed-control">
                <button
                  className={`fizik-atis__speed-button ${
                    animationSpeed === 0.5 ? "active" : ""
                  }`}
                  onClick={() => changeSpeed(0.5)}
                >
                  0.5x
                </button>
                <button
                  className={`fizik-atis__speed-button ${
                    animationSpeed === 1 ? "active" : ""
                  }`}
                  onClick={() => changeSpeed(1)}
                >
                  1x
                </button>
                <button
                  className={`fizik-atis__speed-button ${
                    animationSpeed === 2 ? "active" : ""
                  }`}
                  onClick={() => changeSpeed(2)}
                >
                  2x
                </button>
              </div>
              <div className="fizik-atis__control-buttons">
                <button
                  className="fizik-atis__control-button"
                  onClick={togglePause}
                >
                  {isPaused ? "Devam Et" : "Duraklat"}
                </button>
                <button
                  className={`fizik-atis__control-button ${
                    showTrajectory ? "active" : ""
                  }`}
                  onClick={toggleTrajectory}
                  title={showTrajectory ? "İzi Gizle" : "İzi Göster"}
                >
                  {showTrajectory ? "İzi Gizle" : "İzi Göster"}
                </button>
              </div>
            </div>
          </div>

          <div className="fizik-atis__canvas-container">
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="fizik-atis__simulation-canvas"
            ></canvas>
            <div className="fizik-atis__animation-status">{animasyonNot}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Atislar;
