// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { useAuthStore } from "./store/authStore";

// Initialize auth state on app start
useAuthStore.getState().init();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <App />
      </div>
    </BrowserRouter>
  </StrictMode>
);
