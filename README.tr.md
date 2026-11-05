# GlazeWM UI — Kontrol Merkezi & Yapılandırıcı

> [GlazeWM](https://github.com/glzr-io/glazewm) tiling pencere yöneticisi için modern, hızlı ve kullanımı kolay masaüstü kontrol merkezi (Windows `.exe`).

[English](README.md) · **Türkçe**

[![Lisans: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows-0078D6.svg)](#)

---

## 📥 İndirme

Kurulum gerektirmeyen taşınabilir `.exe` dosyasını [**Releases**](https://github.com/realyasster/GlazeWM-UI/releases/latest) sayfasından indirebilirsiniz.

> [GlazeWM](https://github.com/glzr-io/glazewm) kurulu ve çalışıyor olmalıdır. Uygulama yerel IPC soketi üzerinden bağlanır, `config.yaml` dosyanızı okur ve yazar.

---

## ✨ Özellikler

- **🎨 Boşluklar ve Efekt Stüdyosu (Gaps & Effects):**
  - İç ve dış pencere boşluklarını (`inner_gap`, `outer_gap`) canlı slider ile anlık ayarlama.
  - Odaklı ve inaktif pencereler için renk seçici (Color Picker) ve kenarlık rengi özelleştirme.
  - Windows 11 için köşe stilleri (`square`, `rounded`, `small_rounded`).
  - Ayarları yaparken masaüstünde nasıl görüneceğini gösteren **canlı etkileşimli önizleme**.

- **🛡️ Akıllı Pencere Kuralları (Window Rules):**
  - **Canlı Pencere Dedektörü:** GlazeWM IPC üzerinden açık olan tüm pencereleri anlık listeler (`process_name`, `class_name`, `title`).
  - **Tek Tıkla Kural Oluşturma:** Uygulama adını elle yazmaya gerek kalmadan "Kayan Pencere Yap (`set-floating`)", "Yok Say (`ignore`)" veya "Çalışma Alanına Taşı (`move --workspace X`)" kuralları tanımlama.

- **⌨️ Kısayol Tuşları & Çakışma Denetleyici (Keybindings):**
  - Tüm klavye kısayollarını görsel tuş rozetleriyle (`<kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>Q</kbd>`) arama ve filtreleme.
  - **Çakışma Tespiti (Conflict Detector):** Aynı tuş kombinasyonu birden fazla komuta atanmışsa otomatik sarı uyarı rozeti gösterir.
  - Form üzerinden kolayca yeni kısayol ekleme ve silme.

- **🗂️ Çalışma Alanları (Workspaces):**
  - Çalışma alanı etiketlerini (`display_name`) ve monitör sabitlemelerini (`bind_to_monitor`) yönetme.
  - Tek tıkla o alana geçiş testi yapabilme (`focus --workspace`).

- **⚙️ Genel Tercihler (General Settings):**
  - Fareyi takip eden odak (`focus_follows_cursor`), odaklanıldığında eski alana dönme (`toggle_workspace_on_refocus`).
  - Açılış (`startup_commands`) ve kapanış (`shutdown_commands`) komutlarını yönetme.

- **📝 YAML Editörü & Otomatik Yedekleme (Auto-Backup):**
  - Doğrudan `config.yaml` dosyasını düzenleme ve sözdizimi doğrulama (syntax check).
  - Her kayıt işleminde timestamp ile otomatik yedek alma (`config.backup-YYYY-MM-DD.yaml`) ve tek tıkla eski yedeğe geri dönebilme.

- **⚡ Sistem Tepsisi (Tray) & Gerçek Zamanlı IPC:**
  - GlazeWM arka plan servisine yerel WebSocket IPC ile bağlanır.
  - Sistem tepsisinde hızlı menü: Config Yenile (`wm-reload-config`), Kayan Pencere Aç/Kapa (`toggle-floating`), Tiling Yönü Değiştir.

---

## 🚀 Çalıştırma ve Derleme

### Ön Koşullar

- Windows 10/11
- [GlazeWM](https://github.com/glzr-io/glazewm) kurulu olmalı
- [Node.js](https://nodejs.org/) 20+ ve [pnpm](https://pnpm.io/)

### Geliştirici Modunda Çalıştırma (Dev Mode)

```bash
# Bağımlılıkları yükleyin
pnpm install

# Geliştirme sunucusunu ve Electron'u başlatın
pnpm run electron:dev
```

### Windows `.exe` Paketleme (Production Build)

```bash
# Kurulum gerektirmeyen taşınabilir tek dosya .exe üretir:
pnpm run package:portable

# NSIS kurulum paketi ve taşınabilir .exe üretir:
pnpm run package
```

Çıktı dosyası `release/` klasörü altına kaydedilir (örn. `release/GlazeWM UI 1.0.0.exe`).

---

## 📄 Lisans

[MIT Lisansı](LICENSE) altında yayınlanmıştır.
