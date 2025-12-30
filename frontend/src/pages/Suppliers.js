import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import EmptyState from "@/components/common/EmptyState";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    tax_number: "",
    tax_office: ""
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/suppliers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Tedarikçiler yüklenemedi:", error);
      toast.error("Tedarikçiler yüklenemedi");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingSupplier) {
        await axios.put(
          `${API}/suppliers/${editingSupplier.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Tedarikçi güncellendi");
      } else {
        await axios.post(
          `${API}/suppliers`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Tedarikçi eklendi");
      }
      
      setDialogOpen(false);
      resetForm();
      fetchSuppliers();
    } catch (error) {
      console.error("Tedarikçi kaydedilemedi:", error);
      toast.error("Tedarikçi kaydedilemedi");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu tedarikçiyi silmek istediğinizden emin misiniz?")) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/suppliers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Tedarikçi silindi");
      fetchSuppliers();
    } catch (error) {
      console.error("Tedarikçi silinemedi:", error);
      toast.error("Tedarikçi silinemedi");
    }
  };

  const openDialog = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name || "",
        company: supplier.company || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        tax_number: supplier.tax_number || "",
        tax_office: supplier.tax_office || ""
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSupplier(null);
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      tax_number: "",
      tax_office: ""
    });
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Tedarikçiler
          </h1>
          <p className="text-gray-600">Tedarikçi listesi ve cari hesap durumu</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Tedarikçi
        </Button>
      </motion.div>

      {suppliers.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Henüz tedarikçi yok"
          description="İlk tedarikçinizi ekleyerek başlayın"
          actionLabel="Yeni Tedarikçi Ekle"
          onAction={() => openDialog()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier, index) => (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{supplier.name}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openDialog(supplier)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(supplier.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {supplier.company && (
                    <div className="text-sm">
                      <span className="font-medium">Firma:</span> {supplier.company}
                    </div>
                  )}
                  {supplier.email && (
                    <div className="text-sm">
                      <span className="font-medium">E-posta:</span> {supplier.email}
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="text-sm">
                      <span className="font-medium">Telefon:</span> {supplier.phone}
                    </div>
                  )}
                  {supplier.tax_number && (
                    <div className="text-sm">
                      <span className="font-medium">Vergi No:</span> {supplier.tax_number}
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm font-semibold">
                      Bakiye: <span className={supplier.balance > 0 ? "text-red-600" : "text-green-600"}>
                        {supplier.balance.toFixed(2)} TL
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? "Tedarikçi Düzenle" : "Yeni Tedarikçi"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Yetkili Ad Soyad *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Firma Adı</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="tax_number">Vergi Numarası</Label>
                <Input
                  id="tax_number"
                  value={formData.tax_number}
                  onChange={(e) => setFormData({...formData, tax_number: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="tax_office">Vergi Dairesi</Label>
                <Input
                  id="tax_office"
                  value={formData.tax_office}
                  onChange={(e) => setFormData({...formData, tax_office: e.target.value})}
                />
              </div>
            </div>
            <div className="col-span-2">
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                İptal
              </Button>
              <Button type="submit">
                {editingSupplier ? "Güncelle" : "Ekle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
