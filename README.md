<p align="center">
  <img src="./public/angky/android-chrome-192x192.png" alt="Angky Logo" width="120" />
</p>

<h1 align="center">Angky Studio Rekaman Suara</h1>

<p align="center">
  <strong>Aplikasi Web Lokal untuk Merekam Dataset Suara Berpasangan Secara Cepat & Mudah</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.x-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js" />
</p>

---


# 🎙️ Angky Studio Rekaman Suara

Angky adalah aplikasi web lokal untuk merekam dataset suara berpasangan (Bahasa Indonesia ↔ Bahasa Sumber). Hasil rekaman berupa file WAV mono 22050 Hz 16-bit yang siap digunakan untuk pelatihan model TTS seperti Piper.

---

## 📋 Daftar Isi

- [Persyaratan](#-persyaratan)
- [Instalasi](#-instalasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Cara Menggunakan](#-cara-menggunakan)
  - [1. Menyiapkan File CSV atau Excel](#1-menyiapkan-file-csv-atau-excel)
  - [2. Mengunggah File](#2-mengunggah-file)
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
| **npm**       | 9+ (bawaan Node.js) |
| **Browser**   | Chrome / Edge / Firefox terbaru |
| **Mikrofon**  | Mikrofon bawaan laptop atau headset |

---

## 📦 Instalasi

```bash
# 1. Masuk ke folder frontend
cd Angky

# 2. Install dependensi
npm install
```

> **Catatan:** Bisa juga menggunakan `bun install` atau `pnpm install` sebagai alternatif.

---

## 🚀 Menjalankan Aplikasi

### Mode Standar (hanya di laptop)

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

### Mode Jaringan + HTTPS (untuk akses dari HP)

```bash
npm run dev
```

> Script `dev` sudah dikonfigurasi dengan `--hostname 0.0.0.0 --experimental-https`, sehingga:
> - Server bisa diakses dari perangkat lain di jaringan WiFi yang sama
> - HTTPS aktif (diperlukan agar mikrofon HP bisa digunakan)
>
> Saat pertama kali dijalankan, Next.js akan membuat sertifikat SSL otomatis. Anda mungkin diminta memasukkan password sistem.

---

## 📖 Cara Menggunakan

### 1. Menyiapkan File CSV atau Excel

Anda bisa menggunakan **file CSV** atau **file Excel (.xlsx / .xls)**.

#### Opsi A: File CSV

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

**Aturan CSV:**
- Gunakan **titik koma (`;`)** sebagai pemisah, **bukan koma**
- **Tidak perlu** baris header
- Setiap baris = satu pasangan kalimat
- Encoding file: **UTF-8** (mendukung BOM)

#### Opsi B: File Excel (.xlsx / .xls)

Buat spreadsheet dengan dua kolom:

| Kolom A (Bahasa Indonesia) | Kolom B (Bahasa Sumber) |
|---|---|
| Selamat pagi, apa kabar? | Za be, lu ho bo? |
| Terima kasih banyak. | Do sia lu. |
| Saya mau makan nasi. | Gua beh ciah bng. |

**Aturan Excel:**
- **Kolom A** = Bahasa Indonesia
- **Kolom B** = Bahasa Sumber
- Tidak perlu header (langsung isi data dari baris 1)
- Hanya sheet pertama yang dibaca
- Baris kosong akan diabaikan

### 2. Mengunggah File

1. Buka halaman utama (`/`)
2. Di bagian **"Muat Kalimat"**, klik area unggah atau tarik-lepas file (CSV/Excel)
3. Jumlah kalimat yang dimuat akan ditampilkan

> **Peringatan:** Mengunggah file baru akan **menimpa** kalimat sebelumnya. Rekaman yang sudah tersimpan **tidak terhapus**.

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
- Pastikan `npm run dev` berjalan dengan `--hostname 0.0.0.0`
- Cek apakah `/api/network-info` mengembalikan IP yang benar

### Halaman HP tidak bisa dibuka
- Pastikan laptop dan HP di **WiFi yang sama**
- Jika muncul peringatan "koneksi tidak aman", tekan **"Lanjutkan"** / **"Advanced > Proceed"** (ini karena sertifikat self-signed, aman untuk jaringan lokal)
- Periksa firewall laptop — port 3000 harus terbuka

### Port 3000 sudah dipakai
- Next.js akan otomatis pindah ke port lain (3001, 3002, dst.)
- Port yang digunakan terlihat di terminal saat menjalankan `npm run dev`

### Audio terdengar rusak / noise
- Gunakan headset atau mikrofon eksternal untuk kualitas lebih baik
- Rekam di ruangan yang tenang
- Hindari jarak terlalu jauh dari mikrofon

### Sertifikat HTTPS gagal dibuat (mkcert error)

**Gejala:** Saat menjalankan `npm run dev`, muncul error seperti berikut:

```
⨯ Failed to generate self-signed certificate. Falling back to http.
Error: Command failed: "...\mkcert-v1.4.4-windows-amd64.exe" -install -key-file "...\localhost-key.pem" ...
```

Atau saat menjalankan `mkcert -install` manual muncul error:

```
ERROR: failed to execute "keytool -importcert": exit status 1
keytool error: java.io.FileNotFoundException: ...\Android Studio\jbr\lib\security\cacerts (Access is denied)
```

**Penyebab:** `mkcert` otomatis mendeteksi **Android Studio / Java** yang terinstal di sistem dan mencoba menambahkan CA certificate ke Java keystore. Namun file keystore tersebut membutuhkan akses Administrator, sehingga `mkcert` gagal (exit code 1) dan Next.js menganggap seluruh proses gagal.

**Cara memperbaiki (satu kali, permanen):**

1. Buka **PowerShell** (tidak perlu Administrator)

2. Jalankan perintah berikut untuk menyetel environment variable secara permanen:
   ```powershell
   [System.Environment]::SetEnvironmentVariable('TRUST_STORES', 'system', 'User')
   ```
   > Perintah ini memberitahu `mkcert` agar hanya menggunakan trust store sistem Windows dan melewati Java keystore.

3. **Tutup semua terminal**, lalu buka terminal baru agar environment variable aktif

4. Jika ada folder `certificates/` di root project, hapus terlebih dahulu:
   ```powershell
   Remove-Item -Recurse -Force certificates
   ```

5. Jalankan ulang aplikasi:
   ```powershell
   npm run dev
   ```

6. Pastikan output menunjukkan **HTTPS** berhasil:
   ```
   ✓ Certificates created in ...\certificates
   ▲ Next.js 16.x.x (Turbopack)
   - Local:         https://localhost:3000
   - Network:       https://0.0.0.0:3000
   ```

> **Catatan:** Fix ini bersifat permanen — tetap berlaku meskipun Anda menghapus repo, clone ulang, atau menjalankan `npm install` kembali.

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
