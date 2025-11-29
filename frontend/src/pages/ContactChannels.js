import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, MessageCircle, Instagram, Facebook, Linkedin, Twitter, Globe, Mail, Phone } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const channelTypes = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "twitter", label: "Twitter", icon: Twitter },
  { value: "website", label: "Web Sitesi", icon: Globe },
  { value: "email", label: "E-posta", icon: Mail },
  { value: "phone", label: "Telefon", icon: Phone }
];

export default function ContactChannels() {
  const [channels, setChannels] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "whatsapp",
    title: "",
    value: ""
  });

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/contact-channels`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChannels(response.data);
    } catch (error) {
      toast.error("İletişim kanalları yüklenemedi");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.post(`${API}/contact-channels`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("İletişim kanalı eklendi");
      setDialogOpen(false);
      resetForm();
      fetchChannels();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Bir hata oluştu");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu iletişim kanalını silmek istediğinize emin misiniz?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/contact-channels/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("İletişim kanalı silindi");
      fetchChannels();
    } catch (error) {
      toast.error("İletişim kanalı silinemedi");
    }
  };

  const resetForm = () => {
    setFormData({ type: "whatsapp", title: "", value: "" });
  };

  const getChannelIcon = (type) => {
    const channelType = channelTypes.find(ct => ct.value === type);
    const Icon = channelType ? channelType.icon : MessageCircle;
    return <Icon className="h-5 w-5" />;
  };

  const getChannelLabel = (type) => {
    const channelType = channelTypes.find(ct => ct.value === type);
    return channelType ? channelType.label : type;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Space Grotesk' }}>İletişim Kanalları</h1>
        <p className="text-gray-600">WhatsApp, sosyal medya ve web sitesi bağlantılarını yönetin</p>
      </div>

      <div className="flex justify-end mb-6">
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-channel-button">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kanal Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni İletişim Kanalı</DialogTitle>
              <p className="text-sm text-gray-500">WhatsApp, sosyal medya veya web bağlantısı ekleyin</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">Kanal Tipi *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {channelTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ör: Satış Destek, Müşteri Hizmetleri"
                  required
                />
              </div>
              <div>
                <Label htmlFor="value">Değer (Numara/URL) *</Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={formData.type === "whatsapp" ? "905551234567" : formData.type === "email" ? "info@firma.com" : "https://..."}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
                <Button type="submit">Kaydet</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map(channel => (
          <Card key={channel.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getChannelIcon(channel.type)}
                  <div>
                    <CardTitle className="text-lg">{channel.title}</CardTitle>
                    <p className="text-sm text-gray-500">{getChannelLabel(channel.type)}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm font-mono bg-gray-100 p-2 rounded text-gray-700 break-all">
                  {channel.value}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(channel.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Sil
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {channels.length === 0 && (
        <div className="text-center py-16">
          <MessageCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz kanal eklenmemiş</h3>
          <p className="text-gray-500 mb-6">WhatsApp, sosyal medya veya web bağlantısı ekleyerek başlayın.</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            İlk Kanalı Ekle
          </Button>
        </div>
      )}
    </div>
  );
}