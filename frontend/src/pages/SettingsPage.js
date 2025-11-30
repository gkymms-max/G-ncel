import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Upload, Plus, Trash2, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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
  const [roles, setRoles] = useState([]);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", display_name: "" });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchSettings();
    const role = localStorage.getItem('role');
    setIsAdmin(role === 'admin');
    if (role === 'admin') {
      fetchRoles();
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (settings.ui_theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.ui_theme]);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(response.data);
    } catch (error) {
      console.error("Roller yüklenemedi:", error);
    }
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.post(`${API}/roles`, newRole, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Rol eklendi");
      setRoleDialogOpen(false);
      setNewRole({ name: "", display_name: "" });
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Rol eklenemedi");
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm("Bu rolü silmek istediğinize emin misiniz?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Rol silindi");
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Rol silinemedi");
    }
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
      
      // Apply theme immediately after fetching
      if (response.data.ui_theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
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
      
      // Apply theme immediately after saving
      if (settings.ui_theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
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

        {isAdmin && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Kullanıcı Rolleri
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Özel kullanıcı rolleri tanımlayın</p>
                </div>
                <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Yeni Rol Ekle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yeni Rol Ekle</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddRole} className="space-y-4">
                      <div>
                        <Label htmlFor="role_name">Rol Adı (İngilizce) *</Label>
                        <Input
                          id="role_name"
                          value={newRole.name}
                          onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                          placeholder="örn: marketer"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Sistem içinde kullanılacak ad (boşluksuz, küçük harf)</p>
                      </div>
                      <div>
                        <Label htmlFor="role_display_name">Görünen Ad *</Label>
                        <Input
                          id="role_display_name"
                          value={newRole.display_name}
                          onChange={(e) => setNewRole({ ...newRole, display_name: e.target.value })}
                          placeholder="örn: Pazarlamacı"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Kullanıcılara gösterilecek ad</p>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setRoleDialogOpen(false)}>İptal</Button>
                        <Button type="submit">Kaydet</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {roles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p>Henüz özel rol tanımlanmamış</p>
                  <p className="text-sm mt-1">Varsayılan roller: Admin, Kullanıcı</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {roles.map(role => (
                    <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-indigo-600" />
                        <div>
                          <p className="font-medium">{role.display_name}</p>
                          <p className="text-xs text-gray-500">{role.name}</p>
                        </div>
                      </div>
                      {!['admin', 'user'].includes(role.name) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteRole(role.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      {['admin', 'user'].includes(role.name) && (
                        <Badge variant="outline">Varsayılan</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}