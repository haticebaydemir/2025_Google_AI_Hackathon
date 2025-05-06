// elektrostatik.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import "./elektrostatik.css"; // Oluşturduğumuz CSS dosyasını import ediyoruz

const COULOMB_CONSTANT = 9e9; // N·m²/C²

const mediumData = {
  vacuum: {
    name: "Vakum",
    kMultiplier: 1,
    class: "medium-vacuum",
    displayK: "9×10⁹",
  },
  air: {
    name: "Hava",
    kMultiplier: 0.8,
    class: "medium-air",
    displayK: "7.2×10⁹",
  },
  water: {
    name: "Su",
    kMultiplier: 0.0125,
    class: "medium-water",
    displayK: "1.13×10⁸",
  },
};

function ElectrostaticsSimulation() {
  const [charge1, setCharge1] = useState(5); // μC
  const [charge2, setCharge2] = useState(-5); // μC
  const [distance, setDistance] = useState(1); // m
  const [selectedMediumKey, setSelectedMediumKey] = useState("vacuum");

  const [forceMagnitude, setForceMagnitude] = useState(0);
  const [forceDirection, setForceDirection] = useState("");
  const [canvasWidth, setCanvasWidth] = useState(600); // Default canvas width

  const canvasRef = useRef(null);
  const simulationAreaRef = useRef(null); // To get canvas width

  const currentMedium = mediumData[selectedMediumKey];

  // Inputları senkronize etmek için (range ve number input'ları için)
  const handleCharge1Change = (value) => {
    setCharge1(parseFloat(value));
  };
  const handleCharge2Change = (value) => {
    setCharge2(parseFloat(value));
  };
  const handleDistanceChange = (value) => {
    setDistance(parseFloat(value));
  };
  const handleMediumChange = (event) => {
    setSelectedMediumKey(event.target.value);
  };

  const calculateForce = useCallback(() => {
    const q1_C = charge1 * 1e-6; // μC to C
    const q2_C = charge2 * 1e-6; // μC to C
    const r = distance;

    if (r <= 0) {
      setForceMagnitude(Infinity);
      setForceDirection("Tanımsız (mesafe <= 0)");
      return;
    }

    const effectiveK = COULOMB_CONSTANT * currentMedium.kMultiplier;
    const force = (effectiveK * Math.abs(q1_C * q2_C)) / (r * r);

    setForceMagnitude(force);
    setForceDirection(q1_C * q2_C > 0 ? "İtme" : "Çekme");
  }, [charge1, charge2, distance, currentMedium]);

  const drawCharge = useCallback((ctx, x, y, chargeValue, label) => {
    const radius = 20;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = chargeValue > 0 ? "var(--positive)" : "var(--negative)";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(chargeValue > 0 ? "+" : "−", x, y);

    ctx.fillStyle = "#000";
    ctx.font = "bold 14px Arial";
    ctx.fillText(label, x, y + radius + 15);
  }, []);

  const drawDistanceLabel = useCallback(
    (ctx, x1, x2, yPos) => {
      const midX = (x1 + x2) / 2;
      const yLine = yPos + 50;

      ctx.beginPath();
      ctx.moveTo(x1, yLine);
      ctx.lineTo(x2, yLine);
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Arrowheads
      const arrowSize = 8;
      ctx.fillStyle = "#555";
      ctx.beginPath(); // Left arrowhead
      ctx.moveTo(x1, yLine);
      ctx.lineTo(x1 + arrowSize, yLine - arrowSize / 2);
      ctx.lineTo(x1 + arrowSize, yLine + arrowSize / 2);
      ctx.fill();
      ctx.beginPath(); // Right arrowhead
      ctx.moveTo(x2, yLine);
      ctx.lineTo(x2 - arrowSize, yLine - arrowSize / 2);
      ctx.lineTo(x2 - arrowSize, yLine + arrowSize / 2);
      ctx.fill();

      ctx.fillStyle = "#333";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`Mesafe: ${distance.toFixed(1)} m`, midX, yLine + 20);
    },
    [distance]
  );

  const drawForceVector = useCallback(
    (ctx, xStart, yPos, isRepulsive, chargeValueForColor) => {
      if (isFinite(forceMagnitude) && forceMagnitude > 1e-20) {
        // Çok küçük veya sonsuz kuvvetleri çizme
        const arrowBaseLength = Math.min(
          150,
          Math.max(30, Math.log10(forceMagnitude * 1e6 + 1) * 20)
        ); // Log scale for better viz
        const headLength = 12;
        const headWidth = 8;
        const directionSign = isRepulsive
          ? chargeValueForColor > 0
            ? -1
            : 1
          : chargeValueForColor > 0
          ? 1
          : -1;

        // Vektörün başlangıç noktasını yükün dışına taşı
        const chargeRadius = 20; // Yük yarıçapı
        const vectorStartX =
          xStart +
          (chargeRadius + 5) *
            (isRepulsive
              ? chargeValueForColor > 0
                ? -1
                : 1
              : chargeValueForColor > 0
              ? 1
              : -1); // Yönü düzelt
        const vectorEndX =
          vectorStartX +
          arrowBaseLength *
            (isRepulsive
              ? chargeValueForColor > 0
                ? -1
                : 1
              : chargeValueForColor > 0
              ? 1
              : -1); // Yönü düzelt

        ctx.beginPath();
        ctx.moveTo(vectorStartX, yPos);
        ctx.lineTo(vectorEndX, yPos);
        ctx.strokeStyle =
          forceDirection === "İtme" ? "var(--positive)" : "#4CAF50"; // Green for attraction
        ctx.lineWidth = 3;
        ctx.stroke();

        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(vectorEndX, yPos);
        ctx.lineTo(
          vectorEndX -
            headLength *
              Math.cos(Math.PI / 6) *
              (isRepulsive
                ? chargeValueForColor > 0
                  ? -1
                  : 1
                : chargeValueForColor > 0
                ? 1
                : -1),
          yPos - headLength * Math.sin(Math.PI / 6)
        );
        ctx.moveTo(vectorEndX, yPos); // Geri dön
        ctx.lineTo(
          vectorEndX -
            headLength *
              Math.cos(Math.PI / 6) *
              (isRepulsive
                ? chargeValueForColor > 0
                  ? -1
                  : 1
                : chargeValueForColor > 0
                ? 1
                : -1),
          yPos + headLength * Math.sin(Math.PI / 6)
        );

        ctx.fillStyle =
          forceDirection === "İtme" ? "var(--positive)" : "#4CAF50";
        ctx.fill();
      }
    },
    [forceMagnitude, forceDirection]
  );

  const drawSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);

    // Arka plan ızgarası (isteğe bağlı)
    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Yüklerin pozisyonu için ölçeklendirme
    // Canvas genişliğinin %60'ını maksimum mesafe için kullanalım
    const maxSimDistancePixels = width * 0.6;
    const pixelsPerMeter = maxSimDistancePixels / 5; // Max mesafe 5m olduğu için
    const simDistancePixels = Math.min(
      maxSimDistancePixels,
      distance * pixelsPerMeter
    );

    const centerX = width / 2;
    const yPos = height / 2;
    const x1 = centerX - simDistancePixels / 2;
    const x2 = centerX + simDistancePixels / 2;

    // Kuvvet vektörleri
    const isRepulsive = forceDirection === "İtme";
    drawForceVector(ctx, x1, yPos, isRepulsive, charge1);
    drawForceVector(ctx, x2, yPos, isRepulsive, charge2);

    // Yükler
    drawCharge(ctx, x1, yPos, charge1, "q₁");
    drawCharge(ctx, x2, yPos, charge2, "q₂");

    // Mesafe çizgisi ve etiketi
    drawDistanceLabel(ctx, x1, x2, yPos);

    // Kuvvet değeri etiketi (Canvas üzerinde)
    if (isFinite(forceMagnitude) && forceMagnitude > 1e-20) {
      ctx.fillStyle = "#333";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        `F = ${forceMagnitude.toExponential(2)} N`,
        centerX,
        yPos - 40
      );
    }
  }, [
    charge1,
    charge2,
    distance,
    forceMagnitude,
    forceDirection,
    drawCharge,
    drawDistanceLabel,
    drawForceVector,
  ]);

  // Canvas boyutunu ayarla ve yeniden çiz
  const resizeCanvas = useCallback(() => {
    if (simulationAreaRef.current && canvasRef.current) {
      // Kontrol panelinin padding'ini hesaba kat
      const newWidth = simulationAreaRef.current.offsetWidth - 40; // 20px padding each side
      setCanvasWidth(newWidth); // Bu state canvas elementinin width'ini tetikler
      // Canvas height sabit kalabilir veya ayarlanabilir
      // canvasRef.current.height = 400; // Bunu doğrudan ayarlamak yerine JSX'te verelim
    }
  }, []);

  useEffect(() => {
    // Canvas width/height'i state'e göre ayarla
    if (canvasRef.current) {
      canvasRef.current.width = canvasWidth; // Fiziksel çizim boyutunu ayarla
      canvasRef.current.height = 400; // Fiziksel çizim boyutunu ayarla
    }
    calculateForce();
    drawSimulation();
  }, [
    charge1,
    charge2,
    distance,
    currentMedium,
    calculateForce,
    drawSimulation,
    canvasWidth,
  ]);

  useEffect(() => {
    resizeCanvas(); // İlk yüklemede canvas boyutunu ayarla
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  return (
    <div className="container">
      <header>
        <h1>Elektrostatik Kuvvetler ve Coulomb Yasası Simülasyonu</h1>
        <p>Yükler arasındaki elektrostatik etkileşimi keşfedin</p>
      </header>

      <div className="control-panel">
        <div className="charge-indicator">
          <div
            className={`charge-box ${
              charge1 > 0 ? "positive-charge" : "negative-charge"
            }`}
          >
            {charge1 > 0 ? "+" : ""}
            {charge1.toFixed(1)} μC
          </div>
          <div
            className={`charge-box ${
              charge2 > 0 ? "positive-charge" : "negative-charge"
            }`}
          >
            {charge2 > 0 ? "+" : ""}
            {charge2.toFixed(1)} μC
          </div>
        </div>

        <div className={`medium-indicator ${currentMedium.class}`}>
          Ortam: {currentMedium.name}
        </div>

        <div className="input-group">
          <label htmlFor="charge1Range">Yük 1 ({charge1.toFixed(1)} μC)</label>
          <input
            type="range"
            id="charge1Range"
            min="-10"
            max="10"
            value={charge1}
            step="0.1"
            onChange={(e) => handleCharge1Change(e.target.value)}
          />
          <input
            type="number"
            id="charge1Value"
            value={charge1}
            step="0.1"
            onChange={(e) => handleCharge1Change(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="charge2Range">Yük 2 ({charge2.toFixed(1)} μC)</label>
          <input
            type="range"
            id="charge2Range"
            min="-10"
            max="10"
            value={charge2}
            step="0.1"
            onChange={(e) => handleCharge2Change(e.target.value)}
          />
          <input
            type="number"
            id="charge2Value"
            value={charge2}
            step="0.1"
            onChange={(e) => handleCharge2Change(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="distanceRange">
            Mesafe ({distance.toFixed(1)} m)
          </label>
          <input
            type="range"
            id="distanceRange"
            min="0.1"
            max="5"
            value={distance}
            step="0.1"
            onChange={(e) => handleDistanceChange(e.target.value)}
          />
          <input
            type="number"
            id="distanceValue"
            value={distance}
            step="0.1"
            onChange={(e) => handleDistanceChange(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="mediumSelect">Ortam</label>
          <select
            id="mediumSelect"
            value={selectedMediumKey}
            onChange={handleMediumChange}
          >
            {Object.keys(mediumData).map((key) => (
              <option key={key} value={key}>
                {mediumData[key].name} (k ≈{" "}
                {mediumData[key].displayK
                  .replace("×10⁹", "×10⁹")
                  .replace("×10⁸", "×10⁸")}
                )
              </option>
            ))}
          </select>
        </div>

        <div className="result-panel">
          <div>
            <strong>Kuvvet Büyüklüğü:</strong>{" "}
            <span>
              {isFinite(forceMagnitude) ? forceMagnitude.toExponential(2) : "∞"}{" "}
              N
            </span>
          </div>
          <div>
            <strong>Kuvvet Yönü:</strong> <span>{forceDirection}</span>
          </div>
          <div>
            <strong>Mesafe:</strong> <span>{distance.toFixed(1)} m</span>
          </div>
        </div>
      </div>

      <div className="simulation-area" ref={simulationAreaRef}>
        <h2>Simülasyon Alanı</h2>
        <canvas
          ref={canvasRef}
          id="simulationCanvas" /* width ve height JSX'te dinamik olarak ayarlanacak */
        >
          Tarayıcınız Canvas elementini desteklemiyor.
        </canvas>
        <div
          className={`medium-indicator pulse-animation ${currentMedium.class}`}
        >
          Simülasyon Ortamı: {currentMedium.name}
        </div>
      </div>

      <div className="theory-panel">
        <h2>Coulomb Yasası</h2>
        <div className="theory-section">
          <div className="formula">F = k · |q₁ · q₂| / r²</div>
          <p>
            <strong>k:</strong> Coulomb sabiti (
            {COULOMB_CONSTANT.toExponential(0).replace("e+9", "×10⁹")} N·m²/C²)
          </p>
          <p>
            <strong>q₁, q₂:</strong> Yük miktarları (Coulomb)
          </p>
          <p>
            <strong>r:</strong> Yükler arası mesafe (metre)
          </p>
          <p>
            <strong>F:</strong> Elektrostatik kuvvet (Newton)
          </p>
        </div>
        <div className="theory-section">
          <h3>Yüklerin Etkileşimi</h3>
          <p>
            Aynı işaretli yükler birbirini iter, zıt işaretli yükler birbirini
            çeker.
          </p>
          <div className="example">
            <strong>Örnek:</strong> +5μC ve -5μC yükler 1m mesafede vakumda
            yaklaşık{" "}
            {(
              (COULOMB_CONSTANT * 1 * Math.abs(5e-6 * -5e-6)) /
              (1 * 1)
            ).toExponential(2)}{" "}
            N çekme kuvveti uygular.
          </div>
          <div className="example">
            <strong>Örnek:</strong> +5μC ve +5μC yükler 1m mesafede vakumda
            yaklaşık{" "}
            {(
              (COULOMB_CONSTANT * 1 * Math.abs(5e-6 * 5e-6)) /
              (1 * 1)
            ).toExponential(2)}{" "}
            N itme kuvveti uygular.
          </div>
        </div>
        <div className="theory-section">
          <h3>Ortamın Etkisi</h3>
          <p>
            Farklı ortamlarda Coulomb sabiti (daha doğrusu ortamın bağıl
            dielektrik sabiti εᵣ ile orantılı olarak) değişir:
          </p>
          <ul>
            {Object.values(mediumData).map((medium) => (
              <li key={medium.name}>
                {medium.name}: k<sub>eff</sub> ≈{" "}
                {medium.displayK
                  .replace("×10⁹", "×10⁹")
                  .replace("×10⁸", "×10⁸")}{" "}
                N·m²/C²
              </li>
            ))}
          </ul>
          <p>
            Ortamın dielektrik sabiti arttıkça (k<sub>eff</sub> azaldıkça)
            kuvvet azalır.
          </p>
        </div>

        <div className="theory-section">
          <h3>Kuvvetin Mesafeye Bağlılığı</h3>
          <p>Kuvvet mesafenin karesiyle ters orantılıdır:</p>
          <div className="example">
            <strong>Örnek:</strong> Mesafe 2 katına çıkarsa kuvvet 4 kat azalır.
          </div>
          <div className="example">
            <strong>Örnek:</strong> Mesafe yarıya inerse kuvvet 4 kat artar.
          </div>
        </div>
      </div>
    </div>
  );
}

export default ElectrostaticsSimulation;
