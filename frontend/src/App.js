import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Portal from "./pages/Portal";
import { Toaster } from "./components/ui/sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
    
    // Load and apply theme color
    if (token) {
      loadThemeColor(token);
    }
  }, []);

  const loadThemeColor = async (token) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const themeColor = response.data.theme_color || "#4F46E5";
      applyThemeColor(themeColor);
    } catch (error) {
      console.error("Tema rengi yüklenemedi:", error);
    }
  };

  const applyThemeColor = (color) => {
    document.documentElement.style.setProperty('--theme-color', color);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/portal/*" 
            element={isAuthenticated ? <Portal setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/*" 
            element={isAuthenticated ? <Dashboard setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} 
          />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;