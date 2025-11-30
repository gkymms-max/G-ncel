import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Instagram, Facebook, Globe } from "lucide-react";

const channelTypes = [
  { 
    value: "whatsapp", 
    label: "WhatsApp", 
    icon: MessageCircle,
    url: "https://web.whatsapp.com"
  },
  { 
    value: "instagram", 
    label: "Instagram", 
    icon: Instagram,
    url: "https://www.instagram.com"
  },
  { 
    value: "facebook", 
    label: "Facebook", 
    icon: Facebook,
    url: "https://www.facebook.com"
  },
  { 
    value: "tiktok", 
    label: "TikTok", 
    icon: Globe,
    url: "https://www.tiktok.com"
  },
  { 
    value: "website", 
    label: "Web Sayfası", 
    icon: Globe,
    url: "https://www.google.com"
  }
];

export default function ContactChannels() {
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [customUrls, setCustomUrls] = useState({
    whatsapp: "https://web.whatsapp.com",
    instagram: "https://www.instagram.com",
    facebook: "https://www.facebook.com",
    tiktok: "https://www.tiktok.com",
    website: "https://www.google.com"
  });

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Space Grotesk' }}>İletişim Kanalları Hub</h1>
        <p className="text-gray-600">Tüm sosyal medya hesaplarınızı tek yerden yönetin</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-5">
          {channelTypes.map(type => (
            <TabsTrigger key={type.value} value={type.value} className="flex items-center gap-2">
              <type.icon className="h-4 w-4" />
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {channelTypes.map(type => (
          <TabsContent key={type.value} value={type.value} className="flex-1 mt-4">
            <div className="w-full h-full bg-white rounded-lg border shadow-sm overflow-hidden">
              <iframe
                src={customUrls[type.value] || type.url}
                className="w-full h-full"
                title={type.label}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                allow="microphone; camera; geolocation"
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
