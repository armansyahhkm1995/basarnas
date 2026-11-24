# ROV Trainer Simulator — BASARNAS

Aplikasi **Simulator Pelatihan Pilot ROV Sealion Basarnas** berbasis Web 3D (Three.js) dengan antarmuka modern yang mengadopsi **Falah One Design System** dan palet taktis **Basarnas Oceanic Dark Mode**.

---

## 🌟 Fitur Utama

- **Falah One Design System & Basarnas Tactical Theme**: Antarmuka responsif dengan skema warna Oceanic Navy & Teal, aksen Amber, serta tipografi Barlow Condensed & JetBrains Mono.
- **Simulasi 3D Bawah Laut Realistis**:
  - Model 3D detail ROV Sealion dengan manipulator claw, lampu LED, dan tether umbilical.
  - Lingkungan dasar laut (black box, batu karang, rumput laut, dan kontur palung).
  - Efek air realistis: underwater fog, partikel sedimen/marine snow, dan pencahayaan dinamis.
- **Dukungan Kontrol Lengkap (6-DOF)**:
  - **Xbox Controller**: Analog stick kendali Surge/Sway/Heave/Yaw, trigger, dan tombol bumper.
  - **Keyboard WASD**: Kendali `W/S` (Maju/Mundur), `A/D` (Lateral), `Q/E` (Turun/Naik), dan Panah (Heading/Yaw).
- **HUD Navigasi Taktis & Telemetri**:
  - Horizontal Compass Heading Tape dengan penunjuk sudut real-time.
  - Artificial Horizon Gyro Indicator (Roll & Pitch).
  - Indikator kedalaman, kekuatan arus, visibilitas, status tekanan hidrostatis, dan baterai.
  - Inset viewport 3D ROV untuk memantau posisi unit secara eksternal.
  - Deteksi benturan dengan efek FPS red damage flash, screen shake, dan audio benturan.
- **Checklist Objektif Misi & Evaluasi**:
  - Panel mengambang checklist objektif real-time di layar simulasi.
  - Modal penyelesaian misi **"SKENARIO BERHASIL"**.
  - Layar ringkasan **Hasil Sesi Trainee** (1:1 Figma Node `124:3803`) dengan skor sirkular, durasi, metrik gangguan, dan benturan.
  - Integrasi otomatis ke riwayat **Daftar Laporan** dan **Detail Laporan**.

---

## 🚀 Menjalankan Secara Lokal

Cukup buka file `index.html` pada browser modern (Chrome, Edge, Firefox), atau jalankan local server:

```bash
# Menggunakan Python
python -m http.server 8000

# Menggunakan Node (npx)
npx serve .
```

Buka `http://localhost:8000` pada browser.

---

## ☁️ Deployment ke Vercel

Repositori ini telah disiapkan dengan konfigurasi `vercel.json` untuk deployment otomatis pada Vercel.

1. Hubungkan repositori GitHub ini pada akun Vercel Anda.
2. Vercel akan otomatis mengenali `index.html` pada direktori utama.
3. Setiap commit atau push baru ke branch `main` akan langsung memicu deployment otomatis.

---

## 📄 Lisensi

Hak Cipta © 2026 BASARNAS (Badan Nasional Pencarian dan Pertolongan).
