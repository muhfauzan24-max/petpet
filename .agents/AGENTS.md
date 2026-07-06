# 🛡️ Aturan Keamanan Project PetPlace

## ⚠️ Larangan Keras File Debug & Tanpa Proteksi di Folder API (`api/`)

1. **JANGAN PERNAH** membuat atau menyisakan file PHP di folder `api/` yang melakukan query, dump, atau memaparkan data database tanpa proteksi session/token auth (`requireAuth()` atau `requireAdmin()`).
2. **PROTEKSI WAJIB:** Semua endpoint API yang berurusan dengan data database harus diproteksi dengan memanggil fungsi auth yang ada di `config.php`:
   - `requireAuth()`: Untuk endpoint yang membutuhkan login pengguna (kios, dokter, grooming, user profile, dll).
   - `requireAdmin()`: Untuk endpoint administrasi panel kontrol.
3. **CRITICAL - DATA DESTRUCTION RISK:**
   - **JANGAN PERNAH** membuat berkas PHP di folder `api/` yang menjalankan perintah modifikasi data masif seperti `DELETE`, `UPDATE` (tanpa filter/auth), `DROP`, atau `TRUNCATE` ke database tanpa proteksi auth (`requireAuth()` atau `requireAdmin()`) di baris paling atas berkas.
   - Jika membutuhkan pembersihan data demo (cleanup) atau seeding, jalankan perintah tersebut secara manual lewat terminal VPS (`docker exec` langsung ke database) atau koneksi database lokal — **JANGAN PERNAH** membungkusnya menjadi berkas PHP yang dapat diakses publik via URL browser.
4. **DEBUG LOKAL SAJA:** Proses debugging database, pengetesan schema, dump pengguna, atau seeding harus dilakukan langsung di database lokal (DB Client) atau melalui file terproteksi. **JANGAN PERNAH** menyimpan atau melakukan commit/push file debug (seperti `check_db_users.php`, `check_kios_schema.php`, `check_naomi.php`) ke repository git atau server production.
5. **HAPUS FILE DEBUG:** Jika menemukan file debug tanpa proteksi di folder `api/`, segera hapus file tersebut demi keamanan data.
