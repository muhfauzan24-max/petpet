<?php
// ============================================================
// PetPlace API — Admin
// ============================================================
require_once __DIR__ . '/config.php';
setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'stats':
        getStats();
        break;
    case 'pengguna':
        if ($method === 'GET') listPengguna();
        elseif ($method === 'PUT') updatePengguna();
        else sendError('Method not allowed', 405);
        break;
    case 'komisi':
        getKomisi();
        break;
    case 'laporan':
        getLaporan();
        break;
    case 'pending':
        getPending();
        break;
    case 'ulasan':
        if ($method === 'GET') listUlasan();
        break;
    case 'produk-kios':
        if ($method === 'GET') getProdukKios();
        else sendError('Method not allowed', 405);
        break;
    default:
        sendError('Action tidak ditemukan', 404);
}

function getStats(): void {
    requireAdmin();
    $db = getDB();
    
    $totalPengguna = (int)$db->query("SELECT COUNT(*) FROM pengguna WHERE peran != 'admin'")->fetchColumn();
    $totalKios     = (int)$db->query("SELECT COUNT(*) FROM kios WHERE status = 'aktif'")->fetchColumn();
    $totalDokter   = (int)$db->query("SELECT COUNT(*) FROM dokter_hewan WHERE status = 'aktif'")->fetchColumn();
    $totalGrooming = (int)$db->query("SELECT COUNT(*) FROM penyedia_grooming WHERE status = 'aktif'")->fetchColumn();
    $totalPesanan  = (int)$db->query("SELECT COUNT(*) FROM pesanan")->fetchColumn();
    $totalProduk   = (int)$db->query("SELECT COUNT(*) FROM produk WHERE status = 'aktif'")->fetchColumn();
    
    $totalKomisi   = (float)$db->query("SELECT COALESCE(SUM(jumlah_komisi),0) FROM komisi WHERE status = 'lunas'")->fetchColumn();
    $pendingKomisi = (float)$db->query("SELECT COALESCE(SUM(jumlah_komisi),0) FROM komisi WHERE status = 'pending'")->fetchColumn();
    
    $pendingKios   = (int)$db->query("SELECT COUNT(*) FROM kios WHERE status = 'pending'")->fetchColumn();
    $pendingDokter = (int)$db->query("SELECT COUNT(*) FROM dokter_hewan WHERE status = 'pending'")->fetchColumn();
    $pendingGrm    = (int)$db->query("SELECT COUNT(*) FROM penyedia_grooming WHERE status = 'pending'")->fetchColumn();
    $pendingBayar  = (int)$db->query("SELECT COUNT(*) FROM pembayaran WHERE status = 'menunggu'")->fetchColumn();
    
    // Today's transactions
    $today = date('Y-m-d');
    $todayPesanan = (int)$db->query("SELECT COUNT(*) FROM pesanan WHERE DATE(created_at) = '$today'")->fetchColumn();
    
    // Monthly revenue (last 6 months)
    $monthlyStmt = $db->query("
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS bulan,
               COUNT(*) AS jumlahPesanan,
               COALESCE(SUM(total_bayar), 0) AS totalPenjualan,
               COALESCE(SUM(total_bayar * 0.1), 0) AS totalKomisi
        FROM pesanan
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
          AND status NOT IN ('dibatalkan', 'menunggu_pembayaran')
        GROUP BY bulan
        ORDER BY bulan ASC
    ");
    $monthly = $monthlyStmt->fetchAll();
    
    sendSuccess([
        'totalPengguna' => $totalPengguna,
        'totalKios'     => $totalKios,
        'totalDokter'   => $totalDokter,
        'totalGrooming' => $totalGrooming,
        'totalPesanan'  => $totalPesanan,
        'totalProduk'   => $totalProduk,
        'totalKomisi'   => $totalKomisi,
        'pendingKomisi' => $pendingKomisi,
        'pendingKios'   => $pendingKios,
        'pendingDokter' => $pendingDokter,
        'pendingGrooming' => $pendingGrm,
        'pendingBayar'  => $pendingBayar,
        'totalPending'  => $pendingKios + $pendingDokter + $pendingGrm + $pendingBayar,
        'transaksiHariIni' => $todayPesanan,
        'monthly'       => $monthly,
    ]);
}

function listPengguna(): void {
    requireAdmin();
    $db = getDB();
    
    $where  = ['1=1'];
    $params = [];
    
    if (!empty($_GET['peran'])) { $where[] = "peran = ?"; $params[] = $_GET['peran']; }
    if (!empty($_GET['status'])) { $where[] = "status = ?"; $params[] = $_GET['status']; }
    if (!empty($_GET['q'])) { $where[] = "(nama_lengkap LIKE ? OR email LIKE ?)"; $params[] = '%' . $_GET['q'] . '%'; $params[] = '%' . $_GET['q'] . '%'; }
    
    $stmt = $db->prepare("
        SELECT id_pengguna AS id, nama_lengkap AS nama, email, no_telepon AS telepon,
               peran, status, foto_profil AS foto, created_at AS createdAt
        FROM pengguna
        WHERE " . implode(' AND ', $where) . "
        ORDER BY created_at DESC
        LIMIT 100
    ");
    $stmt->execute($params);
    sendSuccess($stmt->fetchAll());
}

function updatePengguna(): void {
    requireAdmin();
    $id   = (int)($_GET['id'] ?? 0);
    $data = getRequestBody();
    $db   = getDB();
    
    if (!$id) sendError('ID pengguna wajib diisi');
    
    $fields = [];
    $params = [];
    
    if (isset($data['status'])) { $fields[] = "status = ?"; $params[] = $data['status']; }
    if (isset($data['peran']))  { $fields[] = "peran = ?";  $params[] = $data['peran']; }
    
    if (empty($fields)) sendError('Tidak ada data untuk diubah');
    
    $params[] = $id;
    $db->prepare("UPDATE pengguna SET " . implode(', ', $fields) . " WHERE id_pengguna = ?")->execute($params);
    sendSuccess(null, 'Data pengguna diperbarui');
}

function getKomisi(): void {
    requireAdmin();
    $db = getDB();
    
    $stmt = $db->query("
        SELECT k.id_komisi AS id, k.tipe, k.total_transaksi AS totalTransaksi,
               k.persen_komisi AS persen, k.jumlah_komisi AS jumlah,
               k.status, k.created_at AS createdAt,
               ps.kode_pesanan AS kodePesanan,
               ki.nama_kios AS namaKios
        FROM komisi k
        LEFT JOIN pesanan ps ON k.id_pesanan = ps.id_pesanan
        LEFT JOIN kios ki ON k.id_kios = ki.id_kios
        ORDER BY k.created_at DESC
        LIMIT 100
    ");
    
    $rows = $stmt->fetchAll();
    
    $totalLunas   = array_sum(array_map(fn($r) => $r['status'] === 'lunas'   ? $r['jumlah'] : 0, $rows));
    $totalPending = array_sum(array_map(fn($r) => $r['status'] === 'pending' ? $r['jumlah'] : 0, $rows));
    
    sendSuccess([
        'komisi'       => $rows,
        'totalLunas'   => $totalLunas,
        'totalPending' => $totalPending,
        'totalKeseluruhan' => $totalLunas + $totalPending,
    ]);
}

function getLaporan(): void {
    requireAdmin();
    $db = getDB();
    
    // Top kios by revenue
    $topKiosStmt = $db->query("
        SELECT k.nama_kios AS namaKios, k.id_kios AS id,
               COUNT(DISTINCT dp.id_pesanan) AS totalPesanan,
               COALESCE(SUM(dp.subtotal_harga), 0) AS totalPenjualan
        FROM kios k
        LEFT JOIN detail_pesanan dp ON dp.id_kios = k.id_kios
        LEFT JOIN pesanan ps ON dp.id_pesanan = ps.id_pesanan AND ps.status NOT IN ('dibatalkan','menunggu_pembayaran')
        WHERE k.status = 'aktif'
        GROUP BY k.id_kios
        ORDER BY totalPenjualan DESC
        LIMIT 10
    ");
    $topKios = $topKiosStmt->fetchAll();
    
    // Top products
    $topProdukStmt = $db->query("
        SELECT p.nama_produk AS nama, p.terjual, p.rating_avg AS rating, k.nama_kios AS namaKios
        FROM produk p
        JOIN kios k ON p.id_kios = k.id_kios
        WHERE p.status = 'aktif'
        ORDER BY p.terjual DESC
        LIMIT 10
    ");
    $topProduk = $topProdukStmt->fetchAll();
    
    // Category breakdown
    $katStmt = $db->query("
        SELECT kp.nama_kategori AS nama, COUNT(p.id_produk) AS jumlahProduk, COALESCE(SUM(p.terjual),0) AS totalTerjual
        FROM kategori_produk kp
        LEFT JOIN produk p ON p.id_kategori = kp.id_kategori AND p.status = 'aktif'
        GROUP BY kp.id_kategori
        ORDER BY totalTerjual DESC
    ");
    $katBreakdown = $katStmt->fetchAll();
    
    // Monthly trend
    $trendStmt = $db->query("
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS bulan,
               COUNT(*) AS pesanan,
               COALESCE(SUM(total_bayar),0) AS pendapatan
        FROM pesanan
        WHERE status NOT IN ('dibatalkan', 'menunggu_pembayaran')
          AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY bulan
        ORDER BY bulan ASC
    ");
    $monthly = $trendStmt->fetchAll();
    
    sendSuccess([
        'topKios'       => $topKios,
        'topProduk'     => $topProduk,
        'katBreakdown'  => $katBreakdown,
        'monthly'       => $monthly,
    ]);
}

function getPending(): void {
    requireAdmin();
    $db = getDB();
    
    // Pending kios
    $kiosStmt = $db->query("
        SELECT k.id_kios AS id, k.nama_kios AS namaKios, k.no_telepon AS telepon,
               k.nama_bank AS namaBank, k.no_rekening AS noRekening, k.nama_pemilik_rek AS namaPemilik,
               k.created_at AS createdAt, p.nama_lengkap AS namaPengguna, p.email
        FROM kios k
        JOIN pengguna p ON k.id_pengguna = p.id_pengguna
        WHERE k.status = 'pending'
        ORDER BY k.created_at DESC
    ");
    
    // Pending dokter
    $dokStmt = $db->query("
        SELECT d.id_dokter AS id, d.nama_dokter AS nama, d.spesialisasi, d.no_str AS noStr,
               d.harga_konsultasi AS harga, d.created_at AS createdAt, p.email
        FROM dokter_hewan d
        JOIN pengguna p ON d.id_pengguna = p.id_pengguna
        WHERE d.status = 'pending'
        ORDER BY d.created_at DESC
    ");
    
    // Pending grooming
    $grmStmt = $db->query("
        SELECT g.id_grooming AS id, g.nama_usaha AS nama, g.kota, g.created_at AS createdAt, p.email
        FROM penyedia_grooming g
        JOIN pengguna p ON g.id_pengguna = p.id_pengguna
        WHERE g.status = 'pending'
        ORDER BY g.created_at DESC
    ");
    
    // Pending payment
    $bayarStmt = $db->query("
        SELECT pb.id_pembayaran AS id, pb.jumlah_bayar AS jumlah, pb.nama_pengirim AS namaPengirim,
               pb.bukti_foto AS buktiFoto, pb.created_at AS createdAt,
               ps.kode_pesanan AS kodePesanan, ps.id_pesanan AS idPesanan
        FROM pembayaran pb
        JOIN pesanan ps ON pb.id_pesanan = ps.id_pesanan
        WHERE pb.status = 'menunggu'
        ORDER BY pb.created_at DESC
    ");
    
    sendSuccess([
        'pendingKios'    => $kiosStmt->fetchAll(),
        'pendingDokter'  => $dokStmt->fetchAll(),
        'pendingGrooming' => $grmStmt->fetchAll(),
        'pendingBayar'   => $bayarStmt->fetchAll(),
    ]);
}

function listUlasan(): void {
    requireAdmin();
    $db = getDB();
    
    $stmt = $db->query("
        SELECT u.id_ulasan AS id, 'produk' AS tipe, p.nama_produk AS target,
               pu.nama_lengkap AS nama, u.bintang, u.komentar, u.status, u.created_at AS tanggal
        FROM ulasan_produk u
        JOIN produk p ON u.id_produk = p.id_produk
        JOIN pengguna pu ON u.id_pengguna = pu.id_pengguna
        ORDER BY u.created_at DESC
        LIMIT 50
    ");
    
    sendSuccess($stmt->fetchAll());
}

function getProdukKios(): void {
    requireAdmin();
    $db = getDB();

    $where  = ['1=1'];
    $params = [];

    if (!empty($_GET['idKios'])) {
        $where[]  = 'p.id_kios = ?';
        $params[] = (int)$_GET['idKios'];
    }
    if (!empty($_GET['status'])) {
        $where[]  = "p.status = ?";
        $params[] = $_GET['status'];
    }
    if (!empty($_GET['q'])) {
        $where[]  = 'p.nama_produk LIKE ?';
        $params[] = '%' . $_GET['q'] . '%';
    }

    $limit  = min((int)($_GET['limit'] ?? 30), 100);
    $offset = (int)($_GET['offset'] ?? 0);

    // Produk dengan total dipesan dan dari kios mana
    $sql = "
        SELECT p.id_produk AS id, p.nama_produk AS nama,
               p.harga, p.harga_diskon AS hargaDiskon,
               p.foto_utama AS foto, p.terjual,
               p.rating_avg AS rating, p.status,
               p.created_at AS createdAt,
               ANY_VALUE(k.id_kios) AS idKios,
               ANY_VALUE(k.nama_kios) AS namaKios,
               ANY_VALUE(k.no_telepon) AS teleponKios,
               ANY_VALUE(sp.jumlah_stok) AS stok,
               ANY_VALUE(kp.nama_kategori) AS namaKategori,
               COALESCE(SUM(dp.jumlah), 0) AS totalDipesan,
               COUNT(DISTINCT dp.id_pesanan) AS totalPesanan
        FROM produk p
        JOIN kios k ON p.id_kios = k.id_kios
        JOIN kategori_produk kp ON p.id_kategori = kp.id_kategori
        LEFT JOIN stok_produk sp ON sp.id_produk = p.id_produk
        LEFT JOIN detail_pesanan dp ON dp.id_produk = p.id_produk
        WHERE " . implode(' AND ', $where) . "
        GROUP BY p.id_produk
        ORDER BY totalDipesan DESC, p.created_at DESC
        LIMIT $limit OFFSET $offset
    ";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $countSql = "SELECT COUNT(DISTINCT p.id_produk) FROM produk p JOIN kios k ON p.id_kios = k.id_kios WHERE " . implode(' AND ', $where);
    $cStmt    = $db->prepare($countSql);
    $cStmt->execute($params);
    $total    = (int)$cStmt->fetchColumn();

    sendSuccess(['produk' => $rows, 'total' => $total]);
}
