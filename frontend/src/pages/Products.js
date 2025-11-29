import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Search, Package, LayoutGrid, List } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const units = ["KG", "Metre", "m²", "Adet"];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    // Load saved view mode from localStorage
    return localStorage.getItem('productViewMode') || 'grid';
  });
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    unit: "Adet",
    unit_price: 0,
    currency: "EUR",
    package_kg: null,
    package_m2: null,
    package_length: null,
    package_count: null,
    description: "",
    image: null
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Kategoriler yüklenemedi", error);
    }
  };

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      toast.error("Ürünler yüklenemedi");
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== "Tümü") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Ürün güncellendi");
      } else {
        await axios.post(`${API}/products`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Ürün eklendi");
      }
      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Ürün silindi");
      fetchProducts();
    } catch (error) {
      toast.error("Ürün silinemedi");
    }
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      category: product.category,
      unit: product.unit,
      unit_price: product.unit_price,
      currency: product.currency || "EUR",
      package_kg: product.package_kg,
      package_m2: product.package_m2,
      package_length: product.package_length,
      package_count: product.package_count,
      description: product.description || "",
      image: product.image
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      code: "",
      name: "",
      category: "",
      unit: "Adet",
      unit_price: 0,
      currency: "EUR",
      package_kg: null,
      package_m2: null,
      package_length: null,
      package_count: null,
      description: "",
      image: null
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Space Grotesk' }}>Ürün Yönetimi</h1>
        <p className="text-gray-600">Ürünlerinizi ekleyin, düzenleyin ve yönetin</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Ürün adı veya kodu ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="product-search-input"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48" data-testid="category-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tümü">Tüm Kategoriler</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            data-testid="grid-view-button"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            data-testid="list-view-button"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-product-button">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Ürün Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Ürün Düzenle" : "Yeni Ürün Ekle"}</DialogTitle>
              <p className="text-sm text-gray-500">{editingProduct ? "Ürün bilgilerini güncelleyin" : "Yeni bir ürün eklemek için formu doldurun"}</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Ürün Kodu *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    data-testid="product-code-input"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Ürün Adı *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="product-name-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
                    <SelectTrigger data-testid="product-category-select">
                      <SelectValue placeholder="Kategori seçin">
                        {formData.category || "Kategori seçin"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.category && (
                    <p className="text-xs text-gray-500 mt-1">Seçili: {formData.category}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="unit">Birim *</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger data-testid="product-unit-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit_price">Birim Fiyat *</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
                    required
                    data-testid="product-price-input"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Para Birimi *</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger data-testid="product-currency-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="TL">TL (₺)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 text-gray-700">Paket İçeriği (Opsiyonel)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="package_kg">Paket KG</Label>
                    <Input
                      id="package_kg"
                      type="number"
                      step="0.01"
                      value={formData.package_kg || ""}
                      onChange={(e) => setFormData({ ...formData, package_kg: e.target.value ? parseFloat(e.target.value) : null })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="package_m2">Paket m²</Label>
                    <Input
                      id="package_m2"
                      type="number"
                      step="0.01"
                      value={formData.package_m2 || ""}
                      onChange={(e) => setFormData({ ...formData, package_m2: e.target.value ? parseFloat(e.target.value) : null })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="package_length">Paket Metre Uzunluğu</Label>
                    <Input
                      id="package_length"
                      type="number"
                      step="0.01"
                      value={formData.package_length || ""}
                      onChange={(e) => setFormData({ ...formData, package_length: e.target.value ? parseFloat(e.target.value) : null })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="package_count">Paket İçindeki Adet</Label>
                    <Input
                      id="package_count"
                      type="number"
                      value={formData.package_count || ""}
                      onChange={(e) => setFormData({ ...formData, package_count: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Ürün Açıklaması</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image">Ürün Görseli</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {formData.image && (
                  <div className="mt-2">
                    <img src={formData.image} alt="Preview" className="h-24 w-24 object-cover rounded" />
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>İptal</Button>
                <Button type="submit" data-testid="save-product-button" disabled={loading}>
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow" data-testid="product-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{product.name}</CardTitle>
                    <p className="text-sm text-gray-500">Kod: {product.code}</p>
                  </div>
                  {product.image && (
                    <img src={product.image} alt={product.name} className="h-16 w-16 object-cover rounded ml-2" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline">{product.category}</Badge>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Birim:</span>
                    <span className="font-medium">{product.unit}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Fiyat:</span>
                    <span className="font-bold text-blue-600">{product.unit_price.toFixed(2)} {product.currency || 'EUR'}</span>
                  </div>
                  {product.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mt-2">{product.description}</p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => openEditDialog(product)}
                      data-testid="edit-product-button"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Düzenle
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(product.id)}
                      data-testid="delete-product-button"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16"></TableHead>
                <TableHead>Ürün Adı</TableHead>
                <TableHead>Ürün Kodu</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Birim</TableHead>
                <TableHead>Birim Fiyat</TableHead>
                <TableHead>Para Birimi</TableHead>
                <TableHead className="w-32">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map(product => (
                <TableRow key={product.id} data-testid="product-row">
                  <TableCell>
                    {product.image && (
                      <img src={product.image} alt={product.name} className="h-12 w-12 object-cover rounded" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.code}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell className="font-bold text-blue-600">{product.unit_price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.currency || 'EUR'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(product)}
                        data-testid="edit-product-button"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(product.id)}
                        data-testid="delete-product-button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün bulunamadı</h3>
          <p className="text-gray-500 mb-6">Arama kriterlerinize uygun ürün yok veya henüz ürün eklenmemiş.</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            İlk Ürünü Ekle
          </Button>
        </div>
      )}
    </div>
  );
}