-- ============================================================
-- DATABASE: petplace
-- Platform Marketplace Hewan Peliharaan (Kucing & Anjing)
-- Lokasi: Sulawesi Selatan, Indonesia
-- ============================================================

DROP DATABASE IF EXISTS petplace;
CREATE DATABASE petplace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE petplace;

-- ============================================================
-- 1. PENGGUNA (semua user yang register)
-- ============================================================
CREATE TABLE pengguna (
  id_pengguna     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama_lengkap    VARCHAR(100) NOT NULL,
  email           VARCHAR(150) NOT NULL UNIQUE,
  password        VARCHAR(255) NOT NULL,
  no_telepon      VARCHAR(20) DEFAULT NULL,
  foto_profil     VARCHAR(255) DEFAULT NULL,
  jenis_kelamin   ENUM('L','P','lainnya') DEFAULT NULL,
  tanggal_lahir   DATE DEFAULT NULL,
  peran           ENUM('pembeli','owner','dokter','grooming','admin') DEFAULT 'pembeli',
  status          ENUM('aktif','nonaktif','banned') DEFAULT 'aktif',
  email_verified  TINYINT(1) DEFAULT 0,
  ip_terakhir     VARCHAR(45) DEFAULT NULL,
  kota            VARCHAR(100) DEFAULT NULL,
  provinsi        VARCHAR(100) DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 2. SESI LOGIN / TOKEN AUTENTIKASI
-- ============================================================
CREATE TABLE sesi_login (
  id_sesi         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pengguna     INT UNSIGNED NOT NULL,
  token           VARCHAR(512) NOT NULL UNIQUE,
  ip_address      VARCHAR(45) DEFAULT NULL,
  user_agent      TEXT DEFAULT NULL,
  lokasi_kota     VARCHAR(100) DEFAULT NULL,
  expired_at      TIMESTAMP NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sesi_pengguna FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 3. ALAMAT PENGGUNA
-- ============================================================
CREATE TABLE alamat_pengguna (
  id_alamat       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pengguna     INT UNSIGNED NOT NULL,
  label           VARCHAR(50) DEFAULT 'Rumah',
  nama_penerima   VARCHAR(100) NOT NULL,
  no_telepon      VARCHAR(20) NOT NULL,
  provinsi        VARCHAR(100) NOT NULL,
  kota            VARCHAR(100) NOT NULL,
  kecamatan       VARCHAR(100) NOT NULL,
  kelurahan       VARCHAR(100) NOT NULL,
  kode_pos        VARCHAR(10) DEFAULT NULL,
  alamat_lengkap  TEXT NOT NULL,
  lat             DECIMAL(10,8) DEFAULT NULL,
  lng             DECIMAL(11,8) DEFAULT NULL,
  is_utama        TINYINT(1) DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_alamat_pengguna FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 4. LOG AKTIVITAS (IP Tracking)
-- ============================================================
CREATE TABLE log_aktivitas (
  id_log          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pengguna     INT UNSIGNED DEFAULT NULL,
  tipe_aksi       VARCHAR(50) NOT NULL COMMENT 'login, register, view_product, dll',
  ip_address      VARCHAR(45) NOT NULL,
  user_agent      TEXT DEFAULT NULL,
  kota            VARCHAR(100) DEFAULT NULL,
  provinsi        VARCHAR(100) DEFAULT NULL,
  negara          VARCHAR(100) DEFAULT NULL,
  detail          TEXT DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_log_pengguna FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 5. KIOS (toko milik owner)
-- ============================================================
CREATE TABLE kios (
  id_kios         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pengguna     INT UNSIGNED NOT NULL,
  nama_kios       VARCHAR(150) NOT NULL,
  slug            VARCHAR(170) NOT NULL UNIQUE,
  deskripsi       TEXT DEFAULT NULL,
  logo            VARCHAR(255) DEFAULT NULL,
  banner          VARCHAR(255) DEFAULT NULL,
  no_telepon      VARCHAR(20) DEFAULT NULL,
  email_kios      VARCHAR(150) DEFAULT NULL,
  jam_buka        TIME DEFAULT NULL,
  jam_tutup       TIME DEFAULT NULL,
  hari_operasi    VARCHAR(100) DEFAULT 'Senin-Sabtu',
  qris_image      VARCHAR(255) DEFAULT NULL,
  no_rekening     VARCHAR(50) DEFAULT NULL,
  nama_bank       VARCHAR(50) DEFAULT NULL,
  nama_pemilik_rek VARCHAR(100) DEFAULT NULL,
  persen_komisi   DECIMAL(5,2) DEFAULT 10.00 COMMENT 'persen komisi platform',
  total_penjualan DECIMAL(14,2) DEFAULT 0,
  status          ENUM('aktif','nonaktif','pending','suspend') DEFAULT 'pending',
  verified        TINYINT(1) DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_kios_pengguna FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 6. LOKASI KIOS (untuk Leaflet Map)
-- ============================================================
CREATE TABLE lokasi_kios (
  id_lokasi       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_kios         INT UNSIGNED NOT NULL,
  tipe            ENUM('kios','dokter','grooming') DEFAULT 'kios',
  alamat_lengkap  TEXT NOT NULL,
  kecamatan       VARCHAR(100) DEFAULT NULL,
  kota            VARCHAR(100) DEFAULT 'Makassar',
  provinsi        VARCHAR(100) DEFAULT 'Sulawesi Selatan',
  lat             DECIMAL(10,8) NOT NULL,
  lng             DECIMAL(11,8) NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lokasi_kios FOREIGN KEY (id_kios) REFERENCES kios(id_kios) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 7. KATEGORI PRODUK
-- ============================================================
CREATE TABLE kategori_produk (
  id_kategori     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama_kategori   VARCHAR(100) NOT NULL,
  slug            VARCHAR(120) NOT NULL UNIQUE,
  jenis_hewan     ENUM('kucing','anjing','semua') NOT NULL DEFAULT 'semua',
  tipe_produk     ENUM('makanan','pasir','mainan','aksesoris','kesehatan','lainnya') NOT NULL,
  deskripsi       TEXT DEFAULT NULL,
  icon            VARCHAR(255) DEFAULT NULL,
  urutan          INT DEFAULT 0,
  status          ENUM('aktif','nonaktif') DEFAULT 'aktif',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 8. PRODUK
-- ============================================================
CREATE TABLE produk (
  id_produk       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_kios         INT UNSIGNED NOT NULL,
  id_kategori     INT UNSIGNED NOT NULL,
  nama_produk     VARCHAR(200) NOT NULL,
  slug            VARCHAR(220) NOT NULL UNIQUE,
  deskripsi       TEXT DEFAULT NULL,
  jenis_hewan     ENUM('kucing','anjing') NOT NULL,
  tipe_produk     ENUM('makanan','pasir','mainan','aksesoris','kesehatan','lainnya') NOT NULL,
  harga           DECIMAL(12,2) NOT NULL,
  harga_diskon    DECIMAL(12,2) DEFAULT NULL,
  berat_gram      DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'berat satuan dalam gram',
  foto_utama      VARCHAR(255) DEFAULT NULL,
  terjual         INT DEFAULT 0,
  rating_avg      DECIMAL(3,2) DEFAULT 0.00,
  total_ulasan    INT DEFAULT 0,
  status          ENUM('aktif','nonaktif','habis') DEFAULT 'aktif',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_produk_kios FOREIGN KEY (id_kios) REFERENCES kios(id_kios) ON DELETE CASCADE,
  CONSTRAINT fk_produk_kategori FOREIGN KEY (id_kategori) REFERENCES kategori_produk(id_kategori)
) ENGINE=InnoDB;

-- ============================================================
-- 9. FOTO PRODUK
-- ============================================================
CREATE TABLE foto_produk (
  id_foto         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_produk       INT UNSIGNED NOT NULL,
  url_foto        VARCHAR(255) NOT NULL,
  urutan          INT DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_foto_produk FOREIGN KEY (id_produk) REFERENCES produk(id_produk) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 10. STOK PRODUK
-- ============================================================
CREATE TABLE stok_produk (
  id_stok         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_produk       INT UNSIGNED NOT NULL UNIQUE,
  jumlah_stok     INT NOT NULL DEFAULT 0,
  stok_minimum    INT NOT NULL DEFAULT 5,
  satuan          VARCHAR(30) DEFAULT 'pcs',
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_stok_produk FOREIGN KEY (id_produk) REFERENCES produk(id_produk) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 11. DOKTER HEWAN
-- ============================================================
CREATE TABLE dokter_hewan (
  id_dokter       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pengguna     INT UNSIGNED NOT NULL,
  nama_dokter     VARCHAR(100) NOT NULL,
  spesialisasi    VARCHAR(150) DEFAULT NULL,
  no_str          VARCHAR(50) DEFAULT NULL,
  deskripsi       TEXT DEFAULT NULL,
  foto            VARCHAR(255) DEFAULT NULL,
  no_telepon      VARCHAR(20) DEFAULT NULL,
  email           VARCHAR(150) DEFAULT NULL,
  alamat_praktik  TEXT DEFAULT NULL,
  kota            VARCHAR(100) DEFAULT 'Makassar',
  lat             DECIMAL(10,8) DEFAULT NULL,
  lng             DECIMAL(11,8) DEFAULT NULL,
  harga_konsultasi DECIMAL(10,2) DEFAULT 0,
  status_ready    TINYINT(1) DEFAULT 1 COMMENT '1=ready, 0=tidak ready',
  rating_avg      DECIMAL(3,2) DEFAULT 0.00,
  total_ulasan    INT DEFAULT 0,
  total_pasien    INT DEFAULT 0,
  status          ENUM('aktif','nonaktif','pending') DEFAULT 'pending',
  verified        TINYINT(1) DEFAULT 0,
  qris_image      VARCHAR(255) DEFAULT NULL,
  no_rekening     VARCHAR(50) DEFAULT NULL,
  nama_bank       VARCHAR(50) DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_dokter_pengguna FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 12. JADWAL DOKTER (kapan dokter tersedia)
-- ============================================================
CREATE TABLE jadwal_dokter (
  id_jadwal       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_dokter       INT UNSIGNED NOT NULL,
  hari            ENUM('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu') NOT NULL,
  jam_mulai       TIME NOT NULL,
  jam_selesai     TIME NOT NULL,
  kuota_per_hari  INT DEFAULT 10,
  status          ENUM('aktif','libur') DEFAULT 'aktif',
  CONSTRAINT fk_jadwal_dokter FOREIGN KEY (id_dokter) REFERENCES dokter_hewan(id_dokter) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 13. JANJI / APPOINTMENT DOKTER
-- ============================================================
CREATE TABLE janji_dokter (
  id_janji        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pengguna     INT UNSIGNED NOT NULL,
  id_dokter       INT UNSIGNED NOT NULL,
  tanggal         DATE NOT NULL,
  jam             TIME NOT NULL,
  keluhan         TEXT DEFAULT NULL,
  nama_hewan      VARCHAR(100) DEFAULT NULL,
  jenis_hewan     ENUM('kucing','anjing') DEFAULT NULL,
  harga           DECIMAL(10,2) NOT NULL,
  bukti_bayar     VARCHAR(255) DEFAULT NULL,
  status_bayar    ENUM('menunggu','lunas','gagal') DEFAULT 'menunggu',
  status_janji    ENUM('menunggu','dikonfirmasi','selesai','dibatalkan') DEFAULT 'menunggu',
  catatan_dokter  TEXT DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_janji_pengguna FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna),
  CONSTRAINT fk_janji_dokter FOREIGN KEY (id_dokter) REFERENCES dokter_hewan(id_dokter)
) ENGINE=InnoDB;

-- ============================================================
-- 14. PENYEDIA GROOMING
-- ============================================================
CREATE TABLE penyedia_grooming (
  id_grooming     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pengguna     INT UNSIGNED NOT NULL,
  nama_usaha      VARCHAR(150) NOT NULL,
  deskripsi       TEXT DEFAULT NULL,
  foto            VARCHAR(255) DEFAULT NULL,
  no_telepon      VARCHAR(20) DEFAULT NULL,
  email           VARCHAR(150) DEFAULT NULL,
  alamat          TEXT DEFAULT NULL,
  kota            VARCHAR(100) DEFAULT 'Makassar',
  lat             DECIMAL(10,8) DEFAULT NULL,
  lng             DECIMAL(11,8) DEFAULT NULL,
  jam_buka        TIME DEFAULT NULL,
  jam_tutup       TIME DEFAULT NULL,
  jenis_hewan     ENUM('kucing','anjing','keduanya') DEFAULT 'keduanya',
  rating_avg      DECIMAL(3,2) DEFAULT 0.00,
  total_ulasan    INT DEFAULT 0,
  status          ENUM('aktif','nonaktif','pending') DEFAULT 'pending',
  verified        TINYINT(1) DEFAULT 0,
  qris_image      VARCHAR(255) DEFAULT NULL,
  no_rekening     VARCHAR(50) DEFAULT NULL,
  nama_bank       VARCHAR(50) DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_grooming_pengguna FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 15. LAYANAN GROOMING
-- ============================================================
CREATE TABLE layanan_grooming (
  id_layanan      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_grooming     INT UNSIGNED NOT NULL,
  nama_layanan    VARCHAR(150) NOT NULL,
  deskripsi       TEXT DEFAULT NULL,
  harga           DECIMAL(10,2) NOT NULL,
  durasi_menit    INT DEFAULT 60,
  jenis_hewan     ENUM('kucing','anjing','keduanya') DEFAULT 'keduanya',
  status          ENUM('aktif','nonaktif') DEFAULT 'aktif',
  CONSTRAINT fk_layanan_grooming FOREIGN KEY (id_grooming) REFERENCES penyedia_grooming(id_grooming) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 16. BOOKING GROOMING
-- ============================================================
CREATE TABLE booking_grooming (
  id_booking      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pengguna     INT UNSIGNED NOT NULL,
  id_grooming     INT UNSIGNED NOT NULL,
  id_layanan      INT UNSIGNED NOT NULL,
  tanggal         DATE NOT NULL,
  jam             TIME NOT NULL,
  nama_hewan      VARCHAR(100) NOT NULL,
  jenis_hewan     ENUM('kucing','anjing') NOT NULL,
  ras_hewan       VARCHAR(100) DEFAULT NULL,
  catatan         TEXT DEFAULT NULL,
  harga           DECIMAL(10,2) NOT NULL,
  bukti_bayar     VARCHAR(255) DEFAULT NULL,
  status_bayar    ENUM('menunggu','lunas','gagal') DEFAULT 'menunggu',
  status_booking  ENUM('menunggu','dikonfirmasi','selesai','dibatalkan') DEFAULT 'menunggu',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_pengguna FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna),
  CONSTRAINT fk_booking_grooming FOREIGN KEY (id_grooming) REFERENCES penyedia_grooming(id_grooming),
  CONSTRAINT fk_booking_layanan FOREIGN KEY (id_layanan) REFERENCES layanan_grooming(id_layanan)
) ENGINE=InnoDB;

-- ============================================================
-- 17. KERANJANG BELANJA
-- ============================================================
CREATE TABLE keranjang (
  id_keranjang    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pengguna     INT UNSIGNED NOT NULL,
  id_produk       INT UNSIGNED NOT NULL,
  jumlah          INT NOT NULL DEFAULT 1,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_keranjang (id_pengguna, id_produk),
  CONSTRAINT fk_keranjang_pengguna FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna) ON DELETE CASCADE,
  CONSTRAINT fk_keranjang_produk FOREIGN KEY (id_produk) REFERENCES produk(id_produk) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 18. PESANAN
-- ============================================================
CREATE TABLE pesanan (
  id_pesanan      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pengguna     INT UNSIGNED NOT NULL,
  id_alamat       INT UNSIGNED NOT NULL,
  kode_pesanan    VARCHAR(30) NOT NULL UNIQUE,
  total_berat_gram DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_harga     DECIMAL(12,2) NOT NULL,
  ongkir          DECIMAL(10,2) DEFAULT 0,
  total_bayar     DECIMAL(12,2) NOT NULL,
  metode_pengiriman VARCHAR(100) DEFAULT NULL,
  no_resi         VARCHAR(100) DEFAULT NULL,
  catatan         TEXT DEFAULT NULL,
  status          ENUM('menunggu_pembayaran','verifikasi','diproses','dikirim','selesai','dibatalkan') DEFAULT 'menunggu_pembayaran',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pesanan_pengguna FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna),
  CONSTRAINT fk_pesanan_alamat FOREIGN KEY (id_alamat) REFERENCES alamat_pengguna(id_alamat)
) ENGINE=InnoDB;

-- ============================================================
-- 19. DETAIL PESANAN
-- ============================================================
CREATE TABLE detail_pesanan (
  id_detail       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pesanan      INT UNSIGNED NOT NULL,
  id_produk       INT UNSIGNED NOT NULL,
  id_kios         INT UNSIGNED NOT NULL,
  nama_produk     VARCHAR(200) NOT NULL,
  foto_produk     VARCHAR(255) DEFAULT NULL,
  harga_satuan    DECIMAL(12,2) NOT NULL,
  jumlah          INT NOT NULL DEFAULT 1,
  berat_gram      DECIMAL(10,2) NOT NULL DEFAULT 0,
  subtotal_berat  DECIMAL(12,2) NOT NULL DEFAULT 0,
  subtotal_harga  DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_detail_pesanan FOREIGN KEY (id_pesanan) REFERENCES pesanan(id_pesanan) ON DELETE CASCADE,
  CONSTRAINT fk_detail_produk FOREIGN KEY (id_produk) REFERENCES produk(id_produk),
  CONSTRAINT fk_detail_kios FOREIGN KEY (id_kios) REFERENCES kios(id_kios)
) ENGINE=InnoDB;

-- ============================================================
-- 20. PEMBAYARAN (bukti foto transfer/QRIS)
-- ============================================================
CREATE TABLE pembayaran (
  id_pembayaran   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pesanan      INT UNSIGNED NOT NULL,
  id_kios         INT UNSIGNED DEFAULT NULL,
  metode          ENUM('transfer_bank','qris','cod') NOT NULL DEFAULT 'transfer_bank',
  nama_bank       VARCHAR(50) DEFAULT NULL,
  no_rekening     VARCHAR(100) DEFAULT NULL,
  nama_pengirim   VARCHAR(100) DEFAULT NULL,
  jumlah_bayar    DECIMAL(12,2) NOT NULL,
  bukti_foto      VARCHAR(255) DEFAULT NULL,
  waktu_bayar     TIMESTAMP NULL DEFAULT NULL,
  status          ENUM('menunggu','diverifikasi','ditolak') DEFAULT 'menunggu',
  catatan_owner   TEXT DEFAULT NULL,
  verified_at     TIMESTAMP NULL DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pembayaran_pesanan FOREIGN KEY (id_pesanan) REFERENCES pesanan(id_pesanan) ON DELETE CASCADE,
  CONSTRAINT fk_pembayaran_kios FOREIGN KEY (id_kios) REFERENCES kios(id_kios) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 21. KOMISI PLATFORM
-- ============================================================
CREATE TABLE komisi (
  id_komisi       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pesanan      INT UNSIGNED DEFAULT NULL,
  id_kios         INT UNSIGNED DEFAULT NULL,
  tipe            ENUM('produk','dokter','grooming') DEFAULT 'produk',
  total_transaksi DECIMAL(12,2) NOT NULL,
  persen_komisi   DECIMAL(5,2) NOT NULL,
  jumlah_komisi   DECIMAL(12,2) NOT NULL,
  status          ENUM('pending','lunas') DEFAULT 'pending',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_komisi_pesanan FOREIGN KEY (id_pesanan) REFERENCES pesanan(id_pesanan) ON DELETE SET NULL,
  CONSTRAINT fk_komisi_kios FOREIGN KEY (id_kios) REFERENCES kios(id_kios) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 22. ULASAN PRODUK
-- ============================================================
CREATE TABLE ulasan_produk (
  id_ulasan       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_produk       INT UNSIGNED NOT NULL,
  id_pengguna     INT UNSIGNED NOT NULL,
  id_pesanan      INT UNSIGNED DEFAULT NULL,
  bintang         TINYINT NOT NULL CHECK (bintang BETWEEN 1 AND 5),
  judul           VARCHAR(150) DEFAULT NULL,
  komentar        TEXT DEFAULT NULL,
  foto_ulasan     VARCHAR(255) DEFAULT NULL,
  status          ENUM('aktif','nonaktif') DEFAULT 'aktif',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ulasan_produk FOREIGN KEY (id_produk) REFERENCES produk(id_produk) ON DELETE CASCADE,
  CONSTRAINT fk_ulasan_pengguna_p FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 23. ULASAN DOKTER
-- ============================================================
CREATE TABLE ulasan_dokter (
  id_ulasan       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_dokter       INT UNSIGNED NOT NULL,
  id_pengguna     INT UNSIGNED NOT NULL,
  id_janji        INT UNSIGNED DEFAULT NULL,
  bintang         TINYINT NOT NULL CHECK (bintang BETWEEN 1 AND 5),
  komentar        TEXT DEFAULT NULL,
  status          ENUM('aktif','nonaktif') DEFAULT 'aktif',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ulasan_dokter FOREIGN KEY (id_dokter) REFERENCES dokter_hewan(id_dokter) ON DELETE CASCADE,
  CONSTRAINT fk_ulasan_pengguna_d FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 24. ULASAN GROOMING
-- ============================================================
CREATE TABLE ulasan_grooming (
  id_ulasan       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_grooming     INT UNSIGNED NOT NULL,
  id_pengguna     INT UNSIGNED NOT NULL,
  id_booking      INT UNSIGNED DEFAULT NULL,
  bintang         TINYINT NOT NULL CHECK (bintang BETWEEN 1 AND 5),
  komentar        TEXT DEFAULT NULL,
  status          ENUM('aktif','nonaktif') DEFAULT 'aktif',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ulasan_grooming FOREIGN KEY (id_grooming) REFERENCES penyedia_grooming(id_grooming) ON DELETE CASCADE,
  CONSTRAINT fk_ulasan_pengguna_g FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 25. PERCAKAPAN CHAT
-- ============================================================
CREATE TABLE percakapan (
  id_percakapan   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pengguna     INT UNSIGNED NOT NULL COMMENT 'pembeli/pengirim',
  tipe_mitra      ENUM('kios','dokter','grooming') NOT NULL,
  id_mitra        INT UNSIGNED NOT NULL COMMENT 'id_kios/id_dokter/id_grooming',
  pesan_terakhir  TEXT DEFAULT NULL,
  waktu_terakhir  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  belum_dibaca    INT DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_percakapan_pengguna FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 26. PESAN CHAT
-- ============================================================
CREATE TABLE pesan (
  id_pesan        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_percakapan   INT UNSIGNED NOT NULL,
  pengirim_tipe   ENUM('pengguna','mitra') NOT NULL,
  id_pengirim     INT UNSIGNED NOT NULL,
  isi_pesan       TEXT NOT NULL,
  tipe_konten     ENUM('teks','gambar','file') DEFAULT 'teks',
  url_lampiran    VARCHAR(255) DEFAULT NULL,
  sudah_dibaca    TINYINT(1) DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pesan_percakapan FOREIGN KEY (id_percakapan) REFERENCES percakapan(id_percakapan) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 27. HEWAN PELIHARAAN PENGGUNA
-- ============================================================
CREATE TABLE hewan_peliharaan (
  id_hewan        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pengguna     INT UNSIGNED NOT NULL,
  nama_hewan      VARCHAR(100) NOT NULL,
  jenis_hewan     ENUM('kucing','anjing') NOT NULL,
  ras             VARCHAR(100) DEFAULT NULL,
  jenis_kelamin   ENUM('Jantan','Betina') DEFAULT NULL,
  tanggal_lahir   DATE DEFAULT NULL,
  berat_kg        DECIMAL(5,2) DEFAULT NULL,
  foto            VARCHAR(255) DEFAULT NULL,
  catatan_kesehatan TEXT DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_hewan_pengguna FOREIGN KEY (id_pengguna) REFERENCES pengguna(id_pengguna) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- SEEDING DATA AWAL
-- ============================================================

-- Admin
INSERT INTO pengguna (nama_lengkap, email, password, peran, status, email_verified) VALUES
('Super Admin', 'admin@petplace.id', '$2y$10$petplace_admin_hash', 'admin', 'aktif', 1);

-- Kategori Produk
INSERT INTO kategori_produk (nama_kategori, slug, jenis_hewan, tipe_produk, urutan) VALUES
('Makanan Kucing', 'makanan-kucing', 'kucing', 'makanan', 1),
('Makanan Anjing', 'makanan-anjing', 'anjing', 'makanan', 2),
('Pasir Kucing', 'pasir-kucing', 'kucing', 'pasir', 3),
('Pasir Anjing', 'pasir-anjing', 'anjing', 'pasir', 4),
('Mainan Kucing', 'mainan-kucing', 'kucing', 'mainan', 5),
('Mainan Anjing', 'mainan-anjing', 'anjing', 'mainan', 6),
('Aksesoris Kucing', 'aksesoris-kucing', 'kucing', 'aksesoris', 7),
('Aksesoris Anjing', 'aksesoris-anjing', 'anjing', 'aksesoris', 8),
('Kesehatan Kucing', 'kesehatan-kucing', 'kucing', 'kesehatan', 9),
('Kesehatan Anjing', 'kesehatan-anjing', 'anjing', 'kesehatan', 10);

-- ============================================================
-- END OF SCHEMA
-- ============================================================
