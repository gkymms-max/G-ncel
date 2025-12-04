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
import { Plus, FileText, Download, Trash2, Calendar, Eye } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const currencies = ["EUR", "USD", "TL"];

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewQuoteId, setPreviewQuoteId] = useState(null);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    quote_date: new Date().toISOString().split('T')[0],
    validity_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customer_id: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    currency: "TL",
    items: [],
    discount_type: "percentage",
    discount_value: 0,
    vat_rate: 18,
    vat_included: false,
    notes: ""
  });
  const [quoteDate, setQuoteDate] = useState(new Date());
  const [validityDate, setValidityDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [newItem, setNewItem] = useState({
    product_id: "",
    quantity: 0,
    unit_price: 0,
    note: "",
    use_package: false
  });

  useEffect(() => {
    fetchQuotes();
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchQuotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/quotes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuotes(response.data);
    } catch (error) {
      toast.error("Teklifler yüklenemedi");
    }
  };

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

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data);
    } catch (error) {
      console.error("Müşteriler yüklenemedi");
    }
  };

  const addItemToQuote = () => {
    if (!newItem.product_id) {
      toast.error("Lütfen bir ürün seçin");
      return;
    }

    const product = products.find(p => p.id === newItem.product_id);
    const unitPrice = newItem.unit_price || product.unit_price;
    
    let calculatedQuantity = newItem.quantity;
    let displayText = "";
    
    // Paket bazlı hesaplama
    if (newItem.use_package) {
      if (product.unit === "KG" && product.package_kg) {
        calculatedQuantity = newItem.quantity * product.package_kg;
        displayText = `${newItem.quantity} paket (${calculatedQuantity} KG)`;
      } else if (product.unit === "m²" && product.package_m2) {
        calculatedQuantity = newItem.quantity * product.package_m2;
        displayText = `${newItem.quantity} paket (${calculatedQuantity} m²)`;
      } else if (product.unit === "Metre" && product.package_length) {
        calculatedQuantity = newItem.quantity * product.package_length;
        displayText = `${newItem.quantity} paket (${calculatedQuantity} Metre)`;
      } else if (product.unit === "Adet" && product.package_count) {
        calculatedQuantity = newItem.quantity * product.package_count;
        displayText = `${newItem.quantity} paket (${calculatedQuantity} Adet)`;
      } else {
        toast.error("Bu ürün için paket bilgisi tanımlanmamış");
        return;
      }
    } else {
      displayText = `${calculatedQuantity} ${product.unit}`;
    }
    
    const subtotal = calculatedQuantity * unitPrice;

    const item = {
      product_id: product.id,
      product_name: product.name,
      product_code: product.code,
      product_image: product.image,
      unit: product.unit,
      quantity: calculatedQuantity,
      display_text: displayText,
      unit_price: unitPrice,
      subtotal: subtotal,
      note: newItem.note
    };

    setFormData({ ...formData, items: [...formData.items, item] });
    setNewItem({ product_id: "", quantity: 0, unit_price: 0, note: "", use_package: false });
  };

  const removeItem = (index) => {
    const items = [...formData.items];
    items.splice(index, 1);
    setFormData({ ...formData, items });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
    let discountAmount = 0;
    if (formData.discount_type === "percentage") {
      discountAmount = subtotal * (formData.discount_value / 100);
    } else {
      discountAmount = formData.discount_value;
    }
    const afterDiscount = subtotal - discountAmount;
    const vatAmount = formData.vat_included ? afterDiscount * (formData.vat_rate / 100) : 0;
    const total = afterDiscount + vatAmount;

    return { subtotal, discountAmount, vatAmount, total };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      toast.error("Teklif için en az bir ürün ekleyin");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...formData,
        quote_date: format(quoteDate, 'yyyy-MM-dd') + 'T00:00:00Z',
        validity_date: format(validityDate, 'yyyy-MM-dd') + 'T00:00:00Z'
      };
      
      await axios.post(`${API}/quotes`, submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Teklif oluşturuldu");
      setDialogOpen(false);
      resetForm();
      fetchQuotes();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Bir hata oluştu");
    }
  };

  const handleDownloadPDF = async (quoteId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/quotes/${quoteId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `teklif_${quoteId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF indirildi");
    } catch (error) {
      toast.error("PDF indirilemedi");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu teklifi silmek istediğinize emin misiniz?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/quotes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Teklif silindi");
      fetchQuotes();
    } catch (error) {
      toast.error("Teklif silinemedi");
    }
  };

  const handlePreview = (quoteId) => {
    setPreviewQuoteId(quoteId);
    setPreviewDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      quote_date: new Date().toISOString().split('T')[0],
      validity_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customer_id: "",
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      currency: "TL",
      items: [],
      discount_type: "percentage",
      discount_value: 0,
      vat_rate: 18,
      vat_included: false,
      notes: ""
    });
    setQuoteDate(new Date());
    setValidityDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    setNewItem({ product_id: "", quantity: 0, unit_price: 0, note: "", use_package: false });
    setProductSearchTerm("");
  };

  const updateItemQuantity = (index, quantity) => {
    const items = [...formData.items];
    items[index].quantity = quantity;
    items[index].subtotal = quantity * items[index].unit_price;
    setFormData({ ...formData, items });
  };

  const updateItemPrice = (index, price) => {
    const items = [...formData.items];
    items[index].unit_price = price;
    items[index].subtotal = items[index].quantity * price;
    setFormData({ ...formData, items });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Space Grotesk' }}>Teklif Yönetimi</h1>
        <p className="text-gray-600">Fiyat tekliflerinizi oluşturun ve yönetin</p>
      </div>

      <div className="flex justify-end mb-6">
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="create-quote-button">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Teklif Oluştur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Fiyat Teklifi</DialogTitle>
              <p className="text-sm text-gray-500">Müşteriniz için yeni bir fiyat teklifi oluşturun</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Info */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3 text-gray-700">Müşteri Bilgileri</h3>
                <div className="mb-4">
                  <Label htmlFor="customer_select">Kayıtlı Müşteri Seç (Opsiyonel)</Label>
                  <Select 
                    value={formData.customer_id} 
                    onValueChange={(value) => {
                      const selectedCustomer = customers.find(c => c.id === value);
                      if (selectedCustomer) {
                        setFormData({
                          ...formData,
                          customer_id: value,
                          customer_name: selectedCustomer.name,
                          customer_email: selectedCustomer.email || "",
                          customer_phone: selectedCustomer.phone || ""
                        });
                      } else {
                        setFormData({
                          ...formData,
                          customer_id: "",
                          customer_name: "",
                          customer_email: "",
                          customer_phone: ""
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Müşteri seçin veya manuel girin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Manuel Gir</SelectItem>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} {customer.company ? `(${customer.company})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_name">Müşteri Adı / Firma *</Label>
                    <Input
                      id="customer_name"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      required
                      data-testid="customer-name-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_email">E-posta *</Label>
                    <Input
                      id="customer_email"
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      required
                      data-testid="customer-email-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_phone">Telefon</Label>
                    <Input
                      id="customer_phone"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Para Birimi *</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                      <SelectTrigger data-testid="currency-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(curr => (
                          <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Quote Dates */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3 text-gray-700">Teklif Tarihleri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Teklif Tarihi *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left" type="button" data-testid="quote-date-picker">
                          <Calendar className="mr-2 h-4 w-4" />
                          {format(quoteDate, 'dd MMMM yyyy', { locale: tr })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={quoteDate}
                          onSelect={(date) => setQuoteDate(date || new Date())}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Geçerlilik Tarihi *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left" type="button" data-testid="validity-date-picker">
                          <Calendar className="mr-2 h-4 w-4" />
                          {format(validityDate, 'dd MMMM yyyy', { locale: tr })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={validityDate}
                          onSelect={(date) => setValidityDate(date || new Date())}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Add Items */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3 text-gray-700">Ürün Ekle</h3>
                <div className="space-y-3">
                  <div className="mb-3">
                    <Label htmlFor="product_search">Ürün Ara</Label>
                    <Input
                      id="product_search"
                      placeholder="Ürün adı veya kodu ile ara..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-2">
                      <Label htmlFor="product">Ürün</Label>
                      <Select value={newItem.product_id} onValueChange={(value) => {
                        const product = products.find(p => p.id === value);
                        setNewItem({ ...newItem, product_id: value, unit_price: product?.unit_price || 0 });
                      }}>
                        <SelectTrigger data-testid="product-select">
                          <SelectValue placeholder="Ürün seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {products
                            .filter(p => 
                              productSearchTerm === "" || 
                              p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                              p.code.toLowerCase().includes(productSearchTerm.toLowerCase())
                            )
                            .map(product => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} ({product.code})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="quantity">{newItem.use_package ? "Paket Adedi" : "Miktar"}</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.01"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                        data-testid="item-quantity-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="item_price">Birim Fiyat</Label>
                      <Input
                        id="item_price"
                        type="number"
                        step="0.01"
                        value={newItem.unit_price}
                        onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })}
                        data-testid="item-price-input"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="button" onClick={addItemToQuote} className="w-full" data-testid="add-item-button">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="use_package"
                      checked={newItem.use_package}
                      onChange={(e) => setNewItem({ ...newItem, use_package: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                      data-testid="use-package-checkbox"
                    />
                    <Label htmlFor="use_package" className="text-sm font-normal cursor-pointer">
                      Paket bazlı hesapla (ürünün paket bilgisini kullan)
                    </Label>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              {formData.items.length > 0 && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ürün</TableHead>
                        <TableHead>Birim</TableHead>
                        <TableHead>Miktar</TableHead>
                        <TableHead>Birim Fiyat</TableHead>
                        <TableHead>Toplam</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.items.map((item, index) => (
                        <TableRow key={index} data-testid="quote-item-row">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {item.product_image && (
                                <img src={item.product_image} alt={item.product_name} className="h-8 w-8 object-cover rounded" />
                              )}
                              <div>
                                <div className="font-medium">{item.product_name}</div>
                                <div className="text-xs text-gray-500">{item.product_code}</div>
                                {item.display_text && (
                                  <div className="text-xs text-blue-600 mt-0.5">{item.display_text}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>
                            <div className="text-sm">{item.quantity}</div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>{item.subtotal.toFixed(2)} {formData.currency}</TableCell>
                          <TableCell>
                            <Button type="button" size="sm" variant="ghost" onClick={() => removeItem(index)} data-testid="remove-item-button">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="discount_type">İndirim Tipi</Label>
                    <Select value={formData.discount_type} onValueChange={(value) => setFormData({ ...formData, discount_type: value })}>
                      <SelectTrigger data-testid="discount-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Yüzde (%)</SelectItem>
                        <SelectItem value="amount">Tutar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="discount_value">İndirim Değeri</Label>
                    <Input
                      id="discount_value"
                      type="number"
                      step="0.01"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                      data-testid="discount-value-input"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <Label className="mb-2 block">KDV Durumu</Label>
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="vat_excluded"
                        name="vat_type"
                        checked={!formData.vat_included}
                        onChange={() => setFormData({ ...formData, vat_included: false })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="vat_excluded" className="text-sm font-normal cursor-pointer">
                        KDV Hariç (+ olarak ekle)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="vat_included"
                        name="vat_type"
                        checked={formData.vat_included}
                        onChange={() => setFormData({ ...formData, vat_included: true })}
                        className="h-4 w-4"
                        data-testid="include-vat-checkbox"
                      />
                      <Label htmlFor="vat_included" className="text-sm font-normal cursor-pointer">
                        KDV Dahil
                      </Label>
                    </div>
                  </div>
                </div>
                
                {formData.vat_included && (
                  <div className="mb-4">
                    <Label htmlFor="vat_rate">KDV Oranı (%)</Label>
                    <Input
                      id="vat_rate"
                      type="number"
                      step="0.01"
                      value={formData.vat_rate}
                      onChange={(e) => setFormData({ ...formData, vat_rate: parseFloat(e.target.value) || 0 })}
                      data-testid="vat-rate-input"
                      className="w-32"
                    />
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ara Toplam:</span>
                    <span className="font-medium">{totals.subtotal.toFixed(2)} {formData.currency}</span>
                  </div>
                  {formData.discount_value > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">İndirim:</span>
                      <span className="font-medium text-red-600">-{totals.discountAmount.toFixed(2)} {formData.currency}</span>
                    </div>
                  )}
                  {formData.vat_included && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">KDV ({formData.vat_rate}%):</span>
                      <span className="font-medium">{totals.vatAmount.toFixed(2)} {formData.currency}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Genel Toplam:</span>
                    <span className="text-blue-600" data-testid="quote-total">{totals.total.toFixed(2)} {formData.currency}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Teklif ile ilgili ek notlar..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
                <Button type="submit" data-testid="save-quote-button">Teklifi Kaydet</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quotes List */}
      <div className="grid grid-cols-1 gap-6">
        {quotes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz teklif yok</h3>
            <p className="text-gray-500 mb-6">Yeni bir teklif oluşturarak başlayın.</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              İlk Teklifi Oluştur
            </Button>
          </div>
        ) : (
          quotes.map(quote => (
            <Card key={quote.id} data-testid="quote-card">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">Teklif No: {quote.quote_number}</CardTitle>
                    <div className="flex gap-4 text-sm text-gray-500 mt-2">
                      <span>Müşteri: {quote.customer_name}</span>
                      <span>Tarih: {format(new Date(quote.quote_date), 'dd.MM.yyyy')}</span>
                      <span>Geçerlilik: {format(new Date(quote.validity_date), 'dd.MM.yyyy')}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-1">
                    {quote.total.toFixed(2)} {quote.currency}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePreview(quote.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Önizle
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDownloadPDF(quote.id)}
                    data-testid="download-pdf-button"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF İndir
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(quote.id)}
                    data-testid="delete-quote-button"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Sil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* PDF Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Teklif Önizleme</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {previewQuoteId && (
              <iframe
                src={`${API}/quotes/${previewQuoteId}/pdf`}
                className="w-full h-full border-0"
                title="PDF Önizleme"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}