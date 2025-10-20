import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    {/* ✅ Toast notification provider */}
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#10B981", // emerald green base color
          color: "#fff",
          fontWeight: 500,
          borderRadius: "8px",
        },
      }}
    />
  </StrictMode>
);
