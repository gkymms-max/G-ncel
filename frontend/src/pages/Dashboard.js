import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Package, FileText, Settings, FolderOpen, Users } from "lucide-react";
import Products from "./Products";
import Quotes from "./Quotes";
import SettingsPage from "./SettingsPage";
import Categories from "./Categories";
import UsersPage from "./Users";

export default function Dashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    setIsAdmin(role === 'admin');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const userMenuItems = [
    { path: "/", icon: Package, label: "Ürünler" },
    { path: "/quotes", icon: FileText, label: "Teklifler" },
    { path: "/settings", icon: Settings, label: "Ayarlar" },
  ];

  const adminMenuItems = [
    { path: "/categories", icon: FolderOpen, label: "Kategoriler" },
    { path: "/users", icon: Users, label: "Kullanıcılar" },
  ];

  const menuItems = isAdmin ? [...userMenuItems, ...adminMenuItems] : userMenuItems;

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-indigo-600 to-indigo-800 flex flex-col shadow-xl">
        <div className="p-6 border-b border-indigo-500">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Fiyat Teklifi</h1>
          <p className="text-sm text-indigo-200 mt-1">Yönetim Paneli</p>
          {isAdmin && (
            <div className="mt-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500 text-white">
                Admin
              </span>
            </div>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${
                  active 
                    ? 'bg-white text-indigo-700 shadow-md font-medium' 
                    : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
                }`}
                onClick={() => navigate(item.path)}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-indigo-500">
          <button
            className="w-full flex items-center px-4 py-3 rounded-lg text-indigo-100 hover:bg-red-500 hover:text-white transition-all"
            onClick={handleLogout}
            data-testid="logout-button"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/settings" element={<SettingsPage />} />
          {isAdmin && <Route path="/categories" element={<Categories />} />}
          {isAdmin && <Route path="/users" element={<UsersPage />} />}
        </Routes>
      </div>
    </div>
  );
}