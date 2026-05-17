# 🎙️ Angky — Studio Rekaman Suara

Angky adalah aplikasi web lokal untuk merekam dataset suara berpasangan (Bahasa Indonesia ↔ Bahasa Sumber). Hasil rekaman berupa file WAV mono 22050 Hz 16-bit yang siap digunakan untuk pelatihan model TTS seperti Piper.

---

## 📋 Daftar Isi

- [Persyaratan](#-persyaratan)
- [Instalasi](#-instalasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Cara Menggunakan](#-cara-menggunakan)
  - [1. Menyiapkan File CSV](#1-menyiapkan-file-csv)
  - [2. Mengunggah CSV](#2-mengunggah-csv)
  - [3. Mengatur Batas Rekaman](#3-mengatur-batas-rekaman-opsional)
  - [4. Mulai Merekam](#4-mulai-merekam)
  - [5. Rekam dari HP (QR Code)](#5-rekam-dari-hp-qr-code)
- [Pintasan Keyboard](#-pintasan-keyboard)
- [Struktur Output](#-struktur-output)
- [Mode Gelap / Terang](#-mode-gelap--terang)
- [Troubleshooting](#-troubleshooting)
- [Catatan Teknis](#-catatan-teknis)

---

## 🔧 Persyaratan

| Komponen      | Versi Minimum |
|---------------|---------------|
| **Node.js**   | 18+           |
| **Bun**       | 1.x (atau gunakan `npm`) |
| **Browser**   | Chrome / Edge / Firefox terbaru |
| **Mikrofon**  | Mikrofon bawaan laptop atau headset |

---

## 📦 Instalasi

```bash
# 1. Masuk ke folder frontend
cd Angky

# 2. Install dependensi
bun install / npm install / pnpm install
```

> **Catatan:** Bisa juga menggunakan `npm install` atau `pnpm install` jika tidak menggunakan Bun.

---

## 🚀 Menjalankan Aplikasi

### Mode Standar (hanya di laptop)

```bash
bun dev / npm run dev / pnpm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

### Mode Jaringan + HTTPS (untuk akses dari HP)

```bash
bun dev / npm run dev / pnpm run dev
```

> Script `dev` sudah dikonfigurasi dengan `--hostname 0.0.0.0 --experimental-https`, sehingga:
> - Server bisa diakses dari perangkat lain di jaringan WiFi yang sama
> - HTTPS aktif (diperlukan agar mikrofon HP bisa digunakan)
>
> Saat pertama kali dijalankan, Next.js akan membuat sertifikat SSL otomatis. Anda mungkin diminta memasukkan password sistem.

---

## 📖 Cara Menggunakan

### 1. Menyiapkan File CSV

Buat file `.csv` berisi pasangan kalimat dengan format:

```
Kalimat Bahasa Indonesia;Kalimat Bahasa Sumber
```

**Contoh:**

```csv
Selamat pagi, apa kabar?;Za be, lu ho bo?
Terima kasih banyak.;Do sia lu.
Saya mau makan nasi.;Gua beh ciah bng.
```

**Aturan penting:**
- Gunakan **titik koma (`;`)** sebagai pemisah, **bukan koma**
- **Tidak perlu** baris header
- Setiap baris = satu pasangan kalimat
- Encoding file: **UTF-8** (mendukung BOM)

### 2. Mengunggah CSV

1. Buka halaman utama (`/`)
2. Di bagian **"Muat Kalimat"**, klik area unggah atau tarik-lepas file CSV
3. Jumlah kalimat yang dimuat akan ditampilkan

> **Peringatan:** Mengunggah CSV baru akan **menimpa** kalimat sebelumnya. Rekaman yang sudah tersimpan **tidak terhapus**.

### 3. Mengatur Batas Rekaman (Opsional)

Jika tidak ingin merekam seluruh dataset:

1. Di bagian **"Batas Rekaman"**, masukkan angka (misal: `10`)
2. Klik **"Simpan Batas"**
3. Hanya sejumlah kalimat tersebut yang akan ditampilkan saat rekaman

Kosongkan field dan simpan untuk merekam semua kalimat.

### 4. Mulai Merekam

1. Klik **"Mulai Rekaman"** atau **"Lanjut Rekaman"**
2. Anda akan masuk ke halaman **Sesi Rekaman** (`/session`)
3. Untuk setiap kalimat, ada **dua slot rekaman**:
   - **Bahasa Indonesia** — rekam versi Bahasa Indonesia
   - **Bahasa Sumber** — rekam versi bahasa sumber

**Alur rekaman per slot:**

```
Klik "Rekam" → Bicara → Klik "Berhenti" → Otomatis tersimpan
```

- Setelah tersimpan, muncul badge **Tersimpan** dan pemutar audio
- Klik **"Rekam Ulang"** untuk merekam ulang jika kurang puas
- Setelah kedua slot terisi, klik **"Selesai & Lanjut"** untuk ke kalimat berikutnya

**Navigasi kalimat:**
- Gunakan tombol **Sebelumnya** / **Berikutnya** di bagian bawah
- Gunakan tombol **Lewati** untuk melewati kalimat
- Gunakan input **"Lompat ke ID..."** untuk langsung ke kalimat tertentu (ketik nomor ID, tekan Enter)

### 5. Rekam dari HP (QR Code)

Anda bisa menggunakan HP sebagai alat rekam:

1. Pastikan **laptop dan HP terhubung ke WiFi yang sama**
2. Di halaman utama desktop, cari kartu **"Rekam dari HP"**
3. **Pindai kode QR** dengan kamera HP
4. Browser HP akan terbuka — terima peringatan sertifikat HTTPS
5. **Izinkan akses mikrofon** saat diminta
6. Mulai merekam langsung dari HP!

> Kartu QR hanya tampil di layar desktop (lebar >= 768px). Jika sudah di HP, Anda sudah di tempat yang benar!

> **HTTPS wajib** untuk akses mikrofon di HP. Tanpa HTTPS, browser akan memblokir akses mikrofon.

---

## ⌨️ Pintasan Keyboard

| Tombol | Fungsi |
|--------|--------|
| `←` | Kalimat sebelumnya |
| `→` | Kalimat berikutnya |
| `S` | Lewati kalimat (sama dengan tombol "Lewati") |

> Pintasan hanya aktif saat tidak sedang mengetik di input field.

---

## 📁 Struktur Output

Semua hasil rekaman tersimpan di folder `output/` di root project:

```
output/
├── config.json                    # Konfigurasi (batas rekaman)
├── prompts.json                   # Daftar kalimat dari CSV
├── indonesian/
│   ├── wav/
│   │   ├── 0001.wav               # File rekaman
│   │   ├── 0002.wav
│   │   └── ...
│   └── metadata.csv               # Format: ID|teks kalimat
└── source/
    ├── wav/
    │   ├── 0001.wav
    │   ├── 0002.wav
    │   └── ...
    └── metadata.csv
```

**Format audio:**
- WAV mono, 22050 Hz, 16-bit PCM
- Cocok untuk pelatihan Piper TTS dan model lainnya

**Format metadata.csv:**
```
0001|Selamat pagi, apa kabar?
0002|Terima kasih banyak.
```

> Metadata diperbarui otomatis setiap kali ada rekaman baru atau dihapus.

---

## 🌙 Mode Gelap / Terang

Klik tombol **bulan/matahari** di pojok kanan atas header untuk beralih antara mode gelap dan terang. Preferensi tersimpan di browser (`localStorage`).

---

## 🔍 Troubleshooting

### Mikrofon tidak terdeteksi
- Pastikan browser memiliki izin akses mikrofon
- Cek pengaturan privasi sistem operasi (System Preferences > Privacy > Microphone)
- Coba refresh halaman

### Rekaman tidak tersimpan
- Pastikan folder `output/` bisa ditulis (writable)
- Periksa konsol browser (F12) untuk melihat error

### QR Code tidak muncul
- Komponen QR hanya tampil di desktop (layar >= 768px)
- Pastikan `bun dev` berjalan dengan `--hostname 0.0.0.0`
- Cek apakah `/api/network-info` mengembalikan IP yang benar

### Halaman HP tidak bisa dibuka
- Pastikan laptop dan HP di **WiFi yang sama**
- Jika muncul peringatan "koneksi tidak aman", tekan **"Lanjutkan"** / **"Advanced > Proceed"** (ini karena sertifikat self-signed, aman untuk jaringan lokal)
- Periksa firewall laptop — port 3000 harus terbuka

### Port 3000 sudah dipakai
- Next.js akan otomatis pindah ke port lain (3001, 3002, dst.)
- Port yang digunakan terlihat di terminal saat menjalankan `bun dev`

### Audio terdengar rusak / noise
- Gunakan headset atau mikrofon eksternal untuk kualitas lebih baik
- Rekam di ruangan yang tenang
- Hindari jarak terlalu jauh dari mikrofon

---

## 🔬 Catatan Teknis

### Arsitektur
- **Framework:** Next.js 16 dengan App Router
- **Runtime:** Node.js (API routes menggunakan `fs` untuk baca/tulis file)
- **Audio:** `AudioContext` + `ScriptProcessorNode` lalu WAV encoding di sisi klien
- **Styling:** Tailwind CSS v4
- **Ikon:** Tabler Icons React

### Peringatan
- `ScriptProcessorNode` adalah API deprecated dari Web Audio. Masih berfungsi di semua browser modern, tapi di masa depan mungkin perlu diganti dengan `AudioWorkletNode`.
- Aplikasi ini dirancang untuk **penggunaan lokal** (satu pengguna pada satu waktu). Tidak ada autentikasi atau proteksi akses.
- Data rekaman disimpan langsung di filesystem lokal — **tidak ada backup otomatis**. Pastikan untuk mem-backup folder `output/` secara berkala.

---

## 📄 Lisensi

Lihat file [LICENSE](./LICENSE) untuk detail lisensi.
