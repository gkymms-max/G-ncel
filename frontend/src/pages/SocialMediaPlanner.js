import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Instagram, Facebook, Image, Clock } from "lucide-react";
import { toast } from "sonner";

export default function SocialMediaPlanner() {
  const [instagramPost, setInstagramPost] = useState({
    content: "",
    scheduledDate: "",
    scheduledTime: "",
    image: null
  });

  const [facebookPost, setFacebookPost] = useState({
    content: "",
    scheduledDate: "",
    scheduledTime: "",
    image: null
  });

  const handleInstagramSubmit = (e) => {
    e.preventDefault();
    toast.success("Instagram gönderisi planlandı!");
    console.log("Instagram Post:", instagramPost);
  };

  const handleFacebookSubmit = (e) => {
    e.preventDefault();
    toast.success("Facebook gönderisi planlandı!");
    console.log("Facebook Post:", facebookPost);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Space Grotesk' }}>
          Sosyal Medya Planlama
        </h1>
        <p className="text-gray-600">Instagram ve Facebook gönderilerinizi planlayın</p>
      </div>

      <Tabs defaultValue="instagram" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="instagram" className="flex items-center gap-2">
            <Instagram className="h-4 w-4" />
            Instagram
          </TabsTrigger>
          <TabsTrigger value="facebook" className="flex items-center gap-2">
            <Facebook className="h-4 w-4" />
            Facebook
          </TabsTrigger>
        </TabsList>

        {/* Instagram Tab */}
        <TabsContent value="instagram">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5" />
                Instagram Gönderi Planla
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInstagramSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="ig-content">Gönderi İçeriği *</Label>
                  <Textarea
                    id="ig-content"
                    value={instagramPost.content}
                    onChange={(e) => setInstagramPost({ ...instagramPost, content: e.target.value })}
                    placeholder="Gönderi metnini yazın... (hashtag'leri dahil edebilirsiniz)"
                    rows={6}
                    required
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Karakter sayısı: {instagramPost.content.length} / 2200
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ig-date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Tarih
                    </Label>
                    <Input
                      id="ig-date"
                      type="date"
                      value={instagramPost.scheduledDate}
                      onChange={(e) => setInstagramPost({ ...instagramPost, scheduledDate: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ig-time" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Saat
                    </Label>
                    <Input
                      id="ig-time"
                      type="time"
                      value={instagramPost.scheduledTime}
                      onChange={(e) => setInstagramPost({ ...instagramPost, scheduledTime: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="ig-image" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Görsel / Video
                  </Label>
                  <Input
                    id="ig-image"
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setInstagramPost({ ...instagramPost, image: e.target.files[0] })}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG veya MP4 formatında yükleyebilirsiniz
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    <Instagram className="h-4 w-4 mr-2" />
                    Gönder iyi Planla
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setInstagramPost({content: "", scheduledDate: "", scheduledTime: "", image: null})}>
                    Temizle
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Planlanan Gönderiler */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Planlanan Instagram Gönderileri</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">Henüz planlanmış gönderi yok</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facebook Tab */}
        <TabsContent value="facebook">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="h-5 w-5" />
                Facebook Gönderi Planla
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFacebookSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fb-content">Gönderi İçeriği *</Label>
                  <Textarea
                    id="fb-content"
                    value={facebookPost.content}
                    onChange={(e) => setFacebookPost({ ...facebookPost, content: e.target.value })}
                    placeholder="Gönderi metnini yazın..."
                    rows={6}
                    required
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Karakter sayısı: {facebookPost.content.length} / 63206
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fb-date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Tarih
                    </Label>
                    <Input
                      id="fb-date"
                      type="date"
                      value={facebookPost.scheduledDate}
                      onChange={(e) => setFacebookPost({ ...facebookPost, scheduledDate: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fb-time" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Saat
                    </Label>
                    <Input
                      id="fb-time"
                      type="time"
                      value={facebookPost.scheduledTime}
                      onChange={(e) => setFacebookPost({ ...facebookPost, scheduledTime: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fb-image" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Görsel / Video
                  </Label>
                  <Input
                    id="fb-image"
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setFacebookPost({ ...facebookPost, image: e.target.files[0] })}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG veya MP4 formatında yükleyebilirsiniz
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    <Facebook className="h-4 w-4 mr-2" />
                    Gönderiyi Planla
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setFacebookPost({content: "", scheduledDate: "", scheduledTime: "", image: null})}>
                    Temizle
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Planlanan Gönderiler */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Planlanan Facebook Gönderileri</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">Henüz planlanmış gönderi yok</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
