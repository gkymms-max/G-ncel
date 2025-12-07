import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Bell, Plus, Check, Trash2, Clock, Calendar } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reminder_datetime: ""
  });

  useEffect(() => {
    fetchReminders();
    
    // Check for due reminders every 30 seconds
    const interval = setInterval(() => {
      checkDueReminders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/reminders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(response.data);
    } catch (error) {
      console.error("Hatırlatmalar yüklenemedi", error);
    }
  };

  const checkDueReminders = async () => {
    const now = new Date();
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.get(`${API}/reminders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      response.data.forEach(reminder => {
        if (!reminder.is_completed) {
          const reminderDate = new Date(reminder.reminder_datetime);
          const diffMinutes = (now - reminderDate) / 1000 / 60;
          
          // If reminder is due (within 1 minute of the time)
          if (diffMinutes >= 0 && diffMinutes <= 1) {
            // Show browser notification
            if (Notification.permission === "granted") {
              new Notification("🔔 Hatırlatma!", {
                body: reminder.title,
                icon: "/logo.png"
              });
            }
            
            // Show toast
            toast.info(`🔔 ${reminder.title}`, {
              description: reminder.description,
              duration: 10000
            });
          }
        }
      });
    } catch (error) {
      console.error("Hatırlatma kontrolü başarısız", error);
    }
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.post(`${API}/reminders`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Hatırlatma eklendi");
      setDialogOpen(false);
      setFormData({ title: "", description: "", reminder_datetime: "" });
      fetchReminders();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Bir hata oluştu");
    }
  };

  const handleComplete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`${API}/reminders/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Hatırlatma tamamlandı");
      fetchReminders();
    } catch (error) {
      toast.error("İşlem başarısız");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu hatırlatmayı silmek istediğinize emin misiniz?")) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API}/reminders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Hatırlatma silindi");
      fetchReminders();
    } catch (error) {
      toast.error("Silme işlemi başarısız");
    }
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPast = (dateStr) => {
    return new Date(dateStr) < new Date();
  };

  const pendingReminders = reminders.filter(r => !r.is_completed);
  const completedReminders = reminders.filter(r => r.is_completed);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
          🔔 Hatırlatmalar
        </h1>
        <p className="text-gray-600">Zamanında bildirim alın</p>
      </div>

      {/* Add Button */}
      <div className="flex justify-end mb-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({ title: "", description: "", reminder_datetime: "" })}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Hatırlatma
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Hatırlatma Ekle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Başlık *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Müşteri X'i ara"
                  required
                />
              </div>
              <div>
                <Label>Açıklama</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detaylar..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Tarih ve Saat *</Label>
                <Input
                  type="datetime-local"
                  value={formData.reminder_datetime}
                  onChange={(e) => setFormData({ ...formData, reminder_datetime: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">Ekle</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Reminders */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          Bekleyen Hatırlatmalar ({pendingReminders.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingReminders.map((reminder) => (
            <Card key={reminder.id} className={`hover:shadow-lg transition-shadow ${isPast(reminder.reminder_datetime) ? 'border-red-300 bg-red-50' : ''}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-500" />
                    {reminder.title}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleComplete(reminder.id)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(reminder.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reminder.description && (
                  <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className={isPast(reminder.reminder_datetime) ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                    {formatDateTime(reminder.reminder_datetime)}
                  </span>
                </div>
                {isPast(reminder.reminder_datetime) && (
                  <p className="text-xs text-red-600 mt-2 font-semibold">⚠️ Zamanı geçti!</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        {pendingReminders.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">Bekleyen hatırlatma yok</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Tamamlanan Hatırlatmalar ({completedReminders.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedReminders.map((reminder) => (
              <Card key={reminder.id} className="opacity-60">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2 line-through text-gray-500">
                      <Check className="h-5 w-5 text-green-500" />
                      {reminder.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(reminder.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reminder.description && (
                    <p className="text-sm text-gray-500 mb-2">{reminder.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {formatDateTime(reminder.reminder_datetime)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
