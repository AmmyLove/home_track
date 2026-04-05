import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx"; 
import "./index.css"; 

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* AuthProvider wraps everything so every page can access the logged-in user */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);