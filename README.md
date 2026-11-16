# SILAPOR-SAMPAH

Sistem Informasi Laporan Sampah berbasis Web untuk Dinas Lingkungan Hidup.

## Fitur

- **Pelaporan Warga**: Pengguna dapat melaporkan tumpukan sampah.
- **Manajemen**: Admin dapat mengelola laporan dan petugas.
- **Notifikasi**: Pemberitahuan real-time melalui WhatsApp.

## Instalasi & Setup

### Prasyarat

- PHP >= 7.4
- MySQL >= 5.7
- Composer
- Node.js (untuk fitur WhatsApp)

### 1. Clone Repository

```bash
git clone https://github.com/user/silaporsampah.git
cd silahorsampah
```

### 2. Instal Dependencies

```bash
composer install
cd vendor/whatsapp-stream-api
npm install
cd ../../
```

### 3. Database

Buat database `silapor_sampah` dan import file SQL (jika ada).

```bash
mysql -u root -p silapor_sampah < database.sql
```

### 4. Environment Variables

Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Edit file `.env` sesuai konfigurasi Anda (database, email, WhatsApp, dll).

### 5. Jalankan Server

```bash
php artisan serve
```

Untuk fitur WhatsApp, jalankan juga:

```bash
cd vendor/whatsapp-stream-api
npm start
cd ../../
```