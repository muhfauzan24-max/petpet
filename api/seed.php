<?php
// ============================================================
// PetPlace API — Database Seeder
// ============================================================
require_once __DIR__ . '/config.php';
setCORSHeaders();

try {
    $db = getDB();
    $db->beginTransaction();

    echo "<pre>=== STARTING DATABASE SEEDER ===\n\n";

    // 1. Buat Kategori Produk
    echo "1. Seeding Kategori Produk...\n";
    $kategori = [
        ['Makanan', 'makanan'],
        ['Aksesoris', 'aksesoris'],
        ['Kesehatan', 'kesehatan'],
        ['Mainan', 'mainan'],
        ['Perawatan', 'perawatan']
    ];
    $stmtKat = $db->prepare("INSERT IGNORE INTO kategori_produk (nama_kategori, slug) VALUES (?, ?)");
    foreach ($kategori as $k) {
        $stmtKat->execute($k);
    }
    echo "✅ Kategori produk seeded.\n\n";

    // Dapatkan ID kategori untuk mapping produk nanti
    $kategoriMap = [];
    foreach ($db->query("SELECT id_kategori, slug FROM kategori_produk")->fetchAll() as $row) {
        $kategoriMap[$row['slug']] = $row['id_kategori'];
    }

    // Hash password default untuk semua akun demo
    $passwordHash = password_hash('password123', PASSWORD_BCRYPT);

    // 2. Buat Akun & Kios Owner (Mitra Kios)
    echo "2. Seeding Akun Owner & Kios...\n";
    
    // Akun Owner 1
    $stmtUser = $db->prepare("INSERT IGNORE INTO pengguna (nama_lengkap, email, password, peran, status, foto_profil) VALUES (?, ?, ?, ?, ?, ?)");
    $stmtUser->execute(['Budi Kios Owner', 'kios1@petplace.id', $passwordHash, 'owner', 'aktif', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200']);
    $owner1Id = $db->query("SELECT id_pengguna FROM pengguna WHERE email = 'kios1@petplace.id'")->fetchColumn();

    // Kios 1
    $stmtKios = $db->prepare("
        INSERT IGNORE INTO kios (id_pengguna, nama_kios, slug, deskripsi, logo, banner, no_rekening, nama_bank, nama_pemilik_rek, no_telepon, email_kios, jam_buka, jam_tutup, hari_operasi, status, verified, persen_komisi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmtKios->execute([
        $owner1Id,
        'Happy Paws Shop',
        'happy-paws-shop',
        'Penyedia kebutuhan makanan, mainan, dan perlengkapan hewan kesayangan Anda terlengkap di Bandung.',
        'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=150',
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=800',
        '123456789', 'BCA', 'Budi Purwanto', '081234567890', 'happypaws@email.com',
        '08:00:00', '21:00:00', 'Senin - Minggu', 'aktif', 1, 5
    ]);
    $kios1Id = $db->query("SELECT id_kios FROM kios WHERE slug = 'happy-paws-shop'")->fetchColumn();

    // Lokasi Kios 1
    $stmtLokKios = $db->prepare("INSERT IGNORE INTO lokasi_kios (id_kios, kota, lat, lng, alamat_lengkap) VALUES (?, ?, ?, ?, ?)");
    $stmtLokKios->execute([$kios1Id, 'Bandung', -6.9175, 107.6191, 'Jl. Merdeka No. 45, Sumur Bandung, Kota Bandung']);

    // Akun Owner 2
    $stmtUser->execute(['Siti Kios Owner', 'kios2@petplace.id', $passwordHash, 'owner', 'aktif', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200']);
    $owner2Id = $db->query("SELECT id_pengguna FROM pengguna WHERE email = 'kios2@petplace.id'")->fetchColumn();

    // Kios 2
    $stmtKios->execute([
        $owner2Id,
        'Royal Pet Kingdom',
        'royal-pet-kingdom',
        'Premium pet shop menyediakan makanan khusus ras murni dan aksesoris eksklusif impor.',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=150',
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800',
        '987654321', 'Mandiri', 'Siti Rahma', '089876543210', 'royalpet@email.com',
        '09:00:00', '20:00:00', 'Senin - Sabtu', 'aktif', 1, 5
    ]);
    $kios2Id = $db->query("SELECT id_kios FROM kios WHERE slug = 'royal-pet-kingdom'")->fetchColumn();

    // Lokasi Kios 2
    $stmtLokKios->execute([$kios2Id, 'Jakarta', -6.2088, 106.8456, 'Kuningan City Mall, Lt. 2, Jakarta Selatan']);

    echo "✅ Akun owner & Kios seeded.\n\n";

    // 3. Buat Produk & Stok
    echo "3. Seeding Produk...\n";
    $produk = [
        [
            $kios1Id, $kategoriMap['makanan'], 'Royal Canin Mother & Babycat 400g', 'royal-canin-babycat-400g',
            'Nutrisi lengkap untuk induk kucing menyusui dan anak kucing usia 1-4 bulan.', 'kucing', 'fisik',
            85000, 80000, 400, 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=300', 45, 4.8, 15
        ],
        [
            $kios1Id, $kategoriMap['mainan'], 'Scratch Post Tree Kucing Bertingkat', 'scratch-post-tree-bertingkat',
            'Tiang garukan kucing bertingkat yang kokoh, dilengkapi dengan mainan gantung bulu.', 'kucing', 'fisik',
            250000, 220000, 2500, 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&q=80&w=300', 12, 4.7, 5
        ],
        [
            $kios1Id, $kategoriMap['aksesoris'], 'Kalung Anjing Kulit Custom Nama', 'kalung-anjing-kulit-custom',
            'Kalung leher anjing bahan kulit asli dengan plat kuningan untuk grafir nama.', 'anjing', 'fisik',
            120000, 0, 150, 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=300', 30, 4.9, 10
        ],
        [
            $kios2Id, $kategoriMap['makanan'], 'Pedigree Dry Food Adult Beef & Veg 1.5kg', 'pedigree-dry-beef-1-5kg',
            'Nutrisi harian seimbang untuk anjing dewasa ras besar, varian daging sapi dan sayur.', 'anjing', 'fisik',
            65000, 0, 1500, 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=300', 100, 4.6, 32
        ],
        [
            $kios2Id, $kategoriMap['kesehatan'], 'Minyak Ikan Premium untuk Bulu Lebat', 'minyak-ikan-premium-pet',
            'Suplemen omega 3 & 6 cair untuk mengurangi bulu rontok dan meningkatkan keindahan bulu hewan.', 'semua', 'fisik',
            45000, 39000, 100, 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?auto=format&fit=crop&q=80&w=300', 88, 4.9, 40
        ]
    ];

    $stmtProd = $db->prepare("
        INSERT IGNORE INTO produk (id_kios, id_kategori, nama_produk, slug, deskripsi, jenis_hewan, tipe_produk, harga, harga_diskon, berat_gram, foto_utama, terjual, rating_avg, total_ulasan, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif')
    ");
    $stmtStok = $db->prepare("INSERT IGNORE INTO stok_produk (id_produk, jumlah_stok) VALUES (?, ?)");

    foreach ($produk as $p) {
        $stmtProd->execute($p);
        $prodId = $db->lastInsertId();
        if ($prodId) {
            $stmtStok->execute([$prodId, rand(20, 100)]);
        }
    }
    echo "✅ Produk & Stok seeded.\n\n";

    // 4. Buat Dokter & Jadwal
    echo "4. Seeding Dokter Hewan...\n";
    
    // Akun Dokter 1
    $stmtUser->execute(['Drh. Rian Gunawan', 'rian@petplace.id', $passwordHash, 'dokter', 'aktif', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200']);
    $doc1Id = $db->query("SELECT id_pengguna FROM pengguna WHERE email = 'rian@petplace.id'")->fetchColumn();

    $stmtDoc = $db->prepare("
        INSERT IGNORE INTO dokter_hewan (id_pengguna, nama_dokter, spesialisasi, no_str, deskripsi, foto, kota, lat, lng, alamat_praktik, harga_konsultasi, status_ready, rating_avg, total_ulasan, total_pasien, no_rekening, nama_bank, status, verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif', 1)
    ");
    $stmtDoc->execute([
        $doc1Id, 'Drh. Rian Gunawan', 'Spesialis Penyakit Dalam Kucing', 'STR-123456',
        'Dokter hewan berpengalaman khusus menangani masalah pencernaan, ginjal, dan virus kucing selama 7 tahun.',
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
        'Bandung', -6.9038, 107.6186, 'Klinik PetCare, Jl. Riau No. 12, Bandung',
        75000, 1, 4.9, 12, 150, '11223344', 'BCA'
    ]);
    $stmtGetDok = $db->prepare("SELECT id_dokter FROM dokter_hewan WHERE id_pengguna = ?");
    $stmtGetDok->execute([$doc1Id]);
    $dokter1Id = $stmtGetDok->fetchColumn();
    if (!$dokter1Id) {
        $dokter1Id = $db->query("SELECT id_dokter FROM dokter_hewan WHERE nama_dokter = 'Drh. Rian Gunawan'")->fetchColumn();
    }

    // Jadwal Dokter 1
    $stmtJad = $db->prepare("INSERT IGNORE INTO jadwal_dokter (id_dokter, hari, jam_mulai, jam_selesai, status) VALUES (?, ?, ?, ?, 'aktif')");
    $stmtJad->execute([$dokter1Id, 'Senin', '09:00:00', '12:00:00']);
    $stmtJad->execute([$dokter1Id, 'Rabu', '09:00:00', '12:00:00']);
    $stmtJad->execute([$dokter1Id, 'Jumat', '13:00:00', '17:00:00']);

    // Akun Dokter 2
    $stmtUser->execute(['Drh. Sarah Amalia', 'sarah@petplace.id', $passwordHash, 'dokter', 'aktif', 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200']);
    $doc2Id = $db->query("SELECT id_pengguna FROM pengguna WHERE email = 'sarah@petplace.id'")->fetchColumn();

    $stmtDoc->execute([
        $doc2Id, 'Drh. Sarah Amalia', 'Bedah & Orthopedi Anjing', 'STR-654321',
        'Menyediakan layanan konsultasi bedah tulang, sterilisasi aman, dan perawatan patah tulang akibat kecelakaan.',
        'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200',
        'Jakarta', -6.2297, 106.8295, 'Klinik Satwa Indah, Jl. Sudirman Kav 21, Jakarta Selatan',
        100000, 1, 4.8, 8, 95, '55667788', 'Mandiri'
    ]);
    $dokter2Id = $db->query("SELECT id_dokter FROM dokter_hewan WHERE nama_dokter = 'Drh. Sarah Amalia'")->fetchColumn();

    // Jadwal Dokter 2
    $stmtJad->execute([$dokter2Id, 'Selasa', '10:00:00', '15:00:00']);
    $stmtJad->execute([$dokter2Id, 'Kamis', '10:00:00', '15:00:00']);
    $stmtJad->execute([$dokter2Id, 'Sabtu', '09:00:00', '13:00:00']);

    echo "✅ Dokter & Jadwal seeded.\n\n";

    // 5. Buat Grooming & Layanan
    echo "5. Seeding Penyedia Grooming...\n";
    
    // Akun Grooming
    $stmtUser->execute(['Rudi Grooming', 'grooming1@petplace.id', $passwordHash, 'grooming', 'aktif', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200']);
    $groomUser1Id = $db->query("SELECT id_pengguna FROM pengguna WHERE email = 'grooming1@petplace.id'")->fetchColumn();

    $stmtGroom = $db->prepare("
        INSERT IGNORE INTO penyedia_grooming (id_pengguna, nama_usaha, deskripsi, foto, kota, lat, lng, alamat, jam_buka, jam_tutup, jenis_hewan, rating_avg, total_ulasan, no_rekening, nama_bank, status, verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif', 1)
    ");
    $stmtGroom->execute([
        $groomUser1Id, 'Posh Pet Grooming & Spa',
        'Layanan salon & spa profesional untuk anjing dan kucing kesayangan Anda. Potong bulu stylist, mandi anti-kutu, dan gunting kuku.',
        'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=150',
        'Bandung', -6.9056, 107.6201, 'Jl. Diponegoro No. 8, Citarum, Bandung',
        '09:00:00', '18:00:00', 'keduanya', 4.9, 24, '44332211', 'BCA'
    ]);
    $groom1Id = $db->query("SELECT id_grooming FROM penyedia_grooming WHERE nama_usaha = 'Posh Pet Grooming & Spa'")->fetchColumn();

    // Layanan Grooming
    $stmtLay = $db->prepare("INSERT IGNORE INTO layanan_grooming (id_grooming, nama_layanan, deskripsi, harga, durasi_menit, jenis_hewan, status) VALUES (?, ?, ?, ?, ?, ?, 'aktif')");
    $stmtLay->execute([
        $groom1Id, 'Grooming Sehat Standard', 'Mandi shampoo anti kutu + blower + sisir bulu + bersihkan telinga + potong kuku.',
        65000, 60, 'keduanya'
    ]);
    $stmtLay->execute([
        $groom1Id, 'Stylist Cut & Haircut', 'Pencukuran bulu model/rapih + mandi sehat + treatment wangi.',
        120000, 90, 'keduanya'
    ]);
    $stmtLay->execute([
        $groom1Id, 'Mandi Jamur & Kutu Spesial', 'Mandi menggunakan shampoo obat medis khusus jamur parah atau kutu parah.',
        90000, 75, 'keduanya'
    ]);

    echo "✅ Penyedia Grooming & Layanan seeded.\n\n";

    $db->commit();
    echo "=========================================\n";
    echo "🎉 SEED DATA BERHASIL DIISI KE DATABASE!\n";
    echo "=========================================\n";
    echo "</pre>";

} catch (Exception $e) {
    if (isset($db)) {
        $db->rollBack();
    }
    echo "<pre>❌ SEEDING GAGAL: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "</pre>";
}
