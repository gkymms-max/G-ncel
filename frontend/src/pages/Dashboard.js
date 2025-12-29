import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Package, FileText, Settings, FolderOpen, Users, MessageCircle, UserCheck, TrendingUp, Home as HomeIcon, CheckSquare } from "lucide-react";
import Home from "./Home";
import Products from "./Products";
import Quotes from "./Quotes";
import SettingsPage from "./SettingsPage";
import Categories from "./Categories";
import UsersPage from "./Users";
import ContactChannels from "./ContactChannels";
import Customers from "./Customers";
import MarketWatch from "./MarketWatch";
import ApprovalPanel from "./ApprovalPanel";

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
    { path: "/", icon: HomeIcon, label: "Ana Sayfa" },
    { path: "/products", icon: Package, label: "Ürünler" },
    { path: "/quotes", icon: FileText, label: "Teklifler" },
    { path: "/customers", icon: UserCheck, label: "Müşteriler" },
    { path: "/settings", icon: Settings, label: "Ayarlar" },
  ];

  const adminMenuItems = [
    { path: "/approval", icon: CheckSquare, label: "Teklif Onayları" },
    { path: "/categories", icon: FolderOpen, label: "Kategoriler" },
    { path: "/users", icon: Users, label: "Kullanıcılar" },
    { path: "/contact-channels", icon: MessageCircle, label: "İletişim Kanalları" },
    { path: "/market-watch", icon: TrendingUp, label: "Borsa Takibi" },
  ];

  const menuItems = isAdmin 
    ? [...userMenuItems, ...adminMenuItems] 
    : userMenuItems;

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col shadow-2xl">
        <div className="p-6 border-b border-purple-800/30">
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Özay Plise</h1>
          <h2 className="text-lg font-semibold text-purple-200 mt-0.5">Fiyat Teklifi</h2>
          <p className="text-sm text-purple-300 mt-1">Yönetim Paneli</p>
          {isAdmin && (
            <div className="mt-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
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
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  active 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105' 
                    : 'text-purple-200 hover:bg-white/10 hover:text-white hover:translate-x-1'
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
        <div className="p-4 border-t border-purple-800/30">
          <button
            className="w-full flex items-center px-4 py-3 rounded-xl text-purple-200 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white transition-all duration-200 hover:shadow-lg"
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
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/settings" element={<SettingsPage />} />
          {isAdmin && <Route path="/approval" element={<ApprovalPanel />} />}
          {isAdmin && <Route path="/categories" element={<Categories />} />}
          {isAdmin && <Route path="/users" element={<UsersPage />} />}
          {isAdmin && <Route path="/contact-channels" element={<ContactChannels />} />}
          {isAdmin && <Route path="/market-watch" element={<MarketWatch />} />}
        </Routes>
      </div>
    </div>
  );
}