import React, { useEffect, useRef, useState } from "react";
import SpectrumLine from "./Spectrum-line";

const CameraView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // Обычно спектроскопы крепят к основной камере
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsActive(true);
        }
      } catch (err) {
        setError("Доступ к камере отклонен или не поддерживается");
      }
    }

    if (!photo) startCamera();

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [photo]);

  const takePhoto = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        setPhoto(canvas.toDataURL("image/png"));
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        gap: "15px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "500px",
          background: "#000",
          borderRadius: "12px",
          overflow: "hidden",
          aspectRatio: "4/3",
        }}
      >
        {photo ? (
          <img
            src={photo}
            alt="Result"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: isActive ? "block" : "none",
            }}
          />
        )}
        {!isActive && !error && !photo && (
          <div
            style={{
              color: "#fff",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Инициализация...
          </div>
        )}
        {error && (
          <div
            style={{ color: "#ff4d4d", padding: "20px", textAlign: "center" }}
          >
            {error}
          </div>
        )}
      </div>

      <button
        onClick={photo ? () => setPhoto(null) : takePhoto}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          borderRadius: "30px",
          border: "none",
          background: "#007AFF",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        {photo ? "Сделать новый снимок" : "Зафиксировать спектр"}
      </button>

      <SpectrumLine />
    </div>
  );
};

export default CameraView;
