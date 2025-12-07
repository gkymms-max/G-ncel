import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { MessageCircle, Instagram, Facebook, Globe, Plus, Trash2, Edit } from "lucide-react";
import { SiTiktok } from "react-icons/si";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const channelIcons = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  facebook: Facebook,
  tiktok: SiTiktok,
  website: Globe,
  other: Globe
};

const defaultUrls = {
  whatsapp: "https://web.whatsapp.com",
  instagram: "https://www.instagram.com/direct/inbox/",
  facebook: "https://www.facebook.com/messages",
  tiktok: "https://www.tiktok.com",
  website: "https://www.google.com",
  other: "https://www.google.com"
};

export default function ContactChannelsBrowserView() {
  const [channels, setChannels] = useState([]);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [formData, setFormData] = useState({
    type: "whatsapp",
    title: "",
    url: "",
    order: 0
  });

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (channels.length > 0 && !activeChannelId) {
      setActiveChannelId(channels[0].id);
    }
  }, [channels]);

  // Create BrowserViews for all channels
  useEffect(() => {
    if (window.electron && window.electron.ipcRenderer) {
      channels.forEach(channel => {
        window.electron.ipcRenderer.send('create-browser-view', {
          channelId: channel.id,
          url: channel.url
        });
      });
    }
  }, [channels]);

  // Show active channel's BrowserView
  useEffect(() => {
    if (activeChannelId && window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send('show-browser-view', activeChannelId);
    }
  }, [activeChannelId]);

  const fetchChannels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/contact-channels`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChannels(response.data);
    } catch (error) {
      console.error("Kanallar yüklenemedi:", error);
    }
  };

  const handleAddChannel = () => {
    setEditingChannel(null);
    setFormData({
      type: "whatsapp",
      title: "",
      url: defaultUrls.whatsapp,
      order: channels.length
    });
    
    // Hide BrowserViews when dialog opens
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send('hide-all-browser-views');
    }
    
    setDialogOpen(true);
  };

  const handleEditChannel = (channel) => {
    setEditingChannel(channel);
    setFormData({
      type: channel.type,
      title: channel.title,
      url: channel.url,
      order: channel.order
    });
    
    // Hide BrowserViews when dialog opens
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send('hide-all-browser-views');
    }
    
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      if (editingChannel) {
        await axios.put(`${API}/contact-channels/${editingChannel.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Kanal güncellendi");
      } else {
        await axios.post(`${API}/contact-channels`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Kanal eklendi");
      }
      setDialogOpen(false);
      fetchChannels();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Bir hata oluştu");
    }
  };

  const handleDeleteChannel = async (channelId) => {
    if (!window.confirm("Bu kanalı silmek istediğinize emin misiniz?")) return;

    try {
      const token = localStorage.getItem('token');
      
      // Remove BrowserView
      if (window.electron && window.electron.ipcRenderer) {
        window.electron.ipcRenderer.send('remove-browser-view', channelId);
      }
      
      await axios.delete(`${API}/contact-channels/${channelId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Kanal silindi");
      if (activeChannelId === channelId) {
        setActiveChannelId(channels[0]?.id || null);
      }
      fetchChannels();
    } catch (error) {
      toast.error("Kanal silinemedi");
    }
  };

  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      type,
      url: formData.url === defaultUrls[formData.type] ? defaultUrls[type] : formData.url
    });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white" style={{ height: '120px' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk' }}>
              İletişim Kanalları Hub
            </h1>
            <p className="text-sm text-gray-600">Tüm sosyal medya hesaplarınızı tek yerden yönetin</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            // Restore BrowserViews when dialog closes
            if (!open && window.electron && window.electron.ipcRenderer) {
              window.electron.ipcRenderer.send('restore-browser-views', activeChannelId);
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleAddChannel} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Yeni Kanal Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingChannel ? "Kanal Düzenle" : "Yeni Kanal Ekle"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Platform Türü</Label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="tiktok">TikTok</option>
                    <option value="website">Web Sitesi</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>
                <div>
                  <Label>Kanal Adı *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="örn: WhatsApp İş, Instagram Kişisel"
                    required
                  />
                </div>
                <div>
                  <Label>URL *</Label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit">
                    {editingChannel ? "Güncelle" : "Ekle"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Channel Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {channels.map(channel => {
            const ChannelIcon = channelIcons[channel.type];
            return (
              <div
                key={channel.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                  activeChannelId === channel.id
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => setActiveChannelId(channel.id)}
              >
                <ChannelIcon className="h-4 w-4" />
                <span className="text-sm font-medium whitespace-nowrap">{channel.title}</span>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditChannel(channel);
                    }}
                    className={`p-1 rounded hover:bg-opacity-20 ${
                      activeChannelId === channel.id ? 'hover:bg-white' : 'hover:bg-gray-200'
                    }`}
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChannel(channel.id);
                    }}
                    className={`p-1 rounded hover:bg-opacity-20 ${
                      activeChannelId === channel.id ? 'hover:bg-white' : 'hover:bg-red-100'
                    }`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content - BrowserView will be rendered by Electron */}
      <div className="flex-1 bg-gray-100">
        {channels.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <Card>
              <CardContent className="pt-6 text-center">
                <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Henüz kanal eklenmemiş</p>
                <Button onClick={handleAddChannel}>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Kanalı Ekle
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
