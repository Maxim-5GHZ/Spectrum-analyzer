import React, {
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

const MIN_WAVE = 380;
const MAX_WAVE = 750;

const HYDROGEN_LINES = [
  { name: "H-δ (Фиолетовый)", wave: 410.2, color: "#6a00ff" },
  { name: "H-γ (Синий)", wave: 434.0, color: "#0000ff" },
  { name: "H-β (Голубой)", wave: 486.1, color: "#00ffff" },
  { name: "H-α (Красный)", wave: 656.3, color: "#ff0000" },
];

/**
 * Функция конвертации длины волны (в нм) в RGB цвет.
 */
const waveLengthToRGB = (wavelength: number): string => {
  let r = 0,
    g = 0,
    b = 0;

  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    g = 0.0;
    b = 1.0;
  } else if (wavelength >= 440 && wavelength < 490) {
    r = 0.0;
    g = (wavelength - 440) / (490 - 440);
    b = 1.0;
  } else if (wavelength >= 490 && wavelength < 510) {
    r = 0.0;
    g = 1.0;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1.0;
    g = -(wavelength - 645) / (645 - 580);
    b = 0.0;
  } else if (wavelength >= 645 && wavelength <= 750) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  }

  let factor = 0;
  if (wavelength >= 380 && wavelength < 420) {
    factor = 0.3 + (0.7 * (wavelength - 380)) / (420 - 380);
  } else if (wavelength >= 420 && wavelength < 701) {
    factor = 1.0;
  } else if (wavelength >= 701 && wavelength <= 750) {
    factor = 0.3 + (0.7 * (750 - wavelength)) / (750 - 700);
  }

  const gamma = 0.8;
  const adjust = (color: number, factor: number) => {
    return color === 0 ? 0 : Math.round(255 * Math.pow(color * factor, gamma));
  };

  return `rgb(${adjust(r, factor)}, ${adjust(g, factor)}, ${adjust(b, factor)})`;
};

const SpectrumLine: React.FC = () => {
  const barRef = useRef<HTMLDivElement>(null);

  // Состояние 1: Зафиксированная длина волны (указатель и нижняя панель)
  const [selectedWave, setSelectedWave] = useState<number>(
    (MIN_WAVE + MAX_WAVE) / 2,
  );

  // Состояние 2: Текущее наведение мыши (всплывающая подсказка)
  const [hoverData, setHoverData] = useState<{
    wave: number;
    x: number;
  } | null>(null);

  const [isFocused, setIsFocused] = useState(false);

  // Обработка движения мыши (только обновляем тултип)
  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const constrainedX = Math.max(0, Math.min(x, rect.width));
    const percentage = constrainedX / rect.width;
    const wave = MIN_WAVE + percentage * (MAX_WAVE - MIN_WAVE);

    setHoverData({ wave, x: constrainedX });
  };

  // Клик по спектру фиксирует цвет
  const handleClick = () => {
    if (hoverData) {
      setSelectedWave(hoverData.wave);
      barRef.current?.focus(); // Автоматически фокусируемся для управления клавиатурой
    }
  };

  // Функция изменения длины волны (с ограничениями)
  const adjustSelectedWave = (delta: number) => {
    setSelectedWave((prev) =>
      Math.max(MIN_WAVE, Math.min(MAX_WAVE, prev + delta)),
    );
  };

  // Управление с клавиатуры
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 5 : 0.5;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      adjustSelectedWave(-step);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      adjustSelectedWave(step);
    }
  };

  // Вычисления для отображения
  const selectedPercent =
    ((selectedWave - MIN_WAVE) / (MAX_WAVE - MIN_WAVE)) * 100;
  const selectedLine = HYDROGEN_LINES.find(
    (line) => Math.abs(selectedWave - line.wave) < 2.5,
  );
  const currentColor = waveLengthToRGB(selectedWave);

  const hoverLine = hoverData
    ? HYDROGEN_LINES.find((line) => Math.abs(hoverData.wave - line.wave) < 2.5)
    : null;

  // Стили для кнопок стрелочек
  const arrowBtnStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #ced4da",
    borderRadius: "6px",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "18px",
    color: "#495057",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    transition: "background 0.2s",
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

      {/* Шкала спектра */}
      <div
        ref={barRef}
        tabIndex={0}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverData(null)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          position: "relative",
          height: "45px",
          width: "100%",
          borderRadius: "8px",
          cursor: "crosshair",
          background:
            "linear-gradient(to right, #38008c, #4a00e0, #004dff, #00ffff, #00ff00, #ffff00, #ff8000, #ff0000, #7a0000)",
          boxShadow: isFocused
            ? "0 0 0 3px rgba(0, 122, 255, 0.5)"
            : "0 4px 12px rgba(0,0,0,0.15)",
          outline: "none",
          transition: "box-shadow 0.2s",
        }}
      >
        {/* Линии водорода */}
        {HYDROGEN_LINES.map((line) => {
          const linePercent =
            ((line.wave - MIN_WAVE) / (MAX_WAVE - MIN_WAVE)) * 100;
          return (
            <div
              key={line.name}
              style={{
                position: "absolute",
                left: `${linePercent}%`,
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

        {/* Указатель зафиксированного цвета (выделенная волна) */}
        <div
          style={{
            position: "absolute",
            left: `${selectedPercent}%`,
            top: "-5px",
            bottom: "-5px",
            width: "3px",
            backgroundColor: "#222",
            border: "1px solid #fff",
            borderRadius: "2px",
            transform: "translateX(-50%)",
            zIndex: 10,
            pointerEvents: "none",
            boxShadow: "0 0 4px rgba(0,0,0,0.5)",
            transition: "left 0.1s ease-out",
          }}
        />

        {/* Всплывающая подсказка при наведении (без сдвига указателя) */}
        {hoverData && (
          <div
            style={{
              position: "absolute",
              left: `${hoverData.x}px`,
              top: "-45px",
              transform: "translateX(-50%)",
              backgroundColor: "#222",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            {hoverLine ? (
              <>
                <strong style={{ color: "#4ae54a" }}>{hoverLine.name}</strong>
                <span>{hoverData.wave.toFixed(1)} нм</span>
              </>
            ) : (
              <span>~ {hoverData.wave.toFixed(1)} нм</span>
            )}
            <div
              style={{
                position: "absolute",
                bottom: "-4px",
                width: 0,
                height: 0,
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderTop: "4px solid #222",
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

      {/* Информационная панель с кнопками настройки */}
      <div
        style={{
          marginTop: "15px",
          padding: "12px 16px",
          backgroundColor: "#f8f9fa",
          borderRadius: "12px",
          border: "1px solid #e9ecef",
          display: "flex",
          alignItems: "center",
          gap: "15px",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
        }}
      >
        {/* Отображение зафиксированного цвета */}
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            backgroundColor: currentColor,
            boxShadow:
              "0 2px 6px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(0,0,0,0.1)",
            flexShrink: 0,
          }}
        />

        {/* Текстовая информация */}
        <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span
              style={{ fontSize: "20px", fontWeight: "bold", color: "#212529" }}
            >
              {selectedWave.toFixed(1)} нм
            </span>
            {selectedLine && (
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: selectedLine.color,
                  background: "#fff",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              >
                {selectedLine.name}
              </span>
            )}
          </div>

          <span
            style={{ fontSize: "12px", color: "#868e96", marginTop: "2px" }}
          >
            Кликните по спектру для выбора
          </span>
        </div>

        {/* Кнопки-стрелочки для точной настройки */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            style={arrowBtnStyle}
            onClick={() => adjustSelectedWave(-0.5)}
            title="Уменьшить (на 0.5 нм)"
          >
            &#9664; {/* Иконка стрелки влево */}
          </button>
          <button
            style={arrowBtnStyle}
            onClick={() => adjustSelectedWave(0.5)}
            title="Увеличить (на 0.5 нм)"
          >
            &#9654; {/* Иконка стрелки вправо */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpectrumLine;
