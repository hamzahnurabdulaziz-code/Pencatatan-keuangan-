# UangKu – Catatan Keuangan Harian 💰

> **Aplikasi web pencatatan keuangan pribadi modern, ringan, responsif, dan 100% offline-ready tanpa backend atau login.**

![UangKu Preview](assets/logo.svg)

---

## 📌 Tentang UangKu

**UangKu** dirancang untuk membantu pengguna mengelola keuangan pribadi dengan cara yang sederhana, cepat, transparan, dan nyaman digunakan setiap hari. Semua data tersimpan aman di dalam peramban (*browser*) Anda menggunakan teknologi `localStorage`, sehingga tidak memerlukan registrasi, kata sandi, ataupun server backend.

---

## ✨ Fitur Utama

### 1. 📊 Dashboard Finansial Pintar
- **Ringkasan Saldo Otomatis**: Menampilkan total pemasukan, total pengeluaran, dan sisa saldo secara *real-time*.
- **Indikator Kesehatan Finansial**: Label kondisi keuangan dinamis (Kondisi Prima, Terkendali, atau Defisit/Waspada).
- **Grafik Proporsi Pengeluaran**: Diagram donat interaktif (*Chart.js*) yang memetakan pengeluaran per kategori secara visual dengan persentase dan format Rupiah.
- **Daftar Transaksi Terbaru**: Menampilkan 6 transaksi terakhir dengan akses cepat untuk ubah (*edit*) dan hapus.
- **Tips Finansial 50/30/20**: Panduan alokasi keuangan praktis untuk pemula.

### 2. 📝 Manajemen Transaksi Lengkap
- **Pencatatan Cepat**: Beralih mudah antara jenis transaksi **Pemasukan** (🟢) dan **Pengeluaran** (🔴).
- **Pratinjau Nominal Interaktif**: Konversi live saat mengetik nominal ke dalam format Rupiah terbaca (misal: `50000` &rarr; `Rp 50.000`).
- **Kategori Beragam**: Tersedia ikon dan kategori lengkap (Gaji, Freelance, Bisnis, Makanan & Minuman, Belanja, Tagihan, Transportasi, Kesehatan, Hiburan, dll.).
- **Pencarian Live**: Temukan transaksi berdasarkan keterangan atau nama kategori secara instan.
- **Filter Multi-Kriteria**:
  - Filter berdasarkan jenis (Semua / Pemasukan Saja / Pengeluaran Saja).
  - Filter kategori spesifik.
  - Filter periode (Hari Ini, Bulan Ini, 7 Hari Terakhir, 30 Hari Terakhir, atau Rentang Tanggal Manual).
- **Pengurutan Fleksibel**: Urutkan berdasarkan tanggal terbaru/terlama atau nominal terbesar/terkecil.
- **Banner Ringkasan Filter**: Mengetahui total pemasukan, pengeluaran, dan selisih spesifik dari data yang sedang difilter.
- **Paginasi Halaman**: Navigasi nyaman untuk riwayat transaksi yang banyak.
- **Konfirmasi Hapus Aman**: Dialog konfirmasi modal khusus dengan pratinjau data sebelum penghapusan dilakukan.

### 3. 📈 Laporan & Analitik Bulanan
- **Seleksi Periode Fleksibel**: Pilih bulan dan tahun yang ingin dianalisis.
- **Metrik Kunci**: Total Pemasukan, Pengeluaran, Tabungan Bersih (*Net Savings*), *Savings Rate* (%), serta Rata-rata Pengeluaran per Hari.
- **Grafik Arus Kas 6 Bulan**: Bar chart perbandingan tren pemasukan vs pengeluaran 6 bulan terakhir.
- **Bilah Kemajuan Kategori (*Progress Bars*)**: Visualisasi proporsi pengeluaran per kategori terurut dari yang terbesar.
- **Cetak / Simpan PDF**: Tampilan ramah cetak (*print-friendly*) yang otomatis menyembunyikan sidebar dan navigasi saat dicetak atau disimpan ke PDF.
- **Ekspor CSV**: Mengunduh seluruh transaksi ke file `.csv` dengan encoding UTF-8 BOM agar rapi dan kompatibel dibuka di Microsoft Excel.

### 4. 💾 Cadangan & Pemulihan Data (*Backup & Restore*)
- **Ekspor Cadangan JSON**: Salin seluruh basis data transaksi ke file `.json`.
- **Impor Cadangan JSON**:
  - Opsi **Gantikan Semua (*Replace*)**: Memulihkan data dari cadangan secara menyeluruh.
  - Opsi **Gabungkan (*Merge*)**: Menambahkan data dari file cadangan tanpa menghapus data yang ada.
- **Data Demo 1-Klik**: Muat contoh transaksi untuk langsung mencoba seluruh visualisasi grafik.
- **Reset Basis Data**: Bersihkan seluruh data lokal jika ingin memulai pembukuan baru dari nol.

---

## 🎨 Desain UI & UX

- **Palet Warna Profesional**: Warna dasar biru (*Royal Blue*), putih, dan abu-abu (*Slate*) yang bersih dan modern.
- **Dual-Layout Responsif**:
  - **Desktop / Laptop**: *Sidebar* tetap (*persistent navigation*) dengan visual elegan dan tabel berdensitas rapi.
  - **Mobile / Tablet**: *Top header* ringkas, kartu transaksi ramah sentuh (*touch-friendly*), dan *Bottom Navigation Bar* dengan tombol tambah melayang (*Floating Action Button / FAB*).
- **Animasi Ringan & Halus**: Transisi modal, *backdrop blur*, efek elevasi kartu, dan *toast notifications*.
- **Pencegahan XSS & Keamanan Input**:
  - Sanitasi karakter pengguna melalui fungsi `escapeHtml()`.
  - Validasi ketat nominal > 0 dan pencegahan `NaN`.
  - Penggunaan `textContent` dan sanitasi DOM.

---

## 📁 Struktur Folder Proyek

```text
pencatatan-keuangan/
├── index.html              # Halaman utama (Single Page Application)
├── vercel.json             # Konfigurasi deployment & security headers Vercel
├── .gitignore              # Daftar file yang diabaikan oleh Git
├── README.md               # Dokumentasi lengkap proyek
├── assets/
│   ├── favicon.svg         # Favicon vektor aplikasi
│   └── logo.svg            # Logo vektor resmi UangKu
├── css/
│   └── style.css           # Styling inti, animasi keyframes, dan mode cetak (print)
└── js/
    ├── utils.js            # Fungsi helper (Format Rupiah, tanggal, sanitasi XSS, ID)
    ├── store.js            # Lapisan data LocalStorage & kalkulasi statistik
    ├── charts.js           # Integrasi visualisasi grafik Chart.js
    ├── export-import.js    # Logika ekspor CSV (UTF-8 BOM) & cadangan JSON
    ├── ui.js               # Pengendali DOM, modal, filter, paginasi, dan notifikasi
    └── app.js              # Inisialisasi awal aplikasi (Bootstrap)
```

---

## 🚀 Panduan Menjalankan di Visual Studio Code (Lokal)

Anda dapat menjalankan website ini di komputer lokal dengan beberapa cara mudah:

### Cara 1: Menggunakan Ekstensi VS Code "Live Server" (Direkomendasikan)
1. Buka folder proyek ini di **Visual Studio Code**.
2. Masuk ke menu **Extensions** (tekan `Ctrl + Shift + X`).
3. Cari ekstensi bernama **"Live Server"** buatan *Ritwick Dey*, lalu klik **Install**.
4. Buka file `index.html`.
5. Klik kanan pada editor dan pilih **"Open with Live Server"**, atau klik tombol **"Go Live"** di pojok kanan bawah jendela VS Code.
6. Peramban (*browser*) Anda akan otomatis terbuka di `http://127.0.0.1:5500`.

### Cara 2: Menjalankan dengan Node.js (npx serve)
Jika Anda memiliki Node.js di komputer:
```bash
npx serve .
```
Lalu buka alamat yang tertera (biasanya `http://localhost:3000`).

### Cara 3: Menjalankan dengan Python
Jika Anda memiliki Python 3 terpasang:
```bash
python -m http.server 8000
```
Buka peramban di `http://localhost:8000`.

### Cara 4: Buka Langsung di Browser
Anda juga dapat langsung mengklik dua kali (*double click*) file `index.html` untuk membukanya di Chrome, Edge, Firefox, atau Safari.

---

## 🌐 Panduan Deployment ke GitHub & Vercel

Website ini 100% statis (*zero build step*), sehingga siap dideploy ke **Vercel** dalam hitungan detik.

### Langkah 1: Unggah Proyek ke GitHub
1. Buat repositori baru di [GitHub](https://github.com/new), misalnya beri nama `uangku-catatan-keuangan`.
2. Buka terminal pada folder proyek ini di komputer Anda, lalu jalankan perintah berikut:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi awal website UangKu"
   git branch -M main
   git remote add origin https://github.com/USERNAME-ANDA/uangku-catatan-keuangan.git
   git push -u origin main
   ```

### Langkah 2: Hubungkan dan Deploy di Vercel
1. Kunjungi [vercel.com](https://vercel.com) dan masuk menggunakan akun GitHub Anda.
2. Klik tombol **"Add New..."** &rarr; **"Project"**.
3. Pilih repositori **`uangku-catatan-keuangan`** yang baru saja Anda unggah, lalu klik **"Import"**.
4. Pada halaman konfigurasi:
   - **Framework Preset**: Pilih `Other` (atau biarkan default).
   - **Root Directory**: `./` (default).
   - **Build Command**: Kosongkan (karena merupakan situs web statis murni).
   - **Output Directory**: Kosongkan.
5. Klik tombol **"Deploy"**.
6. Dalam waktu kurang dari 30 detik, website Anda telah online dengan URL live (misal: `https://uangku-catatan-keuangan.vercel.app`).

Setiap kali Anda melakukan `git push` ke branch `main`, Vercel akan otomatis memperbarui website Anda secara gratis!

---

## 🧪 Rangkuman Pengujian Sistem

| Pengujian | Status | Catatan |
|---|:---:|---|
| **Pencatatan Pemasukan & Pengeluaran** | ✅ Berhasil | Nominal divalidasi > 0, tipe dan kategori tersimpan akurat. |
| **Kalkulasi Saldo Kas** | ✅ Berhasil | Perhitungan otomatis: `Saldo = Pemasukan - Pengeluaran`, bebas `NaN`. |
| **Persistensi Data (localStorage)** | ✅ Berhasil | Data tetap utuh dan tersimpan setelah halaman direfresh atau browser ditutup. |
| **Grafik Interaktif (Chart.js)** | ✅ Berhasil | Diagram donat kategori dan diagram batang bulanan merespons data dinamis. |
| **Filter & Pencarian Instan** | ✅ Berhasil | Pencarian teks, filter tanggal (hari ini, bulan ini, custom), dan kategori bekerja mulus. |
| **Paginasi Data** | ✅ Berhasil | Berpindah halaman 10 transaksi per halaman dengan navigasi sebelumnya/berikutnya. |
| **Ekspor CSV (Excel UTF-8 BOM)** | ✅ Berhasil | Kolom rapi, format angka Rupiah dan tanggal terbaca sempurna di Excel. |
| **Cadangan & Pemulihan JSON** | ✅ Berhasil | Mode *Replace* dan *Merge* tervalidasi dengan proteksi struktur data rusak. |
| **Responsivitas Perangkat** | ✅ Berhasil | Tampilan optimal di layar ponsel (320px+), tablet, hingga layar monitor desktop. |
| **Keamanan XSS** | ✅ Berhasil | Semua teks deskripsi dan kategori disanitasi sebelum ditampilkan ke DOM. |

---

## 📄 Lisensi & Hak Cipta

Dibuat dengan ❤️ untuk membantu pengelolaan keuangan harian masyarakat Indonesia.  
Bebas digunakan untuk keperluan pribadi, pembelajaran, maupun portofolio pengembang web (*open-source*).
