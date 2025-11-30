import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Instagram, Facebook, Linkedin, Twitter, Globe, Mail, Phone, ExternalLink } from "lucide-react";

const getChannelIcon = (type) => {
  const icons = {
    whatsapp: MessageCircle,
    instagram: Instagram,
    facebook: Facebook,
    linkedin: Linkedin,
    twitter: Twitter,
    website: Globe,
    email: Mail,
    phone: Phone
  };
  const Icon = icons[type] || MessageCircle;
  return <Icon className="h-8 w-8" />;
};

export default function ContactPage({ contactChannels, openChannel }) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Space Grotesk' }}>
          İletişim
        </h1>
        <p className="text-gray-600">Bizimle iletişime geçmek için aşağıdaki kanalları kullanabilirsiniz</p>
      </div>

      {contactChannels.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz iletişim kanalı eklenmemiş</h3>
          <p className="text-gray-500">Yönetici tarafından iletişim kanalları eklendiğinde burada görünecektir.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contactChannels.map(channel => (
            <Card key={channel.id} className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => openChannel(channel)}>
              <CardHeader className="text-center pb-3">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <div className="text-indigo-600">
                    {getChannelIcon(channel.type)}
                  </div>
                </div>
                <CardTitle className="text-xl">{channel.title}</CardTitle>
                <p className="text-sm text-gray-500 capitalize">{channel.type}</p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="p-3 bg-gray-50 rounded-lg mb-4">
                  <p className="text-sm font-mono text-gray-700 break-all">{channel.value}</p>
                </div>
                <Button variant="outline" className="w-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {channel.type === 'email' ? 'E-posta Gönder' : channel.type === 'phone' ? 'Ara' : 'Aç'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
