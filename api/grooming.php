<?php
// ============================================================
// PetPlace API — Grooming
// ============================================================
require_once __DIR__ . '/config.php';
setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = (int)($_GET['id'] ?? 0);
$action = $_GET['action'] ?? '';

if ($method === 'GET' && !$id && !$action) {
    listGrooming();
} elseif ($method === 'GET' && $id) {
    detailGrooming($id);
} elseif ($method === 'POST' && $action === 'daftar') {
    daftarGrooming();
} elseif ($method === 'PUT' && $id) {
    updateGrooming($id);
} elseif ($method === 'POST' && $action === 'approve' && $id) {
    approveGrooming($id);
} elseif ($method === 'POST' && $action === 'reject' && $id) {
    rejectGrooming($id);
} elseif ($method === 'POST' && $action === 'booking') {
    bookingGrooming();
} elseif ($method === 'GET' && $action === 'booking') {
    getBookingGrooming();
} else {
    sendError('Endpoint tidak ditemukan', 404);
}

function listGrooming(): void {
    $db = getDB();
    $where = ["g.status = 'aktif'"];
    $params = [];
    
    if (!empty($_GET['kota'])) { $where[] = "g.kota = ?"; $params[] = $_GET['kota']; }
    if (!empty($_GET['jenis'])) { $where[] = "(g.jenis_hewan = ? OR g.jenis_hewan = 'keduanya')"; $params[] = $_GET['jenis']; }
    if (!empty($_GET['q'])) { $where[] = "g.nama_usaha LIKE ?"; $params[] = '%' . $_GET['q'] . '%'; }
    
    $stmt = $db->prepare("
        SELECT g.id_grooming AS id, g.nama_usaha AS nama, g.deskripsi, g.foto,
               g.kota, g.lat, g.lng, g.alamat,
               TIME_FORMAT(g.jam_buka, '%H:%i') AS jamBuka,
               TIME_FORMAT(g.jam_tutup, '%H:%i') AS jamTutup,
               g.jenis_hewan AS jenisHewan, g.rating_avg AS rating,
               g.total_ulasan AS totalUlasan, g.no_rekening AS noRekening,
               g.nama_bank AS namaBank, g.status, g.verified
        FROM penyedia_grooming g
        WHERE " . implode(' AND ', $where) . "
        ORDER BY g.rating_avg DESC
    ");
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    
    // Get layanan for each
    foreach ($rows as &$g) {
        $lStmt = $db->prepare("SELECT id_layanan AS id, nama_layanan AS nama, harga, durasi_menit AS durasi, jenis_hewan AS jenisHewan FROM layanan_grooming WHERE id_grooming = ? AND status = 'aktif'");
        $lStmt->execute([$g['id']]);
        $g['layanan'] = $lStmt->fetchAll();
        $g['verified'] = (bool)$g['verified'];
    }
    
    sendSuccess($rows);
}

function detailGrooming(int $id): void {
    $db = getDB();
    $stmt = $db->prepare("
        SELECT g.id_grooming AS id, g.id_pengguna AS idPengguna, g.nama_usaha AS nama, g.deskripsi, g.foto,
               g.kota, g.lat, g.lng, g.alamat,
               TIME_FORMAT(g.jam_buka,'%H:%i') AS jamBuka, TIME_FORMAT(g.jam_tutup,'%H:%i') AS jamTutup,
               g.jenis_hewan AS jenisHewan, g.rating_avg AS rating, g.total_ulasan AS totalUlasan,
               g.no_rekening AS noRekening, g.nama_bank AS namaBank,
               g.status, g.verified, g.created_at AS createdAt
        FROM penyedia_grooming g
        WHERE g.id_grooming = ?
        LIMIT 1
    ");
    $stmt->execute([$id]);
    $grm = $stmt->fetch();
    if (!$grm) sendError('Grooming tidak ditemukan', 404);
    
    // Layanan
    $lStmt = $db->prepare("SELECT id_layanan AS id, nama_layanan AS nama, deskripsi, harga, durasi_menit AS durasi, jenis_hewan AS jenisHewan FROM layanan_grooming WHERE id_grooming = ? AND status = 'aktif'");
    $lStmt->execute([$id]);
    $grm['layanan'] = $lStmt->fetchAll();
    
    // Ulasan
    $ulStmt = $db->prepare("
        SELECT u.id_ulasan AS id, p.nama_lengkap AS nama, u.bintang, u.komentar, u.created_at AS tanggal
        FROM ulasan_grooming u
        JOIN pengguna p ON u.id_pengguna = p.id_pengguna
        WHERE u.id_grooming = ? AND u.status = 'aktif'
        ORDER BY u.created_at DESC LIMIT 10
    ");
    $ulStmt->execute([$id]);
    $grm['ulasan'] = $ulStmt->fetchAll();
    $grm['verified'] = (bool)$grm['verified'];
    
    sendSuccess($grm);
}

function daftarGrooming(): void {
    $user = requireAuth();
    $data = getRequestBody();
    $db   = getDB();
    
    $required = ['nama', 'namaBank', 'noRekening'];
    foreach ($required as $f) {
        if (empty($data[$f])) sendError("Field '$f' wajib diisi");
    }
    
    $db->prepare("
        INSERT INTO penyedia_grooming (id_pengguna, nama_usaha, deskripsi, foto, no_telepon, email, alamat, kota, lat, lng, jam_buka, jam_tutup, jenis_hewan, no_rekening, nama_bank, nama_pemilik_rek, status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending')
    ")->execute([
        $user['id_pengguna'],
        $data['nama'],
        $data['deskripsi'] ?? '',
        $data['foto'] ?? null,
        $data['telepon'] ?? '',
        $data['email'] ?? $user['email'],
        $data['alamat'] ?? '',
        $data['kota'] ?? 'Makassar',
        $data['lat'] ?? null,
        $data['lng'] ?? null,
        $data['jamBuka'] ?? '08:00',
        $data['jamTutup'] ?? '18:00',
        $data['jenisHewan'] ?? 'keduanya',
        $data['noRekening'],
        $data['namaBank'],
        $data['namaPemilikRek'] ?? '',
    ]);
    
    $grmId = $db->lastInsertId();
    
    // Insert layanan if provided
    if (!empty($data['layanan'])) {
        foreach ($data['layanan'] as $l) {
            $db->prepare("INSERT INTO layanan_grooming (id_grooming, nama_layanan, harga, durasi_menit, jenis_hewan) VALUES (?,?,?,?,?)")
               ->execute([$grmId, $l['nama'], (float)$l['harga'], (int)($l['durasi'] ?? 60), $l['jenisHewan'] ?? 'keduanya']);
        }
    }
    
    $db->prepare("UPDATE pengguna SET peran = 'grooming' WHERE id_pengguna = ?")->execute([$user['id_pengguna']]);
    
    sendSuccess(['id' => $grmId], 'Pendaftaran grooming berhasil! Menunggu verifikasi admin.');
}

function updateGrooming(int $id): void {
    $user = requireAuth();
    $db   = getDB();
    
    $stmt = $db->prepare("SELECT id_pengguna FROM penyedia_grooming WHERE id_grooming = ?");
    $stmt->execute([$id]);
    $grm = $stmt->fetch();
    if (!$grm) sendError('Grooming tidak ditemukan', 404);
    if ($user['peran'] !== 'admin' && $grm['id_pengguna'] != $user['id_pengguna']) sendError('Tidak memiliki akses', 403);
    
    $data = getRequestBody();
    $fields = []; $params = [];
    
    $map = ['nama' => 'nama_usaha', 'deskripsi' => 'deskripsi', 'foto' => 'foto', 'kota' => 'kota', 'alamat' => 'alamat', 'jamBuka' => 'jam_buka', 'jamTutup' => 'jam_tutup', 'jenisHewan' => 'jenis_hewan'];
    foreach ($map as $key => $col) {
        if (isset($data[$key])) { $fields[] = "$col = ?"; $params[] = $data[$key]; }
    }
    
    if (!empty($fields)) {
        $params[] = $id;
        $db->prepare("UPDATE penyedia_grooming SET " . implode(', ', $fields) . " WHERE id_grooming = ?")->execute($params);
    }
    
    sendSuccess(null, 'Data grooming diperbarui');
}

function approveGrooming(int $id): void {
    requireAdmin();
    $db = getDB();
    $stmt = $db->prepare("SELECT id_pengguna FROM penyedia_grooming WHERE id_grooming = ?");
    $stmt->execute([$id]);
    $grm = $stmt->fetch();
    if (!$grm) sendError('Grooming tidak ditemukan', 404);
    
    $db->prepare("UPDATE penyedia_grooming SET status = 'aktif', verified = 1 WHERE id_grooming = ?")->execute([$id]);
    $db->prepare("UPDATE pengguna SET peran = 'grooming', status = 'aktif' WHERE id_pengguna = ?")->execute([$grm['id_pengguna']]);
    sendSuccess(null, 'Grooming berhasil diverifikasi');
}

function rejectGrooming(int $id): void {
    requireAdmin();
    $db = getDB();
    $db->prepare("UPDATE penyedia_grooming SET status = 'nonaktif' WHERE id_grooming = ?")->execute([$id]);
    sendSuccess(null, 'Pendaftaran grooming ditolak');
}

function bookingGrooming(): void {
    $user = requireAuth();
    $data = getRequestBody();
    $db   = getDB();
    
    $required = ['idGrooming', 'idLayanan', 'tanggal', 'jam', 'namaHewan', 'jenisHewan'];
    foreach ($required as $f) {
        if (empty($data[$f])) sendError("Field '$f' wajib diisi");
    }
    
    $lStmt = $db->prepare("SELECT harga FROM layanan_grooming WHERE id_layanan = ?");
    $lStmt->execute([(int)$data['idLayanan']]);
    $layanan = $lStmt->fetch();
    if (!$layanan) sendError('Layanan tidak ditemukan');
    
    $db->prepare("
        INSERT INTO booking_grooming (id_pengguna, id_grooming, id_layanan, tanggal, jam, nama_hewan, jenis_hewan, ras_hewan, catatan, harga)
        VALUES (?,?,?,?,?,?,?,?,?,?)
    ")->execute([
        $user['id_pengguna'],
        (int)$data['idGrooming'],
        (int)$data['idLayanan'],
        $data['tanggal'],
        $data['jam'],
        $data['namaHewan'],
        $data['jenisHewan'],
        $data['rasHewan'] ?? '',
        $data['catatan'] ?? '',
        $layanan['harga'],
    ]);
    
    sendSuccess(['id' => $db->lastInsertId()], 'Booking grooming berhasil');
}

function getBookingGrooming(): void {
    $user = requireAuth();
    $db   = getDB();
    
    if ($user['peran'] === 'grooming') {
        $stmt = $db->prepare("
            SELECT b.*, p.nama_lengkap AS namaPembeli, g.nama_usaha AS namaGrooming, l.nama_layanan AS namaLayanan
            FROM booking_grooming b
            JOIN pengguna p ON b.id_pengguna = p.id_pengguna
            JOIN penyedia_grooming g ON b.id_grooming = g.id_grooming
            JOIN layanan_grooming l ON b.id_layanan = l.id_layanan
            WHERE g.id_pengguna = ?
            ORDER BY b.tanggal DESC
        ");
        $stmt->execute([$user['id_pengguna']]);
    } else {
        $stmt = $db->prepare("
            SELECT b.*, g.nama_usaha AS namaGrooming, l.nama_layanan AS namaLayanan
            FROM booking_grooming b
            JOIN penyedia_grooming g ON b.id_grooming = g.id_grooming
            JOIN layanan_grooming l ON b.id_layanan = l.id_layanan
            WHERE b.id_pengguna = ?
            ORDER BY b.tanggal DESC
        ");
        $stmt->execute([$user['id_pengguna']]);
    }
    
    sendSuccess($stmt->fetchAll());
}
