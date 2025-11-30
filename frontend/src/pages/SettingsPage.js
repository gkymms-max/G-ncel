import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Upload } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const currencies = ["EUR", "USD", "TL"];

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    company_name: "",
    company_address: "",
    company_phone: "",
    company_email: "",
    company_website: "",
    logo: null,
    default_currency: "EUR",
    default_vat_rate: 18,
    // UI Theme
    ui_theme: "light"
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (settings.ui_theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.ui_theme]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
    } catch (error) {
      toast.error("Ayarlar yüklenemedi");
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Ayarlar kaydedildi");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Space Grotesk' }}>Ayarlar</h1>
        <p className="text-gray-600">Firma bilgilerinizi ve varsayılan ayarları yönetin</p>
      </div>

      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Firma Bilgileri
            </CardTitle>
            <CardDescription>
              Bu bilgiler PDF tekliflerinizde görünecektir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="logo">Firma Logosu</Label>
                <div className="flex items-center gap-4 mt-2">
                  {settings.logo && (
                    <img src={settings.logo} alt="Logo" className="h-20 w-20 object-contain border rounded" />
                  )}
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="cursor-pointer"
                      data-testid="logo-upload-input"
                    />
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG veya JPEG formatında yükleyebilirsiniz</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="company_name">Firma Adı *</Label>
                  <Input
                    id="company_name"
                    value={settings.company_name}
                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                    required
                    data-testid="company-name-input"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="company_address">Adres</Label>
                  <Input
                    id="company_address"
                    value={settings.company_address || ""}
                    onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                    data-testid="company-address-input"
                  />
                </div>

                <div>
                  <Label htmlFor="company_phone">Telefon</Label>
                  <Input
                    id="company_phone"
                    value={settings.company_phone || ""}
                    onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                    data-testid="company-phone-input"
                  />
                </div>

                <div>
                  <Label htmlFor="company_email">E-posta</Label>
                  <Input
                    id="company_email"
                    type="email"
                    value={settings.company_email || ""}
                    onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                    data-testid="company-email-input"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="company_website">Web Sitesi</Label>
                  <Input
                    id="company_website"
                    value={settings.company_website || ""}
                    onChange={(e) => setSettings({ ...settings, company_website: e.target.value })}
                    placeholder="www.firma.com"
                    data-testid="company-website-input"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4 text-gray-700">Arayüz Ayarları</h3>
                <div>
                  <Label htmlFor="ui_theme">Tema</Label>
                  <select
                    id="ui_theme"
                    value={settings.ui_theme || "light"}
                    onChange={(e) => setSettings({ ...settings, ui_theme: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  >
                    <option value="light">Açık Tema</option>
                    <option value="dark">Koyu Tema</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4 text-gray-700">Varsayılan Değerler</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="default_currency">Varsayılan Para Birimi</Label>
                    <select
                      id="default_currency"
                      value={settings.default_currency}
                      onChange={(e) => setSettings({ ...settings, default_currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="default-currency-select"
                    >
                      {currencies.map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="default_vat_rate">Varsayılan KDV Oranı (%)</Label>
                    <Input
                      id="default_vat_rate"
                      type="number"
                      step="0.01"
                      value={settings.default_vat_rate}
                      onChange={(e) => setSettings({ ...settings, default_vat_rate: parseFloat(e.target.value) || 0 })}
                      data-testid="default-vat-input"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading} data-testid="save-settings-button">
                  {loading ? "Kaydediliyor..." : "Ayarları Kaydet"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}