# 🚀 GitHub'a Yükleme ve Masaüstü Uygulaması Oluşturma Rehberi

## ADIM 1: Kodu İndirin

1. Bu klasörün içindeki **TÜM DOSYALARI** bir ZIP dosyasına sıkıştırın
   - Veya ben size hazır ZIP göndereceğim

---

## ADIM 2: GitHub'a Yükleyin

### 2.1. GitHub Repository'nize Gidin
- Tarayıcınızda şu adrese gidin: https://github.com/gkymms-max/G-ncel

### 2.2. Dosyaları Yükleyin

**Seçenek A: Web Üzerinden (Kolay)**

1. Repository sayfasında **"Add file"** butonuna tıklayın
2. **"Upload files"** seçeneğine tıklayın
3. ZIP'ten çıkardığınız **TÜM DOSYALARI** sürükle-bırak yapın
4. Alt kısımda **"Commit changes"** butonuna tıklayın

**Seçenek B: Git ile (Biliyorsanız)**

```bash
git clone https://github.com/gkymms-max/G-ncel.git
cd G-ncel
# Dosyaları buraya kopyalayın
git add .
git commit -m "Electron uygulaması eklendi"
git push
```

---

## ADIM 3: GitHub Actions Çalışsın (Otomatik)

1. Dosyaları yükledikten sonra **"Actions"** sekmesine tıklayın
2. **"Build Electron App"** workflow'unu göreceksiniz
3. Bu **otomatik başlayacak** (5-10 dakika sürer)
4. ✅ Yeşil tik işareti çıkana kadar bekleyin

---

## ADIM 4: .exe Dosyasını İndirin

### 4.1. İki yöntem var:

**Yöntem 1: Releases'den İndirin (Önerilen)**

1. Repository ana sayfasında **sağ tarafta** "Releases" bölümüne bakın
2. En son release'e tıklayın (örn: "Release v1")
3. **"Fiyat Teklifi Setup.exe"** dosyasını indirin

**Yöntem 2: Actions'dan İndirin**

1. **"Actions"** sekmesine gidin
2. En son başarılı workflow'a tıklayın (yeşil tik olan)
3. Aşağıda **"Artifacts"** bölümünden **"windows-installer"** indirin
4. ZIP'i açın, içinde .exe dosyası var

---

## ADIM 5: Uygulamayı Kurun

1. İndirdiğiniz **"Fiyat Teklifi Setup.exe"** dosyasına çift tıklayın
2. Windows güvenlik uyarısı çıkarsa:
   - **"Daha fazla bilgi"** tıklayın
   - **"Yine de çalıştır"** tıklayın
3. Kurulum sihirbazını takip edin
4. **"Kur"** butonuna tıklayın
5. Kurulum bitince **"Bitir"** tıklayın

---

## ADIM 6: Uygulamayı Başlatın! 🎉

1. Masaüstünde **"Fiyat Teklifi"** kısayolu oluşmuştur
2. Kısayola çift tıklayın
3. Uygulama açılacak!

---

## ✨ ŞİMDİ NE OLABİLİR?

### Çoklu WhatsApp Hesapları:

1. Uygulamada **"İletişim Kanalları"** menüsüne gidin
2. **"+ Yeni Kanal Ekle"** butonuna tıklayın
3. **"WhatsApp İş"** adında kanal ekleyin
4. Tekrar **"+ Yeni Kanal Ekle"** yapın
5. **"WhatsApp Kişisel"** adında kanal ekleyin
6. Her tab'a tıklayın ve **farklı QR kodlar** göreceksiniz! ✅

**ARTIK BİRDEN FAZLA WHATSAPP HESABI AÇIK TUTAB İLİRSİNİZ!** 🎊

---

## 🔄 Güncelleme Yapmak İsterseniz

1. Kodda değişiklik yapın
2. GitHub'a tekrar yükleyin (ADIM 2)
3. GitHub Actions otomatik çalışır
4. Yeni .exe oluşur
5. Yeni .exe'yi indirip kurun

---

## ❓ Sorun mu Yaşıyorsunuz?

### Hata 1: "Actions" sekmesi yok
- Repository ayarlarından **Settings → Actions → General**
- **"Allow all actions"** seçin

### Hata 2: Build başarısız
- Actions sekmesinde hataya tıklayın
- Hata mesajını bana gönderin

### Hata 3: .exe açılmıyor
- Windows Defender engelliyor olabilir
- **Ayarlar → Güvenlik → Virüs koruması → İzin verilen tehditler**
- Uygulamayı ekleyin

---

## 📞 Yardıma İhtiyacınız Olursa

Bana şunları gönderin:
1. Hangi adımda takıldınız?
2. Ekran görüntüsü
3. Hata mesajı varsa

Hemen yardımcı olacağım! 😊

---

**BAŞARILAR!** 🎉
