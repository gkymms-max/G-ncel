import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Users as UsersIcon, Shield, CheckSquare } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const permissionModules = {
  customers: {
    label: "Müşteriler",
    permissions: ["view", "create", "update", "delete"]
  },
  suppliers: {
    label: "Tedarikçiler",
    permissions: ["view", "create", "update", "delete"]
  },
  products: {
    label: "Ürünler",
    permissions: ["view", "create", "update", "delete"]
  },
  quotes: {
    label: "Teklifler",
    permissions: ["view", "create", "update", "delete", "approve"]
  },
  invoices: {
    label: "Faturalar",
    permissions: ["view", "create", "update", "delete", "approve"]
  },
  payments: {
    label: "Ödeme/Tahsilat",
    permissions: ["view", "create", "update", "delete"]
  },
  accounts: {
    label: "Kasa & Banka",
    permissions: ["view", "create", "update", "delete"]
  },
  reports: {
    label: "Raporlar",
    permissions: ["view", "export"]
  },
  settings: {
    label: "Ayarlar",
    permissions: ["update"]
  },
  categories: {
    label: "Kategoriler (Admin)",
    permissions: ["manage"]
  },
  users: {
    label: "Kullanıcılar (Admin)",
    permissions: ["manage"]
  },
  market: {
    label: "Borsa Takibi",
    permissions: ["view"]
  }
};

const permissionLabels = {
  view: "Görüntüle",
  create: "Ekle",
  update: "Düzenle",
  delete: "Sil",
  approve: "Onayla",
  export: "Excel Export",
  manage: "Yönet"
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ username: "", password: "", role: "user" });
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Kullanıcılar yüklenemedi:", error);
      toast.error("Kullanıcılar yüklenemedi");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/users`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Kullanıcı eklendi");
      setDialogOpen(false);
      setFormData({ username: "", password: "", role: "user" });
      fetchUsers();
    } catch (error) {
      console.error("Kullanıcı eklenemedi:", error);
      toast.error(error.response?.data?.detail || "Kullanıcı eklenemedi");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Kullanıcı silindi");
      fetchUsers();
    } catch (error) {
      console.error("Kullanıcı silinemedi:", error);
      toast.error(error.response?.data?.detail || "Kullanıcı silinemedi");
    }
  };

  const openPermissionDialog = (user) => {
    setSelectedUser(user);
    setPermissions(user.permissions || getDefaultPermissions());
    setPermissionDialogOpen(true);
  };

  const getDefaultPermissions = () => {
    const defaults = {};
    Object.keys(permissionModules).forEach(module => {
      defaults[module] = {};
      permissionModules[module].permissions.forEach(perm => {
        defaults[module][perm] = false;
      });
    });
    return defaults;
  };

  const handlePermissionChange = (module, permission, value) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [permission]: value
      }
    }));
  };

  const handleSelectAll = () => {
    const allPerms = {};
    Object.keys(permissionModules).forEach(module => {
      allPerms[module] = {};
      permissionModules[module].permissions.forEach(perm => {
        allPerms[module][perm] = true;
      });
    });
    setPermissions(allPerms);
    toast.success("Tüm yetkiler seçildi");
  };

  const handleViewOnly = () => {
    const viewPerms = {};
    Object.keys(permissionModules).forEach(module => {
      viewPerms[module] = {};
      permissionModules[module].permissions.forEach(perm => {
        viewPerms[module][perm] = perm === "view";
      });
    });
    setPermissions(viewPerms);
    toast.success("Sadece görüntüleme yetkileri verildi");
  };

  const handleClearAll = () => {
    setPermissions(getDefaultPermissions());
    toast.success("Tüm yetkiler kaldırıldı");
  };

  const savePermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API}/users/${selectedUser.id}/permissions`,
        permissions,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Yetkiler güncellendi");
      setPermissionDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Yetkiler güncellenemedi:", error);
      toast.error("Yetkiler güncellenemedi");
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Kullanıcı Yönetimi
          </h1>
          <p className="text-gray-600">Kullanıcılar ve yetkilendirme</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kullanıcı
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5" />
                    <span>{user.username}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                    {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => openPermissionDialog(user)}>
                    <Shield className="mr-2 h-4 w-4" />
                    Yetkilendirme
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(user.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Kullanıcı Adı *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Şifre *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Rol</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="user">Kullanıcı</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                İptal
              </Button>
              <Button type="submit">Ekle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Yetkilendirme: {selectedUser?.username}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
              <Button size="sm" variant="outline" onClick={handleSelectAll}>
                <CheckSquare className="mr-2 h-4 w-4" />
                Tümünü Seç
              </Button>
              <Button size="sm" variant="outline" onClick={handleViewOnly}>
                Sadece Görüntüleme
              </Button>
              <Button size="sm" variant="outline" onClick={handleClearAll}>
                Tümünü Kaldır
              </Button>
            </div>

            {/* Permission Grid */}
            <div className="space-y-4">
              {Object.entries(permissionModules).map(([moduleKey, module]) => (
                <Card key={moduleKey}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">{module.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {module.permissions.map(perm => (
                        <div key={perm} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${moduleKey}-${perm}`}
                            checked={permissions[moduleKey]?.[perm] || false}
                            onCheckedChange={(checked) => handlePermissionChange(moduleKey, perm, checked)}
                          />
                          <Label
                            htmlFor={`${moduleKey}-${perm}`}
                            className="text-sm cursor-pointer"
                          >
                            {permissionLabels[perm]}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={savePermissions}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
