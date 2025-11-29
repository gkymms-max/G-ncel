import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, ShoppingCart } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function RequestQuote() {
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const addItem = () => {
    setSelectedItems([...selectedItems, {
      id: Date.now(),
      product_id: '',
      quantity: 1,
      note: ''
    }]);
  };

  const updateItem = (id, field, value) => {
    setSelectedItems(selectedItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      toast.error("Lütfen en az bir ürün seçin");
      return;
    }

    if (!customerInfo.name || !customerInfo.email) {
      toast.error("Lütfen gerekli alanları doldurun");
      return;
    }

    setLoading(true);

    try {
      // Here you could send the quote request to admin
      // For now, just show success message
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      toast.success("Teklif talebiniz başarıyla gönderildi! En kısa sürede size dönüş yapacağız.");
      
      // Reset form
      setSelectedItems([]);
      setCustomerInfo({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: ''
      });
    } catch (error) {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.name} (${product.code})` : '';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Space Grotesk' }}>
          Teklif İste
        </h1>
        <p className="text-gray-600">İhtiyacınız olan ürünler için hızlıca teklif alın</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">1</span>
              </div>
              İletişim Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Ad Soyad *</Label>
              <Input
                id="name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">E-posta *</Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="company">Firma Adı</Label>
              <Input
                id="company"
                value={customerInfo.company}
                onChange={(e) => setCustomerInfo({...customerInfo, company: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                Ürün Seçimi
              </CardTitle>
              <Button type="button" onClick={addItem} variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ürün Ekle
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Henüz ürün seçilmedi</p>
                <p className="text-sm">"Ürün Ekle" butonuna tıklayarak başlayın</p>
              </div>
            ) : (
              selectedItems.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg">
                  <div className="md:col-span-5">
                    <Label>Ürün *</Label>
                    <Select value={item.product_id} onValueChange={(value) => updateItem(item.id, 'product_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ürün seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.code}) - {product.unit_price} {product.currency}/{product.unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Miktar *</Label>
                    <Input
                      type="number"
                      min="1"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Label>Not</Label>
                    <Input
                      value={item.note}
                      onChange={(e) => updateItem(item.id, 'note', e.target.value)}
                      placeholder="Özel gereksinimler, boyut vs."
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                      ✕
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Additional Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold">3</span>
              </div>
              Ek Mesaj
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={customerInfo.message}
              onChange={(e) => setCustomerInfo({...customerInfo, message: e.target.value})}
              placeholder="Projeniz hakkında detaylar, özel gereksinimler veya sorularınız..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={loading}>
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Gönderiliyor...' : 'Teklif Gönder'}
          </Button>
        </div>
      </form>
    </div>
  );
}