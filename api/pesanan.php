<?php
// ============================================================
// PetPlace API — Pesanan & Pembayaran
// ============================================================
require_once __DIR__ . '/config.php';
setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = (int)($_GET['id'] ?? 0);
$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'checkout') {
    checkout();
} elseif ($method === 'GET' && $action === 'kios') {
    listPesananKios();
} elseif ($method === 'GET' && !$id) {
    listPesanan();
} elseif ($method === 'GET' && $id) {
    detailPesanan($id);
} elseif ($method === 'PUT' && $id && $action === 'status') {
    updateStatus($id);
} elseif ($method === 'POST' && $action === 'bayar') {
    uploadBuktiBayar();
} elseif ($method === 'POST' && $action === 'verifikasi' && $id) {
    verifikasiPembayaran($id);
} else {
    sendError('Endpoint tidak ditemukan', 404);
}

function checkout(): void {
    $user = requireAuth();
    $data = getRequestBody();
    $db   = getDB();
    
    if (empty($data['items']) || !is_array($data['items'])) sendError('Keranjang kosong');
    if (empty($data['idAlamat'])) sendError('Alamat pengiriman wajib dipilih');
    
    $idAlamat = (int)$data['idAlamat'];
    
    // Verify address belongs to user
    $aStmt = $db->prepare("SELECT id_alamat FROM alamat_pengguna WHERE id_alamat = ? AND id_pengguna = ?");
    $aStmt->execute([$idAlamat, $user['id_pengguna']]);
    if (!$aStmt->fetch()) sendError('Alamat tidak ditemukan');
    
    // Calculate totals
    $items = [];
    $totalHarga = 0;
    $totalBerat = 0;
    
    foreach ($data['items'] as $item) {
        $idProduk = (int)($item['idProduk'] ?? 0);
        $jumlah   = max(1, (int)($item['jumlah'] ?? 1));
        
        $pStmt = $db->prepare("SELECT p.id_produk, p.id_kios, p.nama_produk, p.foto_utama, p.harga, p.harga_diskon, p.berat_gram, sp.jumlah_stok FROM produk p LEFT JOIN stok_produk sp ON sp.id_produk = p.id_produk WHERE p.id_produk = ? AND p.status = 'aktif'");
        $pStmt->execute([$idProduk]);
        $produk = $pStmt->fetch();
        
        if (!$produk) sendError("Produk #$idProduk tidak ditemukan atau tidak aktif");
        if ($produk['jumlah_stok'] !== null && $produk['jumlah_stok'] < $jumlah) {
            sendError("Stok produk '{$produk['nama_produk']}' tidak mencukupi");
        }
        
        $hargaSatuan = $produk['harga_diskon'] ?? $produk['harga'];
        $subtotal    = $hargaSatuan * $jumlah;
        $beratSubtotal = $produk['berat_gram'] * $jumlah;
        
        $items[] = [
            'idProduk'    => $idProduk,
            'idKios'      => $produk['id_kios'],
            'namaProduk'  => $produk['nama_produk'],
            'fotoProduk'  => $produk['foto_utama'],
            'hargaSatuan' => $hargaSatuan,
            'jumlah'      => $jumlah,
            'beratGram'   => $produk['berat_gram'],
            'subtotalBerat' => $beratSubtotal,
            'subtotalHarga' => $subtotal,
        ];
        
        $totalHarga += $subtotal;
        $totalBerat += $beratSubtotal;
    }
    
    // Calculate ongkir
    $ongkir = hitungOngkir($totalBerat);
    $totalBayar = $totalHarga + $ongkir;
    
    // Generate kode pesanan
    $kode = 'PP-' . date('Ymd') . '-' . substr(md5(microtime()), 0, 6);
    
    $db->beginTransaction();
    try {
        // Insert pesanan
        $db->prepare("
            INSERT INTO pesanan (id_pengguna, id_alamat, kode_pesanan, total_berat_gram, total_harga, ongkir, total_bayar, catatan, status)
            VALUES (?,?,?,?,?,?,?,?,'menunggu_pembayaran')
        ")->execute([
            $user['id_pengguna'], $idAlamat, $kode,
            $totalBerat, $totalHarga, $ongkir, $totalBayar,
            $data['catatan'] ?? ''
        ]);
        
        $idPesanan = $db->lastInsertId();
        
        // Insert detail
        foreach ($items as $item) {
            $db->prepare("
                INSERT INTO detail_pesanan (id_pesanan, id_produk, id_kios, nama_produk, foto_produk, harga_satuan, jumlah, berat_gram, subtotal_berat, subtotal_harga)
                VALUES (?,?,?,?,?,?,?,?,?,?)
            ")->execute([
                $idPesanan, $item['idProduk'], $item['idKios'], $item['namaProduk'],
                $item['fotoProduk'], $item['hargaSatuan'], $item['jumlah'],
                $item['beratGram'], $item['subtotalBerat'], $item['subtotalHarga']
            ]);
            
            // Reduce stok
            $db->prepare("UPDATE stok_produk SET jumlah_stok = jumlah_stok - ? WHERE id_produk = ? AND jumlah_stok >= ?")
               ->execute([$item['jumlah'], $item['idProduk'], $item['jumlah']]);
        }
        
        $db->commit();
        
        // Get payment info for ALL kios in this order
        $allKiosIds = array_unique(array_column($items, 'idKios'));
        $kiosInfoList = [];
        foreach ($allKiosIds as $kId) {
            $kiosStmt = $db->prepare("SELECT id_kios AS id, nama_kios AS namaKios, nama_bank AS namaBank, no_rekening AS noRekening, nama_pemilik_rek AS namaPemilikRek, qris_image AS qrisImage FROM kios WHERE id_kios = ?");
            $kiosStmt->execute([$kId]);
            $ki = $kiosStmt->fetch();
            if ($ki) $kiosInfoList[] = $ki;
        }
        
        // For backward-compat, also expose first kios as 'kios'
        $firstKios = !empty($kiosInfoList) ? [
            'nama_kios'       => $kiosInfoList[0]['namaKios'],
            'nama_bank'       => $kiosInfoList[0]['namaBank'],
            'no_rekening'     => $kiosInfoList[0]['noRekening'],
            'nama_pemilik_rek'=> $kiosInfoList[0]['namaPemilikRek'],
            'qris_image'      => $kiosInfoList[0]['qrisImage'],
        ] : null;
        
        sendSuccess([
            'idPesanan'  => $idPesanan,
            'kode'       => $kode,
            'totalBayar' => $totalBayar,
            'ongkir'     => $ongkir,
            'totalHarga' => $totalHarga,
            'kios'       => $firstKios,
            'kiosList'   => $kiosInfoList,  // semua kios dalam pesanan ini
        ], 'Pesanan berhasil dibuat');
        
    } catch (\Exception $e) {
        $db->rollBack();
        sendError('Gagal membuat pesanan: ' . $e->getMessage(), 500);
    }
}

function listPesanan(): void {
    $user = requireAuth();
    $db   = getDB();
    
    if ($user['peran'] === 'admin') {
        $stmt = $db->prepare("
            SELECT ps.id_pesanan AS id, ps.kode_pesanan AS kode, ps.total_bayar AS totalBayar,
                   ps.status, ps.created_at AS createdAt, p.nama_lengkap AS namaPembeli
            FROM pesanan ps
            JOIN pengguna p ON ps.id_pengguna = p.id_pengguna
            ORDER BY ps.created_at DESC
            LIMIT 50
        ");
        $stmt->execute();
    } elseif ($user['peran'] === 'owner') {
        $stmt = $db->prepare("
            SELECT DISTINCT ps.id_pesanan AS id, ps.kode_pesanan AS kode, ps.total_bayar AS totalBayar,
                   ps.status, ps.created_at AS createdAt, p.nama_lengkap AS namaPembeli
            FROM pesanan ps
            JOIN pengguna p ON ps.id_pengguna = p.id_pengguna
            JOIN detail_pesanan dp ON dp.id_pesanan = ps.id_pesanan
            JOIN kios k ON dp.id_kios = k.id_kios
            WHERE k.id_pengguna = ?
            ORDER BY ps.created_at DESC
        ");
        $stmt->execute([$user['id_pengguna']]);
    } else {
        $stmt = $db->prepare("
            SELECT id_pesanan AS id, kode_pesanan AS kode, total_bayar AS totalBayar, status, created_at AS createdAt
            FROM pesanan
            WHERE id_pengguna = ?
            ORDER BY created_at DESC
        ");
        $stmt->execute([$user['id_pengguna']]);
    }
    
    sendSuccess($stmt->fetchAll());
}

function detailPesanan(int $id): void {
    $user = requireAuth();
    $db   = getDB();
    
    $stmt = $db->prepare("
        SELECT ps.id_pesanan AS id, ps.kode_pesanan AS kode, ps.total_berat_gram AS totalBerat,
               ps.total_harga AS totalHarga, ps.ongkir, ps.total_bayar AS totalBayar,
               ps.metode_pengiriman AS metodePengiriman, ps.no_resi AS noResi,
               ps.catatan, ps.status, ps.created_at AS createdAt,
               ap.nama_penerima AS namaPenerima, ap.no_telepon AS telPenerima,
               ap.alamat_lengkap AS alamat, ap.kota, ap.provinsi, ap.kode_pos AS kodePos,
               ap.lat AS latPenerima, ap.lng AS lngPenerima,
               p.nama_lengkap AS namaPembeli
        FROM pesanan ps
        JOIN alamat_pengguna ap ON ps.id_alamat = ap.id_alamat
        JOIN pengguna p ON ps.id_pengguna = p.id_pengguna
        WHERE ps.id_pesanan = ?
        LIMIT 1
    ");
    $stmt->execute([$id]);
    $pesanan = $stmt->fetch();
    
    if (!$pesanan) sendError('Pesanan tidak ditemukan', 404);
    
    // Check access
    if ($user['peran'] !== 'admin') {
        if ($user['peran'] === 'owner') {
            $ownStmt = $db->prepare("SELECT 1 FROM detail_pesanan dp JOIN kios k ON dp.id_kios = k.id_kios WHERE dp.id_pesanan = ? AND k.id_pengguna = ?");
            $ownStmt->execute([$id, $user['id_pengguna']]);
            if (!$ownStmt->fetch()) sendError('Tidak memiliki akses', 403);
        } else {
            // Pembeli biasa: hanya boleh lihat pesanan miliknya sendiri
            if ($pesanan['id_pengguna'] ?? null) {
                // id_pengguna tidak diambil di SELECT, cek via tabel pesanan langsung
                $ownerChk = $db->prepare("SELECT 1 FROM pesanan WHERE id_pesanan = ? AND id_pengguna = ?");
                $ownerChk->execute([$id, $user['id_pengguna']]);
                if (!$ownerChk->fetch()) sendError('Tidak memiliki akses ke pesanan ini', 403);
            }
        }
    }
    
    // Detail items
    $detailStmt = $db->prepare("
        SELECT dp.nama_produk AS namaProduk, dp.foto_produk AS foto, dp.harga_satuan AS hargaSatuan,
               dp.jumlah, dp.subtotal_harga AS subtotalHarga, k.nama_kios AS namaKios,
               lk.lat AS latKios, lk.lng AS lngKios
        FROM detail_pesanan dp
        JOIN kios k ON dp.id_kios = k.id_kios
        LEFT JOIN lokasi_kios lk ON lk.id_kios = k.id_kios
        WHERE dp.id_pesanan = ?
    ");
    $detailStmt->execute([$id]);
    $pesanan['items'] = $detailStmt->fetchAll();
    
    // Pembayaran
    $bayarStmt = $db->prepare("SELECT metode, nama_bank AS namaBank, no_rekening AS noRekening, nama_pengirim AS namaPengirim, jumlah_bayar AS jumlahBayar, bukti_foto AS buktiFoto, status, created_at AS createdAt FROM pembayaran WHERE id_pesanan = ? LIMIT 1");
    $bayarStmt->execute([$id]);
    $pesanan['pembayaran'] = $bayarStmt->fetch();
    
    sendSuccess($pesanan);
}

function updateStatus(int $id): void {
    $user = requireAuth();
    $data = getRequestBody();
    $db   = getDB();
    
    $allowedStatus = ['verifikasi', 'diproses', 'dikirim', 'selesai', 'dibatalkan'];
    $status = $data['status'] ?? '';
    if (!in_array($status, $allowedStatus)) sendError('Status tidak valid');
    
    $db->prepare("UPDATE pesanan SET status = ? WHERE id_pesanan = ?")->execute([$status, $id]);
    
    if (isset($data['noResi'])) {
        $db->prepare("UPDATE pesanan SET no_resi = ? WHERE id_pesanan = ?")->execute([$data['noResi'], $id]);
    }
    
    sendSuccess(null, 'Status pesanan diperbarui');
}

function uploadBuktiBayar(): void {
    $user = requireAuth();
    $data = getRequestBody();
    $db   = getDB();
    
    $idPesanan = (int)($data['idPesanan'] ?? 0);
    if (!$idPesanan) sendError('ID pesanan wajib diisi');
    
    $pStmt = $db->prepare("SELECT id_pengguna, status FROM pesanan WHERE id_pesanan = ?");
    $pStmt->execute([$idPesanan]);
    $pesanan = $pStmt->fetch();
    if (!$pesanan) sendError('Pesanan tidak ditemukan', 404);
    if ($pesanan['id_pengguna'] != $user['id_pengguna']) sendError('Tidak memiliki akses', 403);
    
    $db->prepare("
        INSERT INTO pembayaran (id_pesanan, metode, nama_bank, no_rekening, nama_pengirim, jumlah_bayar, bukti_foto, waktu_bayar, status)
        VALUES (?,?,?,?,?,?,?,NOW(),'menunggu')
        ON DUPLICATE KEY UPDATE nama_pengirim = VALUES(nama_pengirim), bukti_foto = VALUES(bukti_foto), status = 'menunggu', waktu_bayar = NOW()
    ")->execute([
        $idPesanan,
        $data['metode'] ?? 'transfer_bank',
        $data['namaBank'] ?? '',
        $data['noRekening'] ?? '',
        $data['namaPengirim'] ?? '',
        (float)($data['jumlahBayar'] ?? 0),
        $data['buktiFoto'] ?? '',
    ]);
    
    $db->prepare("UPDATE pesanan SET status = 'verifikasi' WHERE id_pesanan = ?")->execute([$idPesanan]);
    sendSuccess(null, 'Bukti pembayaran berhasil diupload');
}

function listPesananKios(): void {
    $user = requireAuth();
    $db   = getDB();
    
    // Dapatkan id_kios milik user
    $kStmt = $db->prepare("SELECT id_kios FROM kios WHERE id_pengguna = ? LIMIT 1");
    $kStmt->execute([$user['id_pengguna']]);
    $kiosRow = $kStmt->fetch();
    if (!$kiosRow) sendError('Anda tidak memiliki kios', 403);
    $idKios = $kiosRow['id_kios'];
    
    $status = $_GET['status'] ?? '';
    $statusFilter = '';
    if ($status && $status !== 'semua') {
        $statusFilter = " AND ps.status = '" . addslashes($status) . "'";
    }
    
    $stmt = $db->prepare("
        SELECT DISTINCT ps.id_pesanan AS id, ps.kode_pesanan AS kode, ps.total_bayar AS totalBayar,
               ps.total_harga AS totalHarga, ps.ongkir, ps.status, ps.created_at AS createdAt,
               p.nama_lengkap AS namaPembeli, p.no_telepon AS telPembeli,
               ap.nama_penerima AS namaPenerima, ap.alamat_lengkap AS alamatPengiriman, ap.kota,
               py.metode AS metodeBayar, py.nama_bank AS namaBank, py.no_rekening AS noRekening,
               py.nama_pengirim AS namaPengirim, py.jumlah_bayar AS jumlahBayar,
               py.bukti_foto AS buktiFoto, py.status AS statusBayar, py.waktu_bayar AS waktuBayar
        FROM pesanan ps
        JOIN pengguna p ON ps.id_pengguna = p.id_pengguna
        JOIN detail_pesanan dp ON dp.id_pesanan = ps.id_pesanan AND dp.id_kios = $idKios
        LEFT JOIN alamat_pengguna ap ON ps.id_alamat = ap.id_alamat
        LEFT JOIN pembayaran py ON py.id_pesanan = ps.id_pesanan
        WHERE 1=1 $statusFilter
        ORDER BY ps.created_at DESC
    ");
    $stmt->execute();
    $pesananList = $stmt->fetchAll();
    
    // Tambahkan items per pesanan (hanya item dari kios ini)
    foreach ($pesananList as &$ps) {
        $itemStmt = $db->prepare("
            SELECT dp.nama_produk AS nama, dp.jumlah, dp.harga_satuan AS harga, dp.subtotal_harga AS subtotal, dp.foto_produk AS foto
            FROM detail_pesanan dp
            WHERE dp.id_pesanan = ? AND dp.id_kios = ?
        ");
        $itemStmt->execute([$ps['id'], $idKios]);
        $ps['items'] = $itemStmt->fetchAll();
    }
    unset($ps);
    
    sendSuccess($pesananList);
}

function verifikasiPembayaran(int $id): void {
    $user = requireAuth();
    $data = getRequestBody();
    $db   = getDB();
    $diterima = ($data['diterima'] ?? false) ? true : false;
    
    // Cek apakah user adalah admin ATAU pemilik kios yang terlibat dalam pesanan ini
    if ($user['peran'] !== 'admin') {
        $kStmt = $db->prepare("SELECT k.id_kios FROM kios k JOIN detail_pesanan dp ON dp.id_kios = k.id_kios WHERE dp.id_pesanan = ? AND k.id_pengguna = ? LIMIT 1");
        $kStmt->execute([$id, $user['id_pengguna']]);
        if (!$kStmt->fetch()) sendError('Tidak memiliki akses untuk memverifikasi pesanan ini', 403);
    }
    
    if ($diterima) {
        $db->prepare("UPDATE pembayaran SET status = 'diverifikasi', verified_at = NOW() WHERE id_pesanan = ?")->execute([$id]);
        $db->prepare("UPDATE pesanan SET status = 'diproses' WHERE id_pesanan = ?")->execute([$id]);
        
        // Auto-calculate commission
        $pStmt = $db->prepare("SELECT total_bayar, id_pesanan FROM pesanan WHERE id_pesanan = ?");
        $pStmt->execute([$id]);
        $pesanan = $pStmt->fetch();
        
        if ($pesanan) {
            $komisi = $pesanan['total_bayar'] * 0.10;
            $dStmt = $db->prepare("SELECT DISTINCT id_kios FROM detail_pesanan WHERE id_pesanan = ?");
            $dStmt->execute([$id]);
            foreach ($dStmt->fetchAll() as $d) {
                $db->prepare("INSERT INTO komisi (id_pesanan, id_kios, tipe, total_transaksi, persen_komisi, jumlah_komisi) VALUES (?,?,'produk',?,10,?) ON DUPLICATE KEY UPDATE jumlah_komisi = VALUES(jumlah_komisi)")
                   ->execute([$id, $d['id_kios'], $pesanan['total_bayar'], $komisi]);
            }
        }
        
        sendSuccess(null, 'Pembayaran berhasil diverifikasi');
    } else {
        $db->prepare("UPDATE pembayaran SET status = 'ditolak' WHERE id_pesanan = ?")->execute([$id]);
        $db->prepare("UPDATE pesanan SET status = 'menunggu_pembayaran' WHERE id_pesanan = ?")->execute([$id]);
        sendSuccess(null, 'Pembayaran ditolak, pembeli perlu upload ulang');
    }
}

function hitungOngkir(float $beratGram): float {
    if ($beratGram <= 1000) return 15000;
    if ($beratGram <= 5000) return 25000;
    if ($beratGram <= 10000) return 35000;
    return 50000;
}
