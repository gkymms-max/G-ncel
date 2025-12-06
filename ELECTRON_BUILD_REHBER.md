# 🚀 Electron Masaüstü Uygulaması Build Rehberi

## ✅ Kurulum Tamamlandı!

Electron setup'ı başarıyla kuruldu. Artık WhatsApp, Instagram, Facebook, TikTok gibi platformlar iframe içinde sorunsuz çalışacak.

---

## 📋 SİZİN YAPMANIZ GEREKENLER

### 1️⃣ Kendi Bilgisayarınıza İndirin

**GitHub varsa:**
```bash
git clone <repo-url>
cd <proje-klasörü>
```

**GitHub yoksa:**
- Emergent'ten "Export" ile projeyi indirin
- ZIP'i çıkarın

---

### 2️⃣ Bağımlılıkları Kurun

```bash
# Ana klasörde (Electron için)
yarn install

# Frontend klasöründe (React için)
cd frontend
yarn install
cd ..
```

---

### 3️⃣ Test Edin (Geliştirme Modu)

```bash
yarn electron-dev
```

Bu komut:
- ✅ React uygulamasını başlatır (localhost:3000)
- ✅ Electron penceresini açar
- ✅ WhatsApp/Instagram test edebilirsiniz

**Ctrl+C** ile durdurun.

---

### 4️⃣ Masaüstü Uygulaması Oluşturun

#### **Windows için .exe oluşturmak:**
```bash
yarn electron-build-win
```
📦 Dosya: `dist/Fiyat Teklifi Setup 1.0.0.exe`

#### **Mac için .dmg oluşturmak:**
```bash
yarn electron-build-mac
```
📦 Dosya: `dist/Fiyat Teklifi-1.0.0.dmg`

#### **Linux için .AppImage/.deb oluşturmak:**
```bash
yarn electron-build-linux
```
📦 Dosyalar: `dist/` klasöründe

#### **Tüm platformlar için:**
```bash
yarn electron-build
```

---

## 📂 Build Dosyaları Nerede?

Build tamamlandığında `dist/` klasöründe bulacaksınız:

```
dist/
├── Fiyat Teklifi Setup 1.0.0.exe      (Windows)
├── Fiyat Teklifi-1.0.0.dmg            (Mac)
└── fiyat-teklifi-desktop-1.0.0.AppImage  (Linux)
```

---

## 💻 Sistem Gereksinimleri

### **Windows için build:**
- Windows 10/11
- Node.js 18+ ve Yarn yüklü olmalı

### **Mac için build:**
- macOS 10.15+ (Catalina veya üstü)
- Xcode Command Line Tools yüklü olmalı
- Node.js 18+ ve Yarn yüklü olmalı

### **Linux için build:**
- Ubuntu 20.04+ veya benzeri
- Node.js 18+ ve Yarn yüklü olmalı

---

## 🎯 Önemli Notlar

### ✅ Artık Çalışacak:
- ✅ WhatsApp Web (iframe içinde)
- ✅ Instagram (iframe içinde)
- ✅ Facebook (iframe içinde)
- ✅ TikTok (iframe içinde)
- ✅ Tüm diğer özellikler

### ⚙️ Backend Bağlantısı:
Electron uygulaması şu anda **production backend**'e bağlı:
```
https://quote-desktop.preview.emergentagent.com/api
```

Kendi backend'inizi kullanmak isterseniz:
1. `frontend/.env` dosyasında `REACT_APP_BACKEND_URL` değiştirin
2. Frontend'i yeniden build edin: `cd frontend && yarn build`

---

## 🐛 Sorun Giderme

### "yarn: command not found"
```bash
npm install -g yarn
```

### "electron-builder failed"
- Node.js'in güncel olduğundan emin olun: `node -v` (18+)
- `node_modules` sil ve tekrar kur:
  ```bash
  rm -rf node_modules
  yarn install
  ```

### Mac'te "Code signing" hatası
```bash
export CSC_IDENTITY_AUTO_DISCOVERY=false
yarn electron-build-mac
```

### Linux'ta "EACCES" hatası
```bash
sudo chown -R $USER:$USER .
```

---

## 📞 Yardım

Sorun yaşarsanız:
1. `yarn electron-dev` ile geliştirme modunda test edin
2. Console'da hata mesajlarını kontrol edin
3. `dist/` klasörünü silin ve tekrar build edin

---

## 🎊 Başarılar!

Build tamamlandığında `.exe`, `.dmg` veya `.AppImage` dosyasını:
- Kendiniz kullanabilirsiniz
- Müşterilerinize gönderebilirsiniz
- Web sitesinde yayınlayabilirsiniz

**Not:** İlk build 5-10 dakika sürebilir (bağımlılıklar indirilir).
