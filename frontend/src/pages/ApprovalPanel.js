import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Eye, Clock } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { motion } from "framer-motion";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ApprovalPanel() {
  const [pendingQuotes, setPendingQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchPendingQuotes();
  }, []);

  const fetchPendingQuotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/quotes/pending/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingQuotes(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Bekleyen teklifler yüklenemedi:", error);
      toast.error("Bekleyen teklifler yüklenemedi");
      setLoading(false);
    }
  };

  const handleApprove = async (quoteId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API}/quotes/${quoteId}/status?status=approved`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Teklif onaylandı");
      fetchPendingQuotes();
    } catch (error) {
      console.error("Onaylama hatası:", error);
      toast.error("Teklif onaylanamadı");
    }
  };

  const handleReject = async () => {
    if (!selectedQuote) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API}/quotes/${selectedQuote}/status?status=rejected&rejection_reason=${encodeURIComponent(rejectionReason)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Teklif reddedildi");
      setRejectionDialogOpen(false);
      setRejectionReason("");
      setSelectedQuote(null);
      fetchPendingQuotes();
    } catch (error) {
      console.error("Reddetme hatası:", error);
      toast.error("Teklif reddedilemedi");
    }
  };

  const viewPDF = async (quoteId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/quotes/${quoteId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (error) {
      console.error("PDF açılamadı:", error);
      toast.error("PDF açılamadı");
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
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Space Grotesk' }}>
          Teklif Onay Paneli
        </h1>
        <p className="text-gray-600">Bekleyen teklifleri onaylayın veya reddedin</p>
      </motion.div>

      {pendingQuotes.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Clock className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Bekleyen teklif bulunmamaktadır</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingQuotes.map((quote, index) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        <span>{quote.quote_number}</span>
                        <StatusBadge status={quote.status} />
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Müşteri: <span className="font-medium text-gray-700">{quote.customer_name}</span>
                        {quote.customer_company && ` - ${quote.customer_company}`}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">
                        {quote.total.toFixed(2)} {quote.currency}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(quote.quote_date).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>E-posta:</strong> {quote.customer_email}</p>
                      {quote.customer_phone && <p><strong>Telefon:</strong> {quote.customer_phone}</p>}
                      <p><strong>Ürün Sayısı:</strong> {quote.items.length} adet</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewPDF(quote.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        PDF Görüntüle
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(quote.id)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Onayla
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedQuote(quote.id);
                          setRejectionDialogOpen(true);
                        }}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reddet
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teklifi Reddet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection_reason">Reddetme Nedeni</Label>
              <Textarea
                id="rejection_reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Teklifi neden reddediyorsunuz?"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reddet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
