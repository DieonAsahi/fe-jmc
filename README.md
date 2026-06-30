# Human Resource Management System (Technical Test)

## Deskripsi

Project ini merupakan Tes Kemampuan Dasar Fullstack Programmer dari JMC yang berfokus pada pengembangan sistem informasi Human Resource Management (HRM).

Aplikasi dikembangkan menggunakan Vue Fullstack (Nuxt 3 + Nitro) sehingga frontend dan backend berada dalam satu project. Sistem menerapkan Role Based Access Control (RBAC), autentikasi menggunakan JWT, validasi data pada sisi client maupun server, serta integrasi Google reCAPTCHA pada proses login.

Database awal yang diberikan hanya berisi struktur beberapa tabel utama tanpa data. Data master disediakan dalam bentuk source code PHP Yii (Seeder), sehingga proses awal yang dilakukan adalah menjalankan project PHP tersebut untuk melakukan proses seeding database. Setelah seluruh data master berhasil diimport ke database MySQL, proses pengembangan aplikasi dilanjutkan menggunakan Nuxt Fullstack.

---

# Akses
- username : superadmin, password : superadmin123
- username : manager_hrd, password : manager123
- username : admin_hrd, password : adminhrd123

---

# Tech Stack

- Nuxt 3
- Vue 3
- Nitro Server
- MySQL
- XAMPP
- JWT Authentication
- Google reCAPTCHA
- Tailwind CSS
- TypeScript

---

# Requirement

Pastikan software berikut sudah terinstall.

- Node.js LTS
- npm
- XAMPP (Apache & MySQL)
- Git

---

# Setup Database

## 1. Jalankan XAMPP

Aktifkan:

- Apache
- MySQL

---

## 2. Buat Database

Buat database baru, misalnya:

```
kepegawaian_db
```

Import file SQL yang diberikan pada soal.

Database awal hanya berisi struktur tabel dan beberapa master table tanpa data.

---

## 3. Import Data Seeder

Data master tidak tersedia di file SQL.

Data diberikan dalam bentuk source code PHP Yii.

Langkah yang dilakukan:

- Jalankan project PHP Yii yang disediakan.
- Jalankan proses seeding sesuai mekanisme pada project tersebut.
- Setelah proses selesai, seluruh master data akan terisi pada database MySQL.

Setelah data berhasil masuk, project PHP tidak lagi digunakan.

Selanjutnya seluruh proses pengembangan dilakukan menggunakan Nuxt Fullstack.

---

# Konfigurasi Environment

Copy file

```
.env.example
```

menjadi

```
.env
```

Contoh konfigurasi:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=technical_test
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=your-secret-key

RECAPTCHA_SECRET_KEY=xxxxxxxx
NUXT_PUBLIC_RECAPTCHA_SITE_KEY=xxxxxxxx
```

Sesuaikan konfigurasi database dan Google reCAPTCHA dengan environment masing-masing.

---

# Install Dependency

```bash
npm install
```

---

# Menjalankan Project

Development

```bash
npm run dev
```

Default

```
http://localhost:3000
```

---

# Build Production

```bash
npm run build
```

Menjalankan hasil build

```bash
npm run preview
```

---

# Fitur

## Authentication

- Login menggunakan:
    - Username
    - Email
    - Nomor Handphone
- Google reCAPTCHA
- Remember Me
- Session Timeout
- JWT Authentication

---

## Role Management

- List Role
- Detail Hak Akses (View Only)

---

## User Management

- CRUD User
- Aktivasi / Nonaktif User
- Auto Generate Password
- Validasi Username
- Autosuggestion Pegawai

---

## Dashboard

Dashboard menyesuaikan role pengguna.

Manager HRD mendapatkan:

- Widget Statistik
- Doughnut Chart
- Data Pegawai Terbaru

---

## Employee Management

- CRUD Pegawai
- Upload Foto
- Search
- Filter
- Sorting
- Pagination
- Bulk Action
- Export PDF
- Export Excel

---

## Transport Allowance

- Setting Base Fare
- Perhitungan otomatis tunjangan transport
- Perhitungan mengikuti seluruh rule pada soal
- Riwayat hasil perhitungan

---

## Activity Log

Mencatat aktivitas pengguna seperti:

- Login
- Logout
- Create
- Update
- Delete
- Read

---

# Security

Implementasi keamanan yang digunakan:

- Password Hashing
- JWT Authentication
- Input Validation
- SQL Injection Prevention
- XSS Protection
- CSRF Protection
- Google reCAPTCHA

---

# Struktur Project

```
app/
components/
layouts/
middleware/
pages/
server/
server/api/
server/utils/
server/services/
server/repositories/
server/models/
public/
assets/
```

---

# Catatan

Beberapa asumsi dibuat selama proses implementasi karena tidak seluruh requirement dijelaskan secara rinci pada dokumen soal.

Seluruh asumsi tetap mengikuti alur bisnis yang dijelaskan pada technical test dan tidak mengubah tujuan utama sistem.

```

---

## API Documentation

Dokumentasi API tersedia menggunakan Swagger.

Berisi informasi mengenai:

- Endpoint
- Request
- Response
- Authentication
- Status Code

Swagger dapat diakses setelah aplikasi dijalankan pada:

```
/api/docs
```

---