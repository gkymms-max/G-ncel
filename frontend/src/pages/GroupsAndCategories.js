import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, FolderOpen, LayoutGrid } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function GroupsAndCategories() {
  const [activeTab, setActiveTab] = useState('groups');
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemName, setItemName] = useState("");

  useEffect(() => {
    fetchGroups();
    fetchCategories();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data);
    } catch (error) {
      toast.error("Gruplar yüklenemedi");
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      toast.error("Kategoriler yüklenemedi");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const endpoint = activeTab === 'groups' ? '/groups' : '/categories';

    try {
      if (editingItem) {
        await axios.put(`${API}${endpoint}/${editingItem.id}`, { name: itemName }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`${activeTab === 'groups' ? 'Grup' : 'Kategori'} güncellendi`);
      } else {
        await axios.post(`${API}${endpoint}`, { name: itemName }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`${activeTab === 'groups' ? 'Grup' : 'Kategori'} eklendi`);
      }
      setDialogOpen(false);
      setItemName("");
      setEditingItem(null);
      if (activeTab === 'groups') {
        fetchGroups();
      } else {
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Bir hata oluştu");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Bu ${activeTab === 'groups' ? 'grubu' : 'kategoriyi'} silmek istediğinize emin misiniz?`)) return;

    const token = localStorage.getItem('token');
    const endpoint = activeTab === 'groups' ? '/groups' : '/categories';

    try {
      await axios.delete(`${API}${endpoint}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`${activeTab === 'groups' ? 'Grup' : 'Kategori'} silindi`);
      if (activeTab === 'groups') {
        fetchGroups();
      } else {
        fetchCategories();
      }
    } catch (error) {
      toast.error("Silme işlemi başarısız");
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setItemName("");
    setDialogOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setDialogOpen(true);
  };

  const currentItems = activeTab === 'groups' ? groups : categories;
  const currentLabel = activeTab === 'groups' ? 'Grup' : 'Kategori';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
          Grup ve Kategori Yönetimi
        </h1>
        <p className="text-gray-600">Ürün gruplarınızı ve kategorilerinizi yönetin</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('groups')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'groups'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FolderOpen className="inline-block h-5 w-5 mr-2" />
          Gruplar
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'categories'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <LayoutGrid className="inline-block h-5 w-5 mr-2" />
          Kategoriler
        </button>
      </div>

      {/* Add Button */}
      <div className="flex justify-end mb-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni {currentLabel} Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? `${currentLabel} Düzenle` : `Yeni ${currentLabel} Ekle`}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{currentLabel} Adı *</Label>
                <Input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder={`${currentLabel} adı`}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">
                  {editingItem ? "Güncelle" : "Ekle"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  {activeTab === 'groups' ? <FolderOpen className="h-5 w-5 text-blue-500" /> : <LayoutGrid className="h-5 w-5 text-green-500" />}
                  {item.name}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                {new Date(item.created_at).toLocaleDateString('tr-TR')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {currentItems.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Henüz {currentLabel.toLowerCase()} eklenmemiş</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
