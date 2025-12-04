# 🖥️ Fiyat Teklifi - Masaüstü Uygulaması Build Rehberi

## 📋 Gereksinimler (Tek Seferlik)

### 1. Node.js Kurulumu
1. **Node.js İndirin:**
   - 🌐 https://nodejs.org/en/download/ adresine gidin
   - **"Windows Installer (.msi)"** seçeneğine tıklayın (64-bit)
   - İndirilen dosyayı çalıştırın
   - Tüm ayarları **varsayılan olarak bırakıp** "Next" butonuna basın
   - Kurulum bittiğinde "Finish" butonuna tıklayın

2. **Kurulumu Kontrol Edin:**
   - Windows'ta **"Başlat"** menüsüne sağ tıklayın
   - **"Windows PowerShell"** veya **"Terminal"** seçeneğine tıklayın
   - Aşağıdaki komutu yazıp Enter'a basın:
   ```bash
   node --version
   ```
   - Ekranda `v20.x.x` gibi bir versiyon görmelisiniz ✅

---

## 🚀 Masaüstü Uygulaması Oluşturma (5 Dakika)

### Adım 1: Kodu Bilgisayarınıza İndirin

1. **Projeyi İndirin:**
   - Emergent platformundan "Export to GitHub" veya "Download Code" yapın
   - ZIP dosyasını masaüstüne çıkarın
   - Klasör adı: `fiyat-teklifi-desktop`

2. **Terminal Açın:**
   - Windows Arama'da **"PowerShell"** yazın
   - **"Windows PowerShell"** uygulamasına sağ tıklayın
   - **"Yönetici olarak çalıştır"** seçeneğine tıklayın

3. **Proje Klasörüne Gidin:**
   ```bash
   cd Desktop\fiyat-teklifi-desktop
   ```

---

### Adım 2: Bağımlılıkları Yükleyin

Terminal'de şu komutu çalıştırın:
```bash
npm install
```

⏳ **Bekleyin:** 2-3 dakika sürebilir. Ekranda birçok satır görünecek, bu normaldir.

✅ **Başarılı olduğunda:** "added xxx packages" gibi bir mesaj göreceksiniz.

---

### Adım 3: Masaüstü Uygulamasını Build Edin

Terminal'de şu komutu çalıştırın:
```bash
npm run electron-build-win
```

⏳ **Bekleyin:** 5-10 dakika sürecektir. Ekranda:
- "Building frontend..." (Frontend hazırlanıyor)
- "Building Electron..." (Masaüstü uygulaması oluşturuluyor)
- "Packaging..." (Paketleniyor)

✅ **Başarılı olduğunda:** "Build successful!" mesajı göreceksiniz.

---

### Adım 4: Uygulamayı Bulun ve Çalıştırın

1. **Uygulamayı Bulun:**
   - Proje klasöründe **`dist`** klasörü oluşmuştur
   - İçinde **"Fiyat Teklifi Setup.exe"** dosyası vardır

2. **Kurulumu Yapın:**
   - **"Fiyat Teklifi Setup.exe"** dosyasına çift tıklayın
   - Windows güvenlik uyarısı çıkarsa **"Daha fazla bilgi"** → **"Yine de çalıştır"**
   - Kurulum yeri seçin (varsayılan: C:\Program Files\Fiyat Teklifi)
   - **"Kur"** butonuna tıklayın

3. **Uygulamayı Başlatın:**
   - Masaüstünde **"Fiyat Teklifi"** kısayolu oluşmuştur
   - Kısayola çift tıklayın
   - Uygulama açılacaktır! 🎉

---

## 🔥 ÖNEMLİ BİLGİLER

### ✅ Çoklu Hesap Desteği
- **İletişim Kanalları Hub** menüsüne gidin
- **"+ Yeni Kanal Ekle"** butonuna tıklayın
- İstediğiniz kadar WhatsApp, Instagram, Facebook hesabı ekleyebilirsiniz
- Örnek:
  - WhatsApp İş
  - WhatsApp Kişisel
  - Instagram Ana Hesap
  - Instagram İş Hesabı

### ⚠️ İnternet Bağlantısı Gereklidir
- Uygulama her zaman sunucunuza bağlanır
- Offline çalışmaz (veriler sunucuda saklanır)

### 🔄 Güncellemeler
- Kodda değişiklik yaptığınızda:
  1. Emergent'tan yeni kodu indirin
  2. Adım 1'den tekrar başlayın (5 dakika)
  3. Yeni .exe dosyası oluşur

### 📊 Dosya Boyutu
- Setup.exe dosyası: ~150-180 MB
- Kurulu uygulama: ~250-300 MB
- Bu normaldir (Electron tüm browser motor\unu içerir)

---

## 🐛 Sorun Giderme

### "node: command not found" Hatası
- Node.js düzgün kurulmamış
- Node.js'i tekrar indirip kurun
- Bilgisayarı yeniden başlatın

### "npm: command not found" Hatası
- PowerShell'i **yönetici olarak** açmadınız
- PowerShell'i kapatıp **sağ tık → Yönetici olarak çalıştır**

### Build Sırasında Hata
- İnternet bağlantınızı kontrol edin
- Antivirüs programını geçici olarak kapatın
- Terminal'de şu komutu çalıştırın:
  ```bash
  npm cache clean --force
  npm install
  npm run electron-build-win
  ```

### Uygulama Açılmıyor
- Windows Defender engellemiş olabilir
- **Başlat → Ayarlar → Güvenlik → Virüs ve tehdit koruması**
- **"İzin verilen tehditler"** → Uygulamayı ekleyin

---

## 💡 İPUÇLARI

### .exe Dosyasını Paylaşın
- `dist` klasöründeki **"Fiyat Teklifi Setup.exe"** dosyasını kopyalayın
- USB, Google Drive, WeTransfer ile paylaşabilirsiniz
- Diğer kişiler de aynı kurulumu yapabilir

### Kısayol Oluşturun
- Kurulumdan sonra masaüstünde kısayol otomatik oluşur
- Başlangıç menüsünde de eklenir

### Birden Fazla Bilgisayara Kurun
- Setup.exe dosyasını kopyalayıp diğer bilgisayarlarda çalıştırın
- Her bilgisayarda ayrı ayrı build yapmanıza gerek yok

---

## 📞 Yardım İçin

Herhangi bir sorunla karşılaşırsanız:
1. Hatayı ekran görüntüsü alın
2. Terminal'deki son 10 satırı kopyalayın
3. Bana gönderin, hemen çözeceğim! 😊

---

**BAŞARILAR! 🎉**

Sorularınız için buradayım!
