import React, { useState, useEffect, useRef } from "react";
import "./devre.css";

function Devre() {
  const [voltage, setVoltage] = useState(12);
  const [resistor1, setResistor1] = useState(10);
  const [resistor2, setResistor2] = useState(20);
  const [resistor3, setResistor3] = useState(30);
  const [connectionType, setConnectionType] = useState("series"); // 'series' or 'parallel'
  const [results, setResults] = useState({
    totalResistance: 0,
    totalCurrent: 0,
    totalPower: 0,
  });

  const circuitContainerRef = useRef(null);

  const [circuitElements, setCircuitElements] = useState({
    battery: null,
    resistors: [],
    wires: [],
    currentArrows: [],
    labels: [],
    connectionPoints: [],
  });

  const örnekDevreler = [
    {
      name: "Örnek 1: Temel Seri Devre",
      voltage: 12,
      r1: 10,
      r2: 20,
      r3: 30,
      type: "series",
      details: "12V pil ile 10Ω, 20Ω ve 30Ω seri bağlı dirençler",
    },
    {
      name: "Örnek 2: Eşit Paralel Dirençler",
      voltage: 9,
      r1: 15,
      r2: 15,
      r3: 15,
      type: "parallel",
      details: "9V pil ile üç adet 15Ω paralel bağlı direnç",
    },
    {
      name: "Örnek 3: Farklı Paralel Dirençler",
      voltage: 24,
      r1: 100,
      r2: 200,
      r3: 300,
      type: "parallel",
      details: "24V pil ile 100Ω, 200Ω ve 300Ω paralel bağlı dirençler",
    },
    {
      name: "Örnek 4: İki Dirençli Seri Devre",
      voltage: 6,
      r1: 50,
      r2: 50,
      r3: 0,
      type: "series",
      details: "6V pil ile iki adet 50Ω seri bağlı direnç",
    },
  ];

  const handleExampleLoad = (example) => {
    setVoltage(example.voltage);
    setResistor1(example.r1);
    setResistor2(example.r2);
    setResistor3(example.r3);
    setConnectionType(example.type);
  };

  useEffect(() => {
    const calculateTotalResistance = () => {
      const r1 = parseFloat(resistor1) || 0;
      const r2 = parseFloat(resistor2) || 0;
      const r3 = parseFloat(resistor3) || 0;

      if (connectionType === "series") {
        return r1 + r2 + r3;
      } else {
        if (r1 === 0 && r2 === 0 && r3 === 0) return 0;
        let inverseSum = 0;
        if (r1 > 0) inverseSum += 1 / r1;
        if (r2 > 0) inverseSum += 1 / r2;
        if (r3 > 0) inverseSum += 1 / r3;
        return inverseSum > 0 ? 1 / inverseSum : 0;
      }
    };

    const calculatedResistance = calculateTotalResistance();
    const calculatedCurrent =
      calculatedResistance > 0 ? parseFloat(voltage) / calculatedResistance : 0;
    const calculatedPower = parseFloat(voltage) * calculatedCurrent;

    setResults({
      totalResistance: calculatedResistance,
      totalCurrent: calculatedCurrent,
      totalPower: calculatedPower,
    });

    drawCircuit(
      parseFloat(voltage),
      parseFloat(resistor1) || 0,
      parseFloat(resistor2) || 0,
      parseFloat(resistor3) || 0,
      connectionType,
      calculatedCurrent,
      calculatedResistance
    );
  }, [voltage, resistor1, resistor2, resistor3, connectionType]);

  const drawCircuit = (v, r1Val, r2Val, r3Val, type, current, totalRes) => {
    const newElements = {
      battery: null,
      resistors: [],
      wires: [],
      currentArrows: [],
      labels: [],
      connectionPoints: [],
    };
    const container = circuitContainerRef.current;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const centerY = containerHeight / 2;

    // Pil
    const batteryLeft = 50;
    const batteryTop = centerY - 30;
    newElements.battery = {
      type: "battery",
      x: batteryLeft,
      y: batteryTop,
      width: 30,
      height: 60,
      voltage: v,
    };
    newElements.labels.push({
      type: "battery-label",
      x: batteryLeft - 5,
      y: batteryTop + 70,
      text: `${v}V`,
    });
    newElements.connectionPoints.push({ x: batteryLeft + 30, y: centerY });

    if (type === "series") {
      let x = batteryLeft + 30;
      const wireLength = 40;
      const resistorWidth = 60;

      newElements.wires.push({
        type: "wire",
        x1: x,
        y1: centerY,
        x2: x + wireLength,
        y2: centerY,
        isHorizontal: true,
      });
      x += wireLength;

      const activeResistors = [r1Val, r2Val, r3Val].filter((r) => r > 0);

      activeResistors.forEach((rVal, index) => {
        newElements.connectionPoints.push({ x: x, y: centerY });
        newElements.resistors.push({
          type: "resistor",
          x: x,
          y: centerY - 10,
          width: resistorWidth,
          height: 20,
          resistance: rVal,
        });
        newElements.labels.push({
          type: "resistor-label",
          x: x,
          y: centerY + 15,
          text: `${rVal}Ω`,
        });
        newElements.wires.push({
          type: "wire",
          x1: x + resistorWidth,
          y1: centerY,
          x2: x + resistorWidth + wireLength,
          y2: centerY,
          isHorizontal: true,
        });
        if (current > 0) {
          newElements.currentArrows.push({
            type: "arrow",
            x: x + resistorWidth / 2 - 6,
            y: centerY - 6,
            direction: "right",
          });
        }
        x += resistorWidth + wireLength;
      });

      const rightWireX = x;
      newElements.wires.push({
        type: "wire",
        x1: rightWireX,
        y1: centerY,
        x2: rightWireX,
        y2: centerY + 100,
        isHorizontal: false,
      });
      newElements.wires.push({
        type: "wire",
        x1: 50,
        y1: centerY + 100,
        x2: rightWireX,
        y2: centerY + 100,
        isHorizontal: true,
      });
      newElements.wires.push({
        type: "wire",
        x1: 50,
        y1: centerY,
        x2: 50,
        y2: centerY + 100,
        isHorizontal: false,
      });

      if (current > 0) {
        newElements.currentArrows.push({
          type: "arrow",
          x: rightWireX - 6,
          y: centerY + 50 - 6,
          direction: "down",
          vertical: true,
        });
        newElements.currentArrows.push({
          type: "arrow",
          x: (50 + rightWireX) / 2 - 6,
          y: centerY + 100 - 6,
          direction: "left",
        });
        newElements.currentArrows.push({
          type: "arrow",
          x: 50 - 6,
          y: centerY + 50 - 6,
          direction: "up",
          vertical: true,
        });
        newElements.currentArrows.push({
          type: "arrow",
          x: batteryLeft + 15 - 6,
          y: centerY - 6,
          direction: "right",
        });
      }
    } else {
      // Parallel
      const leftConnectionX = batteryLeft + 35;
      const rightConnectionX = containerWidth - 50;
      const branchSpacing = 40; //Dirençlerin dikey aralığı

      // Dikey ana teller
      newElements.wires.push({
        type: "wire",
        x1: leftConnectionX,
        y1: centerY - 50,
        x2: leftConnectionX,
        y2:
          centerY +
          50 +
          (([r1Val, r2Val, r3Val].filter((r) => r > 0).length - 1) *
            branchSpacing) /
            2 +
          20,
        isHorizontal: false,
      });
      newElements.wires.push({
        type: "wire",
        x1: rightConnectionX,
        y1: centerY - 50,
        x2: rightConnectionX,
        y2:
          centerY +
          50 +
          (([r1Val, r2Val, r3Val].filter((r) => r > 0).length - 1) *
            branchSpacing) /
            2 +
          20,
        isHorizontal: false,
      });

      // Üst ve alt yatay ana teller
      newElements.wires.push({
        type: "wire",
        x1: leftConnectionX,
        y1: centerY - 50,
        x2: rightConnectionX,
        y2: centerY - 50,
        isHorizontal: true,
      });
      newElements.wires.push({
        type: "wire",
        x1: leftConnectionX,
        y1:
          centerY +
          50 +
          (([r1Val, r2Val, r3Val].filter((r) => r > 0).length - 1) *
            branchSpacing) /
            2 +
          20,
        x2: rightConnectionX,
        y2:
          centerY +
          50 +
          (([r1Val, r2Val, r3Val].filter((r) => r > 0).length - 1) *
            branchSpacing) /
            2 +
          20,
        isHorizontal: true,
      });

      // Pilden ana tellere bağlantı
      newElements.wires.push({
        type: "wire",
        x1: batteryLeft + 30,
        y1: centerY,
        x2: leftConnectionX,
        y2: centerY,
        isHorizontal: true,
      }); // Pil + ucundan sol dikey tele
      newElements.wires.push({
        type: "wire",
        x1: leftConnectionX,
        y1: centerY,
        x2: leftConnectionX,
        y2: centerY - 50,
        isHorizontal: false,
      }); // Sol dikey telin orta noktasından üste

      newElements.wires.push({
        type: "wire",
        x1: batteryLeft,
        y1: centerY,
        x2: batteryLeft,
        y2:
          centerY +
          50 +
          (([r1Val, r2Val, r3Val].filter((r) => r > 0).length - 1) *
            branchSpacing) /
            2 +
          20,
        isHorizontal: false,
      }); // Pil - ucundan alt yatay tele
      newElements.wires.push({
        type: "wire",
        x1: batteryLeft,
        y1:
          centerY +
          50 +
          (([r1Val, r2Val, r3Val].filter((r) => r > 0).length - 1) *
            branchSpacing) /
            2 +
          20,
        x2: leftConnectionX,
        y2:
          centerY +
          50 +
          (([r1Val, r2Val, r3Val].filter((r) => r > 0).length - 1) *
            branchSpacing) /
            2 +
          20,
        isHorizontal: true,
      });

      const activeResistors = [r1Val, r2Val, r3Val]
        .map((val, i) => ({ value: val, originalIndex: i }))
        .filter((r) => r.value > 0);
      const numActiveResistors = activeResistors.length;

      activeResistors.forEach((res, i) => {
        const resistorY =
          centerY -
          ((numActiveResistors - 1) * branchSpacing) / 2 +
          i * branchSpacing;
        const resistorX =
          leftConnectionX + (rightConnectionX - leftConnectionX) / 2 - 30; // Dirençlerin yatay konumu

        // Sol bağlantı telleri
        newElements.wires.push({
          type: "wire",
          x1: leftConnectionX,
          y1: resistorY,
          x2: resistorX,
          y2: resistorY,
          isHorizontal: true,
        });
        newElements.connectionPoints.push({ x: leftConnectionX, y: resistorY });

        // Direnç
        newElements.resistors.push({
          type: "resistor",
          x: resistorX,
          y: resistorY - 10,
          width: 60,
          height: 20,
          resistance: res.value,
        });
        newElements.labels.push({
          type: "resistor-label",
          x: resistorX,
          y: resistorY + 15,
          text: `${res.value}Ω`,
        });

        // Sağ bağlantı telleri
        newElements.wires.push({
          type: "wire",
          x1: resistorX + 60,
          y1: resistorY,
          x2: rightConnectionX,
          y2: resistorY,
          isHorizontal: true,
        });
        newElements.connectionPoints.push({
          x: rightConnectionX,
          y: resistorY,
        });

        // Akım okları
        if (current > 0 && totalRes > 0) {
          const branchCurrent = current * (totalRes / res.value); // Yaklaşık akım, idealde V/R ile hesaplanmalı
          const arrowScale = Math.min(
            2,
            Math.max(0.5, branchCurrent / current)
          ); // Ok boyutu için kaba bir ölçek
          newElements.currentArrows.push({
            type: "arrow",
            x: resistorX + 30 - 6,
            y: resistorY - 6,
            direction: "right",
            scale: arrowScale,
          });
        }
      });

      // Ana koldaki akım okları
      if (current > 0) {
        newElements.currentArrows.push({
          type: "arrow",
          x: batteryLeft + 15 - 6,
          y: centerY - 6,
          direction: "right",
        });
        newElements.currentArrows.push({
          type: "arrow",
          x: leftConnectionX + (rightConnectionX - leftConnectionX) / 4 - 6,
          y: centerY - 50 - 6,
          direction: "right",
        }); // Üst tel
        newElements.currentArrows.push({
          type: "arrow",
          x: leftConnectionX - 6,
          y: centerY - 25 - 6,
          direction: "up",
          vertical: true,
        }); // Sol dikey tel yukarı
        newElements.currentArrows.push({
          type: "arrow",
          x: rightConnectionX - 6,
          y: centerY - 25 - 6,
          direction: "down",
          vertical: true,
        }); // Sağ dikey tel aşağı

        newElements.currentArrows.push({
          type: "arrow",
          x: leftConnectionX + (rightConnectionX - leftConnectionX) / 4 - 6,
          y:
            centerY +
            50 +
            (([r1Val, r2Val, r3Val].filter((r) => r > 0).length - 1) *
              branchSpacing) /
              2 +
            20 -
            6,
          direction: "left",
        }); // Alt tel
      }
    }
    setCircuitElements(newElements);
  };

  const renderCircuitElement = (element, index) => {
    const style = {
      position: "absolute",
      left: `${element.x}px`,
      top: `${element.y}px`,
    };

    if (element.type === "battery") {
      return (
        <div
          key={`batt-${index}`}
          className="devre-sim__battery"
          style={{
            ...style,
            width: `${element.width}px`,
            height: `${element.height}px`,
          }}
        ></div>
      );
    }
    if (element.type === "battery-label" || element.type === "resistor-label") {
      return (
        <div
          key={`label-${index}`}
          className={`devre-sim__${element.type}`}
          style={{ ...style, width: "auto" }}
        >
          {element.text}
        </div>
      );
    }
    if (element.type === "resistor") {
      return (
        <div
          key={`res-${index}`}
          className="devre-sim__resistor"
          style={{
            ...style,
            width: `${element.width}px`,
            height: `${element.height}px`,
          }}
        ></div>
      );
    }
    if (element.type === "wire") {
      const wireStyle = {
        position: "absolute",
        backgroundColor: "var(--wire)",
        zIndex: 1,
      };
      if (element.isHorizontal) {
        wireStyle.left = `${Math.min(element.x1, element.x2)}px`;
        wireStyle.top = `${element.y1}px`;
        wireStyle.width = `${Math.abs(element.x2 - element.x1)}px`;
        wireStyle.height = "2px";
        wireStyle.transform = "translateY(-1px)";
      } else {
        // Vertical
        wireStyle.left = `${element.x1}px`;
        wireStyle.top = `${Math.min(element.y1, element.y2)}px`;
        wireStyle.width = "2px";
        wireStyle.height = `${Math.abs(element.y2 - element.y1)}px`;
        wireStyle.transform = "translateX(-1px)";
      }
      return (
        <div
          key={`wire-${index}`}
          className="devre-sim__wire"
          style={wireStyle}
        ></div>
      );
    }
    if (element.type === "arrow") {
      let arrowClass = "devre-sim__current-arrow";
      const arrowStyle = {
        ...style,
        width: `${12 * (element.scale || 1)}px`,
        height: `${12 * (element.scale || 1)}px`,
      };
      if (element.direction === "left") arrowStyle.transform = "rotate(180deg)";
      if (element.direction === "up") {
        arrowClass += " devre-sim__vertical-current-arrow";
        arrowStyle.transform = "rotate(180deg)";
      }
      if (element.direction === "down")
        arrowClass += " devre-sim__vertical-current-arrow";

      return (
        <div
          key={`arrow-${index}`}
          className={arrowClass}
          style={arrowStyle}
        ></div>
      );
    }
    if (element.type === "connection-point") {
      return (
        <div
          key={`cp-${index}`}
          className="devre-sim__connection-point"
          style={{
            ...style,
            left: `${element.x - 4}px`,
            top: `${element.y - 4}px`,
            width: "8px",
            height: "8px",
          }}
        ></div>
      );
    }
    return null;
  };

  return (
    <div className="devre-sim__container">
      <header className="devre-sim__header">
        <h1>Elektrik Devre Simülasyonu</h1>
        <p>Ohm Yasası ve Temel Devre Analizi</p>
      </header>

      <div className="devre-sim__simulation-container">
        <div className="devre-sim__control-panel">
          <h2>Kontrol Paneli</h2>

          <div className="devre-sim__input-group">
            <label htmlFor="voltage">Pil Gerilimi (V)</label>
            <input
              type="number"
              id="voltage"
              value={voltage}
              min="1"
              max="100"
              step="1"
              onChange={(e) => setVoltage(Number(e.target.value))}
            />
            <input
              type="range"
              id="voltage-range"
              value={voltage}
              min="1"
              max="100"
              step="1"
              onChange={(e) => setVoltage(Number(e.target.value))}
            />
            <div className="devre-sim__unit-info">Volt (V)</div>
          </div>

          <div className="devre-sim__input-group">
            <label>Direnç Değerleri (Ω)</label>
            <input
              type="number"
              id="resistor1"
              value={resistor1 || ""}
              min="0"
              max="1000"
              step="1"
              placeholder="R₁"
              onChange={(e) =>
                setResistor1(e.target.value === "" ? 0 : Number(e.target.value))
              }
            />
            <input
              type="number"
              id="resistor2"
              value={resistor2 || ""}
              min="0"
              max="1000"
              step="1"
              placeholder="R₂"
              onChange={(e) =>
                setResistor2(e.target.value === "" ? 0 : Number(e.target.value))
              }
            />
            <input
              type="number"
              id="resistor3"
              value={resistor3 || ""}
              min="0"
              max="1000"
              step="1"
              placeholder="R₃"
              onChange={(e) =>
                setResistor3(e.target.value === "" ? 0 : Number(e.target.value))
              }
            />
            <div className="devre-sim__unit-info">Ohm (Ω)</div>
          </div>

          <div className="devre-sim__input-group">
            <label>Bağlantı Türü</label>
            <div className="devre-sim__connection-type">
              <div
                className={`devre-sim__connection-btn ${
                  connectionType === "series" ? "active" : ""
                }`}
                onClick={() => setConnectionType("series")}
              >
                Seri
              </div>
              <div
                className={`devre-sim__connection-btn ${
                  connectionType === "parallel" ? "active" : ""
                }`}
                onClick={() => setConnectionType("parallel")}
              >
                Paralel
              </div>
            </div>
          </div>

          <div className="devre-sim__result-panel">
            <h3>Hesaplama Sonuçları</h3>
            <div className="devre-sim__result-item">
              <div>Toplam Direnç:</div>
              <div className="devre-sim__result-value">
                {results.totalResistance.toFixed(2)} Ω
              </div>
            </div>
            <div className="devre-sim__result-item">
              <div>Toplam Akım:</div>
              <div className="devre-sim__result-value">
                {results.totalCurrent.toFixed(4)} A
              </div>
            </div>
            <div className="devre-sim__result-item">
              <div>Toplam Güç:</div>
              <div className="devre-sim__result-value">
                {results.totalPower.toFixed(2)} W
              </div>
            </div>
          </div>
        </div>

        <div className="devre-sim__visualization">
          <h2>Devre Şeması</h2>
          <div
            className="devre-sim__circuit-container"
            ref={circuitContainerRef}
          >
            {/* Devre elemanları buraya dinamik olarak eklenecek */}
            {circuitElements.battery &&
              renderCircuitElement(circuitElements.battery, "battery")}
            {circuitElements.resistors.map((el, i) =>
              renderCircuitElement(el, `resistor-${i}`)
            )}
            {circuitElements.wires.map((el, i) =>
              renderCircuitElement(el, `wire-${i}`)
            )}
            {circuitElements.labels.map((el, i) =>
              renderCircuitElement(el, `label-${i}`)
            )}
            {circuitElements.connectionPoints.map((el, i) =>
              renderCircuitElement(el, `cp-${i}`)
            )}
            {circuitElements.currentArrows.map((el, i) =>
              renderCircuitElement(el, `arrow-${i}`)
            )}
          </div>
          {/* Tooltip React'te farklı yönetilebilir, örneğin fare üzerine gelince state ile gösterilen bir div */}
        </div>
      </div>

      <div className="devre-sim__theory-box">
        <h2>Ohm Yasası ve Devre Kuralları</h2>
        <div className="devre-sim__formula">V = I × R</div>
        <h3>Ohm Yasası</h3>
        <p>
          Bir iletkenin iki ucu arasındaki potansiyel fark (V), iletkenden geçen
          akım (I) ile iletkenin direncinin (R) çarpımına eşittir.
        </p>
        <h3>Seri Bağlı Devreler</h3>
        <div className="devre-sim__formula">
          R<sub>toplam</sub> = R₁ + R₂ + R₃ + ...
        </div>
        <ul>
          <li>Tüm dirençler üzerinden aynı akım geçer</li>
          <li>Gerilim, dirençler arasında paylaşılır</li>
          <li>Toplam direnç, tüm dirençlerin toplamıdır</li>
        </ul>
        <h3>Paralel Bağlı Devreler</h3>
        <div className="devre-sim__formula">
          1/R<sub>toplam</sub> = 1/R₁ + 1/R₂ + 1/R₃ + ...
        </div>
        <ul>
          <li>Tüm dirençler aynı gerilime maruz kalır</li>
          <li>Akım, dirençler arasında paylaşılır</li>
          <li>Toplam direnç, her zaman en küçük dirençten daha küçüktür</li>
        </ul>
        <h3>Güç Hesaplama</h3>
        <div className="devre-sim__formula">P = V × I = I² × R = V² / R</div>
        <p>
          Güç (P), birim zamanda harcanan enerji miktarıdır ve Watt (W)
          birimiyle ölçülür.
        </p>
      </div>

      <div className="devre-sim__examples">
        <h2>Örnek Devreler</h2>
        {örnekDevreler.map((example, index) => (
          <div
            key={index}
            className="devre-sim__example-card"
            onClick={() => handleExampleLoad(example)}
          >
            <h3>{example.name}</h3>
            <p>{example.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Devre;
