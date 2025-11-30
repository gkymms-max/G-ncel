import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2, MessageCircle, Instagram, Facebook, Globe } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const channelTypes = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle, defaultUrl: "https://web.whatsapp.com" },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "tiktok", label: "TikTok", icon: Globe },
  { value: "website", label: "Web Sayfası", icon: Globe }
];

export default function ContactChannels() {
  const [channels, setChannels] = useState([]);
  const [activeTab, setActiveTab] = useState("list");
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
      resetForm();
      fetchChannels();
      setActiveTab("list");
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

  const getPlaceholder = (type) => {
    switch(type) {
      case "whatsapp":
        return "WhatsApp açılacak (web.whatsapp.com)";
      case "instagram":
        return "Instagram profil URL'i: https://instagram.com/kullaniciadi";
      case "facebook":
        return "Facebook sayfa URL'i: https://facebook.com/sayfaadi";
      case "tiktok":
        return "TikTok profil URL'i: https://tiktok.com/@kullaniciadi";
      case "website":
        return "Web sayfası URL'i: https://ornek.com";
      default:
        return "URL girin";
    }
  };

  const handleAddChannel = (type) => {
    setFormData({ type, title: "", value: type === "whatsapp" ? "https://web.whatsapp.com" : "" });
    setActiveTab(type);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Space Grotesk' }}>İletişim Kanalları</h1>
        <p className="text-gray-600">WhatsApp, sosyal medya ve web sitesi bağlantılarını yönetin</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="list">Tüm Kanallar</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="facebook">Facebook</TabsTrigger>
          <TabsTrigger value="tiktok">TikTok</TabsTrigger>
          <TabsTrigger value="website">Web Sayfası</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <div className="mb-6 flex gap-2">
            {channelTypes.map(type => (
              <Button key={type.value} onClick={() => handleAddChannel(type.value)} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                {type.label} Ekle
              </Button>
            ))}
          </div>

          {channels.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz kanal eklenmemiş</h3>
              <p className="text-gray-500 mb-6">Yukarıdaki butonlardan birini seçerek kanal eklemeye başlayın.</p>
            </div>
          ) : (
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
          )}
        </TabsContent>

        {channelTypes.map(type => (
          <TabsContent key={type.value} value={type.value} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <type.icon className="h-6 w-6" />
                  {type.label} Kanalı Ekle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Başlık *</Label>
                    <Input
                      id="title"
                      value={formData.type === type.value ? formData.title : ""}
                      onChange={(e) => setFormData({ ...formData, type: type.value, title: e.target.value })}
                      placeholder={`ör: ${type.label} Hesabımız`}
                      required
                    />
                  </div>
                  {type.value !== "whatsapp" && (
                    <div>
                      <Label htmlFor="value">URL *</Label>
                      <Input
                        id="value"
                        value={formData.type === type.value ? formData.value : ""}
                        onChange={(e) => setFormData({ ...formData, type: type.value, value: e.target.value })}
                        placeholder={getPlaceholder(type.value)}
                        required
                      />
                    </div>
                  )}
                  {type.value === "whatsapp" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Not:</strong> WhatsApp seçildiğinde web.whatsapp.com otomatik açılacaktır.
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => { setActiveTab("list"); resetForm(); }}>İptal</Button>
                    <Button type="submit">Kaydet</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Mevcut {type.label} Kanalları</h3>
              {channels.filter(ch => ch.type === type.value).length === 0 ? (
                <p className="text-gray-500 text-center py-8">Henüz {type.label} kanalı eklenmemiş</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {channels.filter(ch => ch.type === type.value).map(channel => (
                    <Card key={channel.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{channel.title}</h4>
                            <p className="text-sm text-gray-600 break-all">{channel.value}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(channel.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
