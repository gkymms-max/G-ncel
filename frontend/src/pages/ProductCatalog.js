import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, LayoutGrid, List } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('catalogViewMode') || 'grid';
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

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
      console.error("Ürünler yüklenemedi:", error);
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
      console.error("Kategoriler yüklenemedi:", error);
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Space Grotesk' }}>
          Ürün Kataloğu
        </h1>
        <p className="text-gray-600">Tüm ürünlerimizi inceleyin ve fiyatları görüntüleyin</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Ürün adı veya kodu ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
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
            onClick={() => {
              setViewMode("grid");
              localStorage.setItem('catalogViewMode', 'grid');
            }}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => {
              setViewMode("list");
              localStorage.setItem('catalogViewMode', 'list');
            }}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Products */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span>Görsel Yok</span>
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <p className="text-sm text-gray-500">Kod: {product.code}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant="outline">{product.category}</Badge>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Birim:</span>
                    <span className="font-medium">{product.unit}</span>
                  </div>
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <span className="text-2xl font-bold text-indigo-600">
                      {product.unit_price.toFixed(2)} {product.currency || 'EUR'}
                    </span>
                    <p className="text-sm text-gray-600">/ {product.unit}</p>
                  </div>
                  {product.description && (
                    <p className="text-xs text-gray-500 line-clamp-3">{product.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="grid grid-cols-6 gap-4 p-4 font-semibold text-gray-600 bg-gray-50 border-b text-sm">
            <div>Ürün</div>
            <div>Kategori</div>
            <div>Birim</div>
            <div>Fiyat</div>
            <div>Para Birimi</div>
            <div>Açıklama</div>
          </div>
          {filteredProducts.map(product => (
            <div key={product.id} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 items-center">
              <div className="flex items-center gap-3">
                {product.image && (
                  <img src={product.image} alt={product.name} className="h-12 w-12 object-cover rounded" />
                )}
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.code}</div>
                </div>
              </div>
              <div>
                <Badge variant="outline" className="text-xs">{product.category}</Badge>
              </div>
              <div className="text-sm">{product.unit}</div>
              <div className="text-lg font-bold text-indigo-600">{product.unit_price.toFixed(2)}</div>
              <div>
                <Badge variant="secondary" className="text-xs">{product.currency || 'EUR'}</Badge>
              </div>
              <div className="text-sm text-gray-600 line-clamp-2">{product.description || '-'}</div>
            </div>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün bulunamadı</h3>
          <p className="text-gray-500">Arama kriterlerinizi değiştirmeyi deneyin.</p>
        </div>
      )}
    </div>
  );
}