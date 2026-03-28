import React, { useRef, useState, type MouseEvent } from "react";

const MIN_WAVE = 380;
const MAX_WAVE = 750;

const HYDROGEN_LINES = [
  { name: "H-δ (Фиолетовый)", wave: 410.2, color: "#6a00ff" },
  { name: "H-γ (Синий)", wave: 434.0, color: "#0000ff" },
  { name: "H-β (Голубой)", wave: 486.1, color: "#00ffff" },
  { name: "H-α (Красный)", wave: 656.3, color: "#ff0000" },
];

const SpectrumLine: React.FC = () => {
  const barRef = useRef<HTMLDivElement>(null);
  const [hoverData, setHoverData] = useState<{
    wave: number;
    x: number;
    hLine: { name: string; wave: number } | null;
  } | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Ограничиваем x в пределах ширины контейнера
    const constrainedX = Math.max(0, Math.min(x, rect.width));
    const percentage = constrainedX / rect.width;
    const currentWave = MIN_WAVE + percentage * (MAX_WAVE - MIN_WAVE);

    const nearbyLine = HYDROGEN_LINES.find(
      (line) => Math.abs(currentWave - line.wave) < 5,
    );

    setHoverData({
      wave: currentWave,
      x: constrainedX,
      hLine: nearbyLine || null,
    });
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "500px",
        marginTop: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <p
        style={{
          margin: "0 0 10px 0",
          fontSize: "14px",
          fontWeight: "bold",
          textAlign: "center",
          color: "#333",
        }}
      >
        Спектр излучения водорода (Серия Бальмера)
      </p>

      <div
        ref={barRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverData(null)}
        style={{
          position: "relative",
          height: "45px",
          width: "100%",
          borderRadius: "8px",
          cursor: "crosshair",
          background:
            "linear-gradient(to right, #38008c, #4a00e0, #004dff, #00ffff, #00ff00, #ffff00, #ff8000, #ff0000, #7a0000)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          overflow: "visible",
        }}
      >
        {HYDROGEN_LINES.map((line) => {
          const leftPercent =
            ((line.wave - MIN_WAVE) / (MAX_WAVE - MIN_WAVE)) * 100;
          return (
            <div
              key={line.name}
              style={{
                position: "absolute",
                left: `${leftPercent}%`,
                top: 0,
                bottom: 0,
                width: "2px",
                backgroundColor: "#fff",
                boxShadow: `0 0 8px ${line.color}`,
                zIndex: 2,
              }}
            />
          );
        })}

        {hoverData && (
          <div
            style={{
              position: "absolute",
              left: `${hoverData.x}px`,
              top: "-55px",
              transform: "translateX(-50%)",
              backgroundColor: "#222",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            {hoverData.hLine ? (
              <>
                <strong style={{ color: "#4ae54a" }}>
                  {hoverData.hLine.name}
                </strong>
                <span>{hoverData.hLine.wave.toFixed(1)} нм</span>
              </>
            ) : (
              <span>~ {hoverData.wave.toFixed(1)} нм</span>
            )}
            <div
              style={{
                position: "absolute",
                bottom: "-5px",
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "6px solid #222",
              }}
            />
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "11px",
          color: "#666",
          marginTop: "8px",
        }}
      >
        <span>{MIN_WAVE} нм (УФ)</span>
        <span>{MAX_WAVE} нм (ИК)</span>
      </div>
    </div>
  );
};

export default SpectrumLine;
