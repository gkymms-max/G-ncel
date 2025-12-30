import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Eye, Trash2, Receipt, ShoppingCart, CheckCircle2, Clock, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import EmptyState from "@/components/common/EmptyState";
import StatusBadge from "@/components/common/StatusBadge";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const paymentStatusConfig = {
  unpaid: { label: "Ödenmedi", color: "bg-red-100 text-red-800", icon: XCircle },
  partial: { label: "Kısmi Ödendi", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  paid: { label: "Ödendi", color: "bg-green-100 text-green-800", icon: CheckCircle2 }
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sales");

  useEffect(() => {
    fetchInvoices();
  }, [activeTab]);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/invoices?invoice_type=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Faturalar yüklenemedi:", error);
      toast.error("Faturalar yüklenemedi");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu faturayı silmek istediğinizden emin misiniz? Cari hesap ve stok hareketleri geri alınacak.")) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Fatura silindi");
      fetchInvoices();
    } catch (error) {
      console.error("Fatura silinemedi:", error);
      toast.error("Fatura silinemedi");
    }
  };

  const PaymentStatusBadge = ({ status }) => {
    const config = paymentStatusConfig[status] || paymentStatusConfig.unpaid;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1 px-2 py-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
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

  const salesInvoices = invoices.filter(inv => inv.invoice_type === "sales");
  const purchaseInvoices = invoices.filter(inv => inv.invoice_type === "purchase");
  
  const totalSales = salesInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPurchases = purchaseInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const unpaidSales = salesInvoices.filter(inv => inv.payment_status === "unpaid").reduce((sum, inv) => sum + inv.remaining_amount, 0);
  const unpaidPurchases = purchaseInvoices.filter(inv => inv.payment_status === "unpaid").reduce((sum, inv) => sum + inv.remaining_amount, 0);

  const InvoiceList = ({ invoices, type }) => {
    if (invoices.length === 0) {
      return (
        <EmptyState
          icon={type === "sales" ? Receipt : ShoppingCart}
          title={`Henüz ${type === "sales" ? "satış" : "alış"} faturası yok`}
          description={`İlk ${type === "sales" ? "satış" : "alış"} faturanızı oluşturun`}
          actionLabel="Yeni Fatura Oluştur"
          onAction={() => toast.info("Fatura oluşturma formu yakında eklenecek")}
        />
      );
    }

    return (
      <div className="space-y-4">
        {invoices.map((invoice, index) => (
          <motion.div
            key={invoice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{invoice.invoice_number}</h3>
                      <StatusBadge status={invoice.status} />
                      <PaymentStatusBadge status={invoice.payment_status} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">
                          {type === "sales" ? "Müşteri" : "Tedarikçi"}:
                        </span>
                        <p className="font-medium">{invoice.party_name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tarih:</span>
                        <p className="font-medium">
                          {new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Vade:</span>
                        <p className="font-medium">
                          {new Date(invoice.due_date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Ürün Sayısı:</span>
                        <p className="font-medium">{invoice.items.length} adet</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Toplam Tutar</p>
                          <p className="text-2xl font-bold text-indigo-600">
                            {invoice.total.toFixed(2)} {invoice.currency}
                          </p>
                        </div>
                        {invoice.payment_status !== "paid" && (
                          <div>
                            <p className="text-sm text-gray-600">Kalan Tutar</p>
                            <p className="text-xl font-semibold text-red-600">
                              {invoice.remaining_amount.toFixed(2)} {invoice.currency}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      Görüntüle
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(invoice.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Faturalar
          </h1>
          <p className="text-gray-600">Alış ve satış faturalarınız</p>
        </div>
        <Button onClick={() => toast.info("Fatura oluşturma formu yakında eklenecek")}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Fatura
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <p className="text-sm opacity-90">Toplam Satış</p>
            <h3 className="text-2xl font-bold mt-1">{totalSales.toFixed(2)} TL</h3>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
          <CardContent className="p-4">
            <p className="text-sm opacity-90">Toplam Alış</p>
            <h3 className="text-2xl font-bold mt-1">{totalPurchases.toFixed(2)} TL</h3>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white">
          <CardContent className="p-4">
            <p className="text-sm opacity-90">Tahsil Edilecek</p>
            <h3 className="text-2xl font-bold mt-1">{unpaidSales.toFixed(2)} TL</h3>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
          <CardContent className="p-4">
            <p className="text-sm opacity-90">Ödenecek</p>
            <h3 className="text-2xl font-bold mt-1">{unpaidPurchases.toFixed(2)} TL</h3>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Satış Faturaları
          </TabsTrigger>
          <TabsTrigger value="purchase" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Alış Faturaları
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-6">
          <InvoiceList invoices={salesInvoices} type="sales" />
        </TabsContent>

        <TabsContent value="purchase" className="mt-6">
          <InvoiceList invoices={purchaseInvoices} type="purchase" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
