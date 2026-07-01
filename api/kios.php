<?php
// ============================================================
// PetPlace API — Kios
// ============================================================
require_once __DIR__ . '/config.php';
setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = (int)($_GET['id'] ?? 0);
$action = $_GET['action'] ?? '';

if ($method === 'GET' && $action === 'stats' && $id) {
    kiosStats($id);
} elseif ($method === 'GET' && !$id && !$action) {
    listKios();
} elseif ($method === 'GET' && $id) {
    detailKios($id);
} elseif ($method === 'POST' && $action === 'daftar') {
    daftarKios();
} elseif ($method === 'PUT' && $id) {
    updateKios($id);
} elseif ($method === 'POST' && $action === 'approve' && $id) {
    approveKios($id);
} elseif ($method === 'POST' && $action === 'reject' && $id) {
    rejectKios($id);
} elseif ($method === 'GET' && $action === 'my') {
    myKios();
} else {
    sendError('Endpoint tidak ditemukan', 404);
}

function listKios(): void {
    $db = getDB();
    $where = ["k.status = 'aktif'"];
    $params = [];
    
    if (!empty($_GET['kota'])) {
        $where[] = "lk.kota = ?";
        $params[] = $_GET['kota'];
    }
    if (!empty($_GET['q'])) {
        $where[] = "k.nama_kios LIKE ?";
        $params[] = '%' . $_GET['q'] . '%';
    }
    
    $whereSql = implode(' AND ', $where);
    
    $stmt = $db->prepare("
        SELECT k.id_kios AS id, k.nama_kios AS nama, k.slug, k.deskripsi, k.logo,
               5.0 AS rating, 0 AS totalUlasan, k.no_rekening AS noRekening,
               k.nama_bank AS namaBank, k.no_telepon AS telepon, k.email_kios AS email,
               k.jam_buka AS jamBuka, k.jam_tutup AS jamTutup, k.qris_image AS qris,
               k.status, k.verified,
               lk.kota, lk.lat, lk.lng, lk.alamat_lengkap AS alamat,
               (SELECT COUNT(*) FROM produk p WHERE p.id_kios = k.id_kios AND p.status = 'aktif') AS totalProduk
        FROM kios k
        LEFT JOIN lokasi_kios lk ON lk.id_kios = k.id_kios
        WHERE $whereSql
        ORDER BY k.id_kios DESC
    ");
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    sendSuccess($rows);
}

function detailKios(int $id): void {
    $db = getDB();
    $stmt = $db->prepare("
        SELECT k.id_kios AS id, k.id_pengguna AS idPengguna, k.nama_kios AS nama, k.slug, k.deskripsi,
               k.logo, k.banner, 5.0 AS rating, 0 AS totalUlasan,
               k.no_rekening AS noRekening, k.nama_bank AS namaBank, k.nama_pemilik_rek AS namaPemilikRek,
               k.no_telepon AS telepon, k.email_kios AS email,
               k.jam_buka AS jamBuka, k.jam_tutup AS jamTutup, k.hari_operasi AS hariOperasi,
               k.qris_image AS qris, k.persen_komisi AS persenKomisi,
               k.status, k.verified, k.created_at AS createdAt,
               lk.kota, lk.lat, lk.lng, lk.alamat_lengkap AS alamat
        FROM kios k
        LEFT JOIN lokasi_kios lk ON lk.id_kios = k.id_kios
        WHERE k.id_kios = ?
        LIMIT 1
    ");
    $stmt->execute([$id]);
    $kios = $stmt->fetch();
    
    if (!$kios) sendError('Kios tidak ditemukan', 404);
    
    // Get products
    $produkStmt = $db->prepare("
        SELECT p.id_produk AS id, p.nama_produk AS nama, p.foto_utama AS foto,
               p.harga, p.harga_diskon AS hargaDiskon, p.rating_avg AS rating,
               p.terjual, sp.jumlah_stok AS stok
        FROM produk p
        LEFT JOIN stok_produk sp ON sp.id_produk = p.id_produk
        WHERE p.id_kios = ? AND p.status = 'aktif'
        ORDER BY p.terjual DESC
        LIMIT 20
    ");
    $produkStmt->execute([$id]);
    $kios['produk'] = $produkStmt->fetchAll();
    
    sendSuccess($kios);
}

function daftarKios(): void {
    $user = requireAuth();
    
    // Check existing kios
    $db = getDB();
    $existing = $db->prepare("SELECT id_kios FROM kios WHERE id_pengguna = ?");
    $existing->execute([$user['id_pengguna']]);
    if ($existing->fetch()) sendError('Anda sudah memiliki kios terdaftar');
    
    $data = getRequestBody();
    $required = ['namaKios', 'namaBank', 'noRekening', 'namaPemilikRek'];
    foreach ($required as $f) {
        if (empty($data[$f])) sendError("Field '$f' wajib diisi");
    }
    
    $nama   = trim($data['namaKios']);
    $slug   = slugify($nama) . '-' . substr(md5(microtime()), 0, 6);
    
    $db->prepare("
        INSERT INTO kios (id_pengguna, nama_kios, slug, deskripsi, no_telepon, email_kios, jam_buka, jam_tutup, hari_operasi, no_rekening, nama_bank, nama_pemilik_rek, qris_image, status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'pending')
    ")->execute([
        $user['id_pengguna'], $nama, $slug,
        $data['deskripsi'] ?? '',
        $data['telepon'] ?? '',
        $data['email'] ?? '',
        $data['jamBuka'] ?? '08:00',
        $data['jamTutup'] ?? '17:00',
        $data['hariOperasi'] ?? 'Senin-Sabtu',
        $data['noRekening'],
        $data['namaBank'],
        $data['namaPemilikRek'],
        $data['qris'] ?? '',
    ]);
    
    $kiosId = $db->lastInsertId();
    
    // Insert lokasi if provided
    if (!empty($data['lat']) && !empty($data['lng'])) {
        $db->prepare("INSERT INTO lokasi_kios (id_kios, tipe, alamat_lengkap, kota, lat, lng) VALUES (?,?,?,?,?,?)")
           ->execute([$kiosId, 'kios', $data['alamat'] ?? '', $data['kota'] ?? 'Makassar', $data['lat'], $data['lng']]);
    }
    
    // Update pengguna role
    $db->prepare("UPDATE pengguna SET peran = 'owner' WHERE id_pengguna = ?")->execute([$user['id_pengguna']]);
    
    sendSuccess(['id' => $kiosId, 'status' => 'pending'], 'Pendaftaran kios berhasil! Menunggu verifikasi admin.');
}

function updateKios(int $id): void {
    $user = requireAuth();
    $db   = getDB();
    
    $stmt = $db->prepare("SELECT id_pengguna FROM kios WHERE id_kios = ?");
    $stmt->execute([$id]);
    $kios = $stmt->fetch();
    if (!$kios) sendError('Kios tidak ditemukan', 404);
    if ($user['peran'] !== 'admin' && $kios['id_pengguna'] != $user['id_pengguna']) {
        sendError('Tidak memiliki akses', 403);
    }
    
    $data = getRequestBody();
    $fields = [];
    $params = [];
    
    $map = [
        'namaKios'     => 'nama_kios',
        'deskripsi'    => 'deskripsi',
        'telepon'      => 'no_telepon',
        'email'        => 'email_kios',
        'jamBuka'      => 'jam_buka',
        'jamTutup'     => 'jam_tutup',
        'hariOperasi'  => 'hari_operasi',
        'namaBank'     => 'nama_bank',
        'noRekening'   => 'no_rekening',
        'namaPemilikRek' => 'nama_pemilik_rek',
        'logo'         => 'logo',
        'banner'       => 'banner',
        'qris'         => 'qris_image',
    ];
    
    foreach ($map as $key => $col) {
        if (isset($data[$key])) {
            $fields[] = "$col = ?";
            $params[] = $data[$key];
        }
    }
    
    if (!empty($fields)) {
        $params[] = $id;
        $db->prepare("UPDATE kios SET " . implode(', ', $fields) . " WHERE id_kios = ?")->execute($params);
    }
    
    // Upsert lokasi_kios if location data provided
    if (!empty($data['lat']) && !empty($data['lng'])) {
        $chk = $db->prepare("SELECT id_lokasi FROM lokasi_kios WHERE id_kios = ?");
        $chk->execute([$id]);
        $existingLok = $chk->fetch();
        if ($existingLok) {
            $db->prepare("UPDATE lokasi_kios SET lat = ?, lng = ?, alamat_lengkap = ?, kota = ? WHERE id_kios = ?")
               ->execute([$data['lat'], $data['lng'], $data['alamat'] ?? '', $data['kota'] ?? 'Makassar', $id]);
        } else {
            $db->prepare("INSERT INTO lokasi_kios (id_kios, tipe, alamat_lengkap, kota, lat, lng) VALUES (?,?,?,?,?,?)")
               ->execute([$id, 'kios', $data['alamat'] ?? '', $data['kota'] ?? 'Makassar', $data['lat'], $data['lng']]);
        }
    }
    
    sendSuccess(null, 'Kios berhasil diperbarui');
}


function approveKios(int $id): void {
    requireAdmin();
    $db = getDB();
    
    $stmt = $db->prepare("SELECT id_pengguna FROM kios WHERE id_kios = ?");
    $stmt->execute([$id]);
    $kios = $stmt->fetch();
    if (!$kios) sendError('Kios tidak ditemukan', 404);
    
    $db->prepare("UPDATE kios SET status = 'aktif', verified = 1 WHERE id_kios = ?")->execute([$id]);
    $db->prepare("UPDATE pengguna SET peran = 'owner', status = 'aktif' WHERE id_pengguna = ?")->execute([$kios['id_pengguna']]);
    
    sendSuccess(null, 'Kios berhasil diverifikasi');
}

function rejectKios(int $id): void {
    requireAdmin();
    $db = getDB();
    $db->prepare("UPDATE kios SET status = 'nonaktif' WHERE id_kios = ?")->execute([$id]);
    sendSuccess(null, 'Kios berhasil ditolak');
}

function myKios(): void {
    $user = requireAuth();
    $db = getDB();
    
    $stmt = $db->prepare("
        SELECT k.id_kios AS id, k.nama_kios AS nama, k.status, k.verified,
               k.no_rekening AS noRekening, k.nama_bank AS namaBank,
               (SELECT COUNT(*) FROM produk p WHERE p.id_kios = k.id_kios) AS totalProduk,
               (SELECT COALESCE(SUM(dp.subtotal_harga), 0) FROM detail_pesanan dp WHERE dp.id_kios = k.id_kios) AS totalPenjualan
        FROM kios k
        WHERE k.id_pengguna = ?
        LIMIT 1
    ");
    $stmt->execute([$user['id_pengguna']]);
    $kios = $stmt->fetch();
    
    if (!$kios) sendError('Anda belum memiliki kios', 404);
    sendSuccess($kios);
}

function slugify(string $text): string {
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9\s-]/', '', $text);
    $text = preg_replace('/\s+/', '-', trim($text));
    return $text;
}

function kiosStats(int $idKios): void {
    $db = getDB();
    
    // totalProduk
    $pStmt = $db->prepare("SELECT COUNT(*) FROM produk WHERE id_kios = ? AND status = 'aktif'");
    $pStmt->execute([$idKios]);
    $totalProduk = (int)$pStmt->fetchColumn();
    
    // totalPesanan
    $oStmt = $db->prepare("SELECT COUNT(DISTINCT id_pesanan) FROM detail_pesanan WHERE id_kios = ?");
    $oStmt->execute([$idKios]);
    $totalPesanan = (int)$oStmt->fetchColumn();
    
    // pesananVerifikasi
    $vStmt = $db->prepare("
        SELECT COUNT(DISTINCT dp.id_pesanan) 
        FROM detail_pesanan dp 
        JOIN pesanan ps ON dp.id_pesanan = ps.id_pesanan 
        WHERE dp.id_kios = ? AND ps.status = 'verifikasi'
    ");
    $vStmt->execute([$idKios]);
    $pesananVerifikasi = (int)$vStmt->fetchColumn();
    
    // totalPenjualan
    $sStmt = $db->prepare("
        SELECT COALESCE(SUM(dp.subtotal_harga), 0) 
        FROM detail_pesanan dp 
        JOIN pesanan ps ON dp.id_pesanan = ps.id_pesanan 
        WHERE dp.id_kios = ? AND ps.status NOT IN ('dibatalkan', 'menunggu_pembayaran')
    ");
    $sStmt->execute([$idKios]);
    $totalPenjualan = (float)$sStmt->fetchColumn();
    
    sendSuccess([
        'totalProduk'       => $totalProduk,
        'totalPesanan'      => $totalPesanan,
        'pesananVerifikasi' => $pesananVerifikasi,
        'totalPenjualan'    => $totalPenjualan
    ]);
}
