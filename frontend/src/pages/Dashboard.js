import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Package, FileText, Settings, FolderOpen, Users, UserCheck, TrendingUp, Home as HomeIcon, CheckSquare, Building2, Receipt, CreditCard, Wallet } from "lucide-react";
import Home from "./Home";
import Products from "./Products";
import Quotes from "./Quotes";
import SettingsPage from "./SettingsPage";
import Categories from "./Categories";
import UsersPage from "./Users";
import Customers from "./Customers";
import MarketWatch from "./MarketWatch";
import ApprovalPanel from "./ApprovalPanel";
import Suppliers from "./Suppliers";
import Accounts from "./Accounts";

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
    { path: "/quotes", icon: FileText, label: "Teklifler" },
    { path: "/invoices", icon: Receipt, label: "Faturalar" },
    { path: "/payments", icon: CreditCard, label: "Ödeme/Tahsilat" },
    { path: "/accounts", icon: Wallet, label: "Kasa & Banka" },
    { path: "/products", icon: Package, label: "Ürünler" },
    { path: "/customers", icon: UserCheck, label: "Müşteriler" },
    { path: "/suppliers", icon: Building2, label: "Tedarikçiler" },
    { path: "/settings", icon: Settings, label: "Ayarlar" },
  ];

  const adminMenuItems = [
    { path: "/quote-approval", icon: CheckSquare, label: "Teklif Onayları" },
    { path: "/invoice-approval", icon: CheckSquare, label: "Fatura Onayları" },
    { path: "/categories", icon: FolderOpen, label: "Kategoriler" },
    { path: "/users", icon: Users, label: "Kullanıcılar" },
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
          <div className="flex items-center gap-3 mb-3">
            <div className="h-14 w-14 bg-white rounded-lg p-2 flex items-center justify-center shadow-lg">
              <img 
                src="https://customer-assets.emergentagent.com/job_pricequote-1/artifacts/0mg7uoiz_op.png" 
                alt="Özay Plise Logo" 
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Özay Plise</h1>
              <h2 className="text-sm font-semibold text-purple-200">Fiyat Teklifi</h2>
            </div>
          </div>
          <p className="text-xs text-purple-300">Yönetim Paneli</p>
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
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/invoices" element={<Home />} />
          <Route path="/payments" element={<Home />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/products" element={<Products />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/settings" element={<SettingsPage />} />
          {isAdmin && <Route path="/quote-approval" element={<ApprovalPanel />} />}
          {isAdmin && <Route path="/invoice-approval" element={<ApprovalPanel />} />}
          {isAdmin && <Route path="/categories" element={<Categories />} />}
          {isAdmin && <Route path="/users" element={<UsersPage />} />}
          {isAdmin && <Route path="/market-watch" element={<MarketWatch />} />}
        </Routes>
      </div>
    </div>
  );
}