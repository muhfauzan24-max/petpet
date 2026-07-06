# Aturan Wajib untuk Antigravity — Proyek PetPlace

Dokumen ini berisi aturan yang WAJIB diikuti terkait deployment proyek ini.
Pelanggaran aturan ini sudah pernah menyebabkan 22 commit macet, CI/CD
gagal total, DAN 2 insiden keamanan data nyata. Jangan diulang.

---

## 1. JANGAN edit file langsung di VPS lewat SSH tanpa commit & push

**Kesalahan yang pernah terjadi:** File `api/config.php` dan `api/produk.php`
diedit langsung di server (lewat SSH) untuk keperluan debugging/fix cepat,
tapi TIDAK PERNAH di-commit ke Git. Akibatnya, setiap `git pull` berikutnya
di CI/CD GAGAL karena Git menolak menimpa perubahan lokal yang belum
di-commit. Ini membuat 22 commit fix macet tidak pernah sampai ke
production selama berhari-hari, walau kelihatannya sudah "di-push ke GitHub".

**Aturan:**
- Kalau kamu (Antigravity) SSH ke VPS dan mengedit file apapun secara manual,
  **WAJIB** langsung commit & push perubahan itu sebelum melakukan apapun lagi:
```bash
  cd /var/www/myapp/petpet
  git add .
  git commit -m "deskripsi perubahan"
  git push origin main
```
- Sebelum edit manual di VPS, SELALU cek dulu: `git status`
- Lebih baik lagi: **hindari edit manual di VPS sama sekali.** Edit di
  local/laptop, push, biarkan CI/CD yang deploy.

---

## 2. JANGAN tambah langkah build yang butuh tool yang tidak ada di host VPS

**Kesalahan yang pernah terjadi:** Ditambahkan langkah `npm ci` / `npm run build`
langsung di VPS (host) ke `deploy.yml`. VPS ini TIDAK PERNAH di-install
Node.js/npm — hanya Docker. Setiap deploy gagal dengan error
`Command 'npm' not found`, dan karena `set -e`, seluruh proses berhenti.

**Aturan:**
- React/Vite **SUDAH** di-build otomatis di dalam `Dockerfile.frontend`
  lewat multi-stage build. Ini berjalan DI DALAM container, TIDAK BUTUH
  npm di host VPS.
- **JANGAN PERNAH** menambahkan `npm install/build/ci` langsung di host VPS.
- Kalau frontend butuh di-rebuild, cukup: `docker compose up -d --build`

---

## 3. `deploy.yml` harus tetap SEDERHANA

**Kesalahan yang pernah terjadi:** `deploy.yml` di-edit berulang kali
dengan patch seperti `docker cp` manual, `--no-cache` di setiap build,
jalankan seeder manual, dan build React di host. Ini bikin workflow
makin rapuh dan gagal di step berbeda-beda.

**Versi yang benar dan harus dipertahankan:**
```yaml
name: Deploy to VPS
on:
  push:
    branches:
      - main
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: SSH and Deploy
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            set -e
            cd ${{ secrets.VPS_PROJECT_PATH }}
            git pull origin main
            docker compose up -d --build
```

**Aturan:**
- Diagnosis dulu akar masalah sebelum menambah langkah baru ke `deploy.yml`.
- `docker compose build --no-cache` JANGAN dipakai sebagai default.
- Migrasi/seed database BUKAN bagian dari setiap deploy.

---

## 4. Sebelum lapor "kode sudah benar tapi belum aktif di production"

**Aturan sebelum menyimpulkan bug "production belum update":**
1. Cek `git status`, `git log --oneline -5` di VPS
2. Bandingkan `git log origin/main` vs `git log main`
3. Cek riwayat GitHub Actions (`/actions`)
4. Cek bundle yang benar-benar disajikan:
```bash
   docker exec petplace-frontend ls /usr/share/nginx/html/assets/
   curl -sk https://petpelace.store/ | grep -o 'index-[^"]*\.\(js\|css\)'
```
   Kalau hash file sama, deployment SUDAH sinkron — cari masalah lain
   (misal cache browser).

---

## 5. File infrastruktur harus di Git

`docker-compose.yml`, `Dockerfile.*`, `nginx.conf` harus ter-commit ke Git
(kecuali `.env`, yang harus tetap di luar Git demi keamanan kredensial).

---

## 6. JANGAN PERNAH buat file diagnostic/debug/cleanup di folder `api/` tanpa proteksi auth

**Kejadian nyata #1:** File `check_db_users.php`, `check_kios_schema.php`,
`check_naomi.php` MEMBOCORKAN data asli semua user (nama, email, role) ke
publik tanpa proteksi login sama sekali.

**Kejadian nyata #2 (lebih parah):** File `clean_db.php` berisi PERINTAH
DELETE ke database (user, pesanan, pembayaran, chat, kategori produk) —
TANPA proteksi login, bisa dipicu SIAPA SAJA hanya dengan membuka URL-nya
di browser. Risikonya BUKAN cuma bocor data, tapi MENGHAPUS DATA
PRODUCTION SECARA PERMANEN.

**Aturan:**
- **JANGAN PERNAH** buat file PHP di `api/` yang query/dump ATAU
  menghapus/mengubah data database tanpa `requireAuth()`/`requireAdmin()`
  di baris paling atas file. Berlaku SANGAT KETAT untuk file yang
  mengandung `DELETE`, `UPDATE`, `DROP`, `TRUNCATE`.
- Kalau butuh debug/cleanup sementara, lakukan di **local/laptop saja**,
  JANGAN push ke repo/production sama sekali.
- Kalau terlanjur push, **segera hapus**.
- Sebelum setiap push, cek `git status` dan `git diff --stat` untuk
  pastikan tidak ada file berpola `check_*.php`, `debug_*.php`,
  `test_*.php`, `clean_*.php`, `delete_*.php`, `reset_*.php` yang tidak
  sengaja ikut ter-commit.
- Kalau butuh cleanup data yang sah, jalankan lewat `docker exec`
  langsung ke database dari terminal VPS (manual, sadar), JANGAN
  dibungkus jadi endpoint HTTP publik.

---

## Ringkasan cepat (TL;DR)

| Jangan | Lakukan sebagai gantinya |
|---|---|
| Edit file di VPS lewat SSH tanpa commit | Selalu `git add && commit && push` setelah edit manual |
| Tambah `npm install/build` di host VPS | Biarkan Docker yang build React |
| Tambah patch baru ke `deploy.yml` tanpa diagnosis | Cek `git status`, log Actions, dan hash bundle dulu |
| Pakai `--no-cache` setiap build | Biarkan Docker cache normal |
| Simpulkan bug dari kode saja | Verifikasi langsung ke server sebelum lapor bug |
| Push file `check_*.php`/`clean_*.php`/`debug_*.php` tanpa auth ke `api/` | Selalu pakai `requireAuth()`/`requireAdmin()`, atau jangan push sama sekali |
