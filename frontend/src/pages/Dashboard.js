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
            return (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate(item.path)}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
            data-testid="logout-button"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Çıkış Yap
          </Button>
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