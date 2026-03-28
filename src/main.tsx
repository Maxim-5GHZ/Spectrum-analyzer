import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CameraView from "./CameraView.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CameraView />
  </StrictMode>,
);
