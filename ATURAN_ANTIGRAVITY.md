# Aturan Wajib untuk Antigravity — Proyek PetPlace

Dokumen ini berisi aturan yang WAJIB diikuti terkait deployment proyek ini.
Pelanggaran aturan ini sudah pernah menyebabkan 22 commit macet dan
CI/CD gagal total selama beberapa hari. Jangan diulang.

---

## 1. JANGAN edit file langsung di VPS lewat SSH tanpa commit & push

**Kesalahan yang pernah terjadi:** File `api/config.php` dan `api/produk.php`
diedit langsung di server (lewat SSH) untuk keperluan debugging/fix cepat,
tapi TIDAK PERNAH di-commit ke Git. Akibatnya, setiap `git pull` berikutnya
di CI/CD GAGAL karena Git menolak menimpa perubahan lokal yang belum
di-commit. Ini membuat 22 commit fix (termasuk fix bug penting) macet
tidak pernah sampai ke production selama berhari-hari, walau kelihatannya
sudah "di-push ke GitHub".

**Aturan:**
- Kalau kamu (Antigravity) SSH ke VPS dan mengedit file apapun secara manual,
  **WAJIB** langsung commit & push perubahan itu sebelum melakukan apapun lagi:
```bash
  cd /var/www/myapp/petpet
  git add .
  git commit -m "deskripsi perubahan"
  git push origin main
```
- Sebelum edit manual di VPS, SELALU cek dulu apakah ada perubahan lokal
  yang belum di-commit:
```bash
  git status
```
  Kalau ada, selesaikan itu dulu (commit atau discard) sebelum lanjut.
- Lebih baik lagi: **hindari edit manual di VPS sama sekali.** Edit di
  local/laptop, push, biarkan CI/CD yang deploy. VPS harus dianggap
  "read-only" kecuali untuk keperluan darurat/diagnosis.

---

## 2. JANGAN tambah langkah build yang butuh tool yang tidak ada di host VPS

**Kesalahan yang pernah terjadi:** Ditambahkan langkah `npm ci` / `npm run build`
langsung di VPS (host, bukan di dalam Docker) ke `deploy.yml`. VPS ini
TIDAK PERNAH di-install Node.js/npm — hanya Docker yang terinstall.
Akibatnya setiap deploy gagal di step itu dengan error
`Command 'npm' not found`, dan karena `set -e`, seluruh proses deploy
berhenti total sebelum sampai ke Docker rebuild.

**Aturan:**
- React/Vite **SUDAH** di-build otomatis di dalam `Dockerfile.frontend`
  lewat multi-stage build. Ini berjalan DI DALAM container, TIDAK BUTUH
  npm di host VPS.
- **JANGAN PERNAH** menambahkan `npm install`, `npm run build`, `npm ci`,
  atau perintah Node.js apapun yang dijalankan langsung di host VPS
  lewat `deploy.yml` atau script SSH manual.
- Kalau frontend butuh di-rebuild, cukup:
```bash
  docker compose up -d --build
```

---

## 3. `deploy.yml` harus tetap SEDERHANA

**Kesalahan yang pernah terjadi:** `deploy.yml` di-edit berulang kali
dengan menambahkan patch-patch seperti `docker cp` manual, `--no-cache`
di setiap build, jalankan seeder database manual, dan build React di
host. Ini membuat workflow makin rapuh.

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
- Kalau ada masalah deploy, **DIAGNOSIS DULU** akar masalahnya sebelum
  menambah langkah baru ke `deploy.yml`.
- `docker compose build --no-cache` **JANGAN** dipakai sebagai default.
- Migrasi/seed database **BUKAN** bagian dari setiap deploy.

---

## 4. Sebelum lapor "kode sudah benar tapi belum aktif di production"

**Aturan sebelum menyimpulkan bug "production belum update":**
1. Cek dulu status Git di VPS: `git status`, `git log --oneline -5`
2. Bandingkan `git log origin/main` vs `git log main` di VPS
3. Cek riwayat GitHub Actions (`/actions`)
4. Cek bundle yang benar-benar disajikan:
```bash
   docker exec petplace-frontend ls /usr/share/nginx/html/assets/
   curl -sk https://petpelace.store/ | grep -o 'index-[^"]*\.\(js\|css\)'
```

---

## 5. File infrastruktur harus di Git

`docker-compose.yml`, `Dockerfile.*`, `nginx.conf` harus ter-commit ke Git
(kecuali `.env`, yang harus tetap di luar Git demi keamanan kredensial).

---

## 6. JANGAN PERNAH buat file diagnostic/debug di folder `api/` tanpa proteksi auth

**Kejadian nyata:** File `check_db_users.php`, `check_kios_schema.php`, dan
`check_naomi.php` sempat MEMBOCORKAN data asli semua user (nama lengkap,
email, role, status) ke publik tanpa proteksi login sama sekali.

**Aturan:**
- **JANGAN PERNAH** buat file PHP di `api/` yang query/dump data database
  tanpa memanggil `requireAuth()` atau `requireAdmin()` di baris paling
  atas file.
- Kalau butuh debug sementara, lakukan di **local/laptop saja**, JANGAN
  push file debug ke repo/production.
- Kalau terlanjur push, **segera hapus**.
- Sebelum setiap push, cek `git status` dan `git diff --stat` untuk
  pastikan tidak ada file `check_*.php`/`debug_*.php`/`test_*.php` yang
  tidak sengaja ikut ter-commit.

---

## Ringkasan cepat (TL;DR)

| Jangan | Lakukan sebagai gantinya |
|---|---|
| Edit file di VPS lewat SSH tanpa commit | Selalu `git add && commit && push` setelah edit manual |
| Tambah `npm install/build` di host VPS | Biarkan Docker yang build React |
| Tambah patch baru ke `deploy.yml` tanpa diagnosis | Cek `git status`, log Actions, dan hash bundle dulu |
| Pakai `--no-cache` setiap build | Biarkan Docker cache normal |
| Simpulkan bug dari kode saja | Verifikasi langsung ke server sebelum lapor bug |
| Push file `check_*.php`/`debug_*.php` tanpa auth ke `api/` | Selalu pakai `requireAuth()`/`requireAdmin()`, atau jangan push |
