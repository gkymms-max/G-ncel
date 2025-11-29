import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { ShoppingCart, FileText, MessageCircle, Instagram, Facebook, Linkedin, Twitter, Globe, Mail, Phone, ExternalLink } from "lucide-react";
import ProductCatalog from "./ProductCatalog";
import RequestQuote from "./RequestQuote";
import MyQuotes from "./MyQuotes";
import ContactPage from "./ContactPage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Portal({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [contactChannels, setContactChannels] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchContactChannels();
    fetchSettings();
  }, []);

  const fetchContactChannels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/contact-channels`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContactChannels(response.data);
    } catch (error) {
      console.error("Contact channels error:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
    } catch (error) {
      console.error("Settings error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const openChannel = (channel) => {
    let url = channel.value;
    
    if (channel.type === 'whatsapp') {
      // WhatsApp Web URL
      url = `https://wa.me/${channel.value}`;
    } else if (channel.type === 'email') {
      url = `mailto:${channel.value}`;
    } else if (channel.type === 'phone') {
      url = `tel:${channel.value}`;
    } else if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    
    window.open(url, '_blank');
  };

  const getChannelIcon = (type) => {
    const icons = {
      whatsapp: MessageCircle,
      instagram: Instagram,
      facebook: Facebook,
      linkedin: Linkedin,
      twitter: Twitter,
      website: Globe,
      email: Mail,
      phone: Phone
    };
    const Icon = icons[type] || MessageCircle;
    return <Icon className="h-5 w-5" />;
  };

  const isActive = (path) => {
    if (path === "/portal") return location.pathname === "/portal";
    return location.pathname.startsWith(path);
  };

  if (location.pathname === "/portal") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                {settings?.logo && (
                  <img src={settings.logo} alt="Logo" className="h-10 w-10 object-contain mr-3" />
                )}
                <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk' }}>
                  {settings?.company_name || 'Firmamız'}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <nav className="hidden md:flex space-x-6">
                  <Link to="/portal/catalog" className="text-gray-600 hover:text-indigo-600 font-medium">Fiyat Listesi</Link>
                  <Link to="/portal/quote" className="text-gray-600 hover:text-indigo-600 font-medium">Teklif İste</Link>
                  <Link to="/portal/quotes" className="text-gray-600 hover:text-indigo-600 font-medium">Tekliflerim</Link>
                  <Link to="/portal/contact" className="text-gray-600 hover:text-indigo-600 font-medium">İletişim</Link>
                </nav>
                <Button variant="outline" onClick={handleLogout}>Çıkış</Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Hoş Geldiniz
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ürün kataloğumuzu inceleyin, teklif isteyin ve bizimle iletişime geçin
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/portal/catalog')}>
              <CardHeader className="text-center">
                <ShoppingCart className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <CardTitle className="text-xl">Fiyat Listesi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">Tüm ürünlerimizi görselleri ile birlikte inceleyin</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/portal/quote')}>
              <CardHeader className="text-center">
                <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-xl">Teklif İste</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">İhtiyacınız olan ürünler için hızlıca teklif alın</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/portal/contact')}>
              <CardHeader className="text-center">
                <MessageCircle className="h-12 w-12 text-pink-600 mx-auto mb-4" />
                <CardTitle className="text-xl">İletişim</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">WhatsApp, sosyal medya veya telefon ile bizimle iletişime geçin</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Channels */}
          {contactChannels.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Bize Ulaşın</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {contactChannels.slice(0, 6).map(channel => (
                  <Button
                    key={channel.id}
                    variant="outline"
                    className="p-4 h-auto flex-col gap-2 hover:bg-gray-50"
                    onClick={() => openChannel(channel)}
                  >
                    {getChannelIcon(channel.type)}
                    <span className="text-xs font-medium">{channel.title}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {settings?.logo && (
                <img src={settings.logo} alt="Logo" className="h-10 w-10 object-contain mr-3" />
              )}
              <Link to="/portal" className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk' }}>
                {settings?.company_name || 'Firmamız'}
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex space-x-6">
                <Link to="/portal/catalog" className={`font-medium ${
                  isActive('/portal/catalog') ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                }`}>Fiyat Listesi</Link>
                <Link to="/portal/quote" className={`font-medium ${
                  isActive('/portal/quote') ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                }`}>Teklif İste</Link>
                <Link to="/portal/quotes" className={`font-medium ${
                  isActive('/portal/quotes') ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                }`}>Tekliflerim</Link>
                <Link to="/portal/contact" className={`font-medium ${
                  isActive('/portal/contact') ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                }`}>İletişim</Link>
              </nav>
              <Button variant="outline" onClick={handleLogout}>Çıkış</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/catalog" element={<ProductCatalog />} />
          <Route path="/quote" element={<RequestQuote />} />
          <Route path="/quotes" element={<MyQuotes />} />
          <Route path="/contact" element={<ContactPage contactChannels={contactChannels} openChannel={openChannel} />} />
        </Routes>
      </main>
    </div>
  );
}