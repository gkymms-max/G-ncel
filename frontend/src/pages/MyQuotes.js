import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MyQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/quotes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuotes(response.data);
    } catch (error) {
      console.error("Teklifler yüklenemedi:", error);
    } finally {
      setLoading(false);
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
      link.setAttribute('download', `Teklif_${quoteId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("PDF indirildi");
    } catch (error) {
      toast.error("PDF indirilemedi");
    }
  };

  const handleDelete = async (quoteId) => {
    if (!window.confirm("Bu teklifi silmek istediğinize emin misiniz?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/quotes/${quoteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Teklif silindi");
      fetchQuotes();
    } catch (error) {
      toast.error("Teklif silinemedi");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Space Grotesk' }}>
          Tekliflerim
        </h1>
        <p className="text-gray-600">Oluşturduğunuz teklifleri görüntüleyin ve indirin</p>
      </div>

      {quotes.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz teklif oluşturulmamış</h3>
          <p className="text-gray-500">Yeni bir teklif oluşturmak için "Teklif İste" sayfasını kullanabilirsiniz.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotes.map(quote => (
            <Card key={quote.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">#{quote.quote_number}</Badge>
                  <Badge variant={quote.status === 'approved' ? 'success' : 'outline'}>
                    {quote.status === 'approved' ? 'Onaylı' : 'Beklemede'}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{quote.customer_name}</CardTitle>
                <p className="text-sm text-gray-500">{quote.customer_company || 'Firma belirtilmemiş'}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Tarih:</span>
                    <p className="font-medium">{new Date(quote.quote_date).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Geçerlilik:</span>
                    <p className="font-medium">{new Date(quote.valid_until).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600">Toplam</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {quote.total?.toFixed(2) || '0.00'} {quote.currency}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownloadPDF(quote.id)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(quote.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
