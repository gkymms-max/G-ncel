import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Wallet, Building } from "lucide-react";
import { motion } from "framer-motion";
import EmptyState from "@/components/common/EmptyState";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    account_type: "cash",
    name: "",
    bank_name: "",
    account_number: "",
    iban: "",
    currency: "TRY",
    balance: 0
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Hesaplar yüklenemedi:", error);
      toast.error("Hesaplar yüklenemedi");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingAccount) {
        await axios.put(
          `${API}/accounts/${editingAccount.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Hesap güncellendi");
      } else {
        await axios.post(
          `${API}/accounts`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Hesap eklendi");
      }
      
      setDialogOpen(false);
      resetForm();
      fetchAccounts();
    } catch (error) {
      console.error("Hesap kaydedilemedi:", error);
      toast.error("Hesap kaydedilemedi");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu hesabı silmek istediğinizden emin misiniz?")) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Hesap silindi");
      fetchAccounts();
    } catch (error) {
      console.error("Hesap silinemedi:", error);
      toast.error("Hesap silinemedi");
    }
  };

  const openDialog = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        account_type: account.account_type,
        name: account.name,
        bank_name: account.bank_name || "",
        account_number: account.account_number || "",
        iban: account.iban || "",
        currency: account.currency,
        balance: account.balance
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingAccount(null);
    setFormData({
      account_type: "cash",
      name: "",
      bank_name: "",
      account_number: "",
      iban: "",
      currency: "TRY",
      balance: 0
    });
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Kasa & Banka
          </h1>
          <p className="text-gray-600">Kasa ve banka hesaplarınız</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Hesap
        </Button>
      </motion.div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Toplam Bakiye</p>
              <h2 className="text-4xl font-bold mt-2">{totalBalance.toFixed(2)} TL</h2>
            </div>
            <Wallet className="h-16 w-16 opacity-20" />
          </div>
        </CardContent>
      </Card>

      {accounts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Henüz hesap yok"
          description="İlk kasa veya banka hesabınızı ekleyerek başlayın"
          actionLabel="Yeni Hesap Ekle"
          onAction={() => openDialog()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {account.account_type === "cash" ? (
                        <Wallet className="h-5 w-5 text-green-600" />
                      ) : (
                        <Building className="h-5 w-5 text-blue-600" />
                      )}
                      <span className="text-lg">{account.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openDialog(account)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(account.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-gray-600">
                    {account.account_type === "cash" ? "Kasa" : "Banka Hesabı"}
                  </div>
                  {account.bank_name && (
                    <div className="text-sm">
                      <span className="font-medium">Banka:</span> {account.bank_name}
                    </div>
                  )}
                  {account.iban && (
                    <div className="text-sm">
                      <span className="font-medium">IBAN:</span> {account.iban}
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-2xl font-bold text-green-600">
                      {account.balance.toFixed(2)} {account.currency}
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
            <DialogTitle>{editingAccount ? "Hesap Düzenle" : "Yeni Hesap"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account_type">Hesap Tipi *</Label>
                <Select
                  value={formData.account_type}
                  onValueChange={(value) => setFormData({...formData, account_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Kasa</SelectItem>
                    <SelectItem value="bank">Banka</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Hesap Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              {formData.account_type === "bank" && (
                <>
                  <div>
                    <Label htmlFor="bank_name">Banka Adı</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="account_number">Hesap No</Label>
                    <Input
                      id="account_number"
                      value={formData.account_number}
                      onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="iban">IBAN</Label>
                    <Input
                      id="iban"
                      value={formData.iban}
                      onChange={(e) => setFormData({...formData, iban: e.target.value})}
                    />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="currency">Para Birimi</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({...formData, currency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRY">TRY</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="balance">Başlangıç Bakiyesi</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({...formData, balance: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                İptal
              </Button>
              <Button type="submit">
                {editingAccount ? "Güncelle" : "Ekle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
