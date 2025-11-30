import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, KeyRound, Users as UsersIcon, Edit } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ username: "", password: "", role: "user" });
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");

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
    } catch (error) {
      toast.error("Kullanıcılar yüklenemedi");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.post(`${API}/users`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Kullanıcı eklendi");
      setDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Bir hata oluştu");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Kullanıcı silindi");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Kullanıcı silinemedi");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.put(`${API}/users/${selectedUser.id}/password`, 
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Şifre sıfırlandı");
      setPasswordDialogOpen(false);
      setNewPassword("");
      setSelectedUser(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Şifre sıfırlanamadı");
    }
  };

  const openPasswordDialog = (user) => {
    setSelectedUser(user);
    setPasswordDialogOpen(true);
  };

  const openRoleDialog = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleDialogOpen(true);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.put(`${API}/users/${selectedUser.id}/role`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Rol güncellendi");
      setRoleDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Rol güncellenemedi");
    }
  };

  const resetForm = () => {
    setFormData({ username: "", password: "", role: "user" });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Space Grotesk' }}>Kullanıcı Yönetimi</h1>
        <p className="text-gray-600">Pazarlamacı personelleri yönetin</p>
      </div>

      <div className="flex justify-end mb-6">
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-user-button">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kullanıcı Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
              <p className="text-sm text-gray-500">Yeni pazarlamacı personel ekleyin</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Kullanıcı Adı *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  data-testid="user-username-input"
                />
              </div>
              <div>
                <Label htmlFor="password">Şifre *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  data-testid="user-password-input"
                />
              </div>
              <div>
                <Label htmlFor="role">Rol *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger data-testid="user-role-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Pazarlamacı</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
                <Button type="submit" data-testid="save-user-button">Kaydet</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {users.map(user => (
          <Card key={user.id} data-testid="user-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UsersIcon className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{user.username}</CardTitle>
                    <p className="text-sm text-gray-500">Kayıt: {format(new Date(user.created_at), 'dd MMM yyyy', { locale: tr })}</p>
                  </div>
                </div>
                <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                  {user.role === 'admin' ? 'Admin' : 'Pazarlamacı'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openRoleDialog(user)}
                  data-testid="edit-role-button"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Rol Düzenle
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openPasswordDialog(user)}
                  data-testid="reset-password-button"
                >
                  <KeyRound className="h-3 w-3 mr-1" />
                  Şifre Sıfırla
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(user.id)}
                  data-testid="delete-user-button"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Sil
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Password Reset Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Şifre Sıfırla</DialogTitle>
            <p className="text-sm text-gray-500">{selectedUser?.username} için yeni şifre belirleyin</p>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="new_password">Yeni Şifre *</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={4}
                data-testid="new-password-input"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(false)}>İptal</Button>
              <Button type="submit" data-testid="confirm-reset-password">Şifreyi Sıfırla</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}